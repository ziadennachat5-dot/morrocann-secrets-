import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import {
  emptyExperienceDraft,
  emptyFamilyDraft,
  emptyLocalizedFields,
  duplicateExperienceId,
  isValidCurrencyCode,
  localizedIncludedItems,
  localizedLines,
  type ExperienceDraft,
  type FamilyDraft,
  type LocalizedFields,
} from "@/lib/admin-catalog";
import { parseExperienceImages } from "@/lib/photos";

type Experience = Tables<"experiences">;
type Family = Tables<"host_families">;
type Review = Tables<"reviews">;
type Section = "experiences" | "families" | "reviews";

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CatalogManager({
  section,
  experiences,
  families,
  reviews,
  currency,
  onSaveCurrency,
  onRefresh,
  onError,
}: {
  section: Section;
  experiences: Experience[];
  families: Family[];
  reviews: Review[];
  currency: string;
  onSaveCurrency: (value: string) => Promise<void>;
  onRefresh: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [experience, setExperience] = useState<ExperienceDraft>(emptyExperienceDraft);
  const [family, setFamily] = useState<FamilyDraft>(emptyFamilyDraft);
  const [experienceImage, setExperienceImage] = useState<File | null>(null);
  const [experienceImages, setExperienceImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [duplicatedImageUrl, setDuplicatedImageUrl] = useState("");
  const [experienceErrors, setExperienceErrors] = useState<string[]>([]);
  const [openExperienceGroups, setOpenExperienceGroups] = useState(
    () => new Set(["basics", "pricing", "photo"]),
  );
  const [familyImage, setFamilyImage] = useState<File | null>(null);
  const [currencyDraft, setCurrencyDraft] = useState(currency);
  const [currencyBusy, setCurrencyBusy] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [experienceFileKey, setExperienceFileKey] = useState(0);
  const [familyFileKey, setFamilyFileKey] = useState(0);

  useEffect(() => {
    setCurrencyDraft(currency);
  }, [currency]);

  function setExperienceGroupOpen(group: string, isOpen: boolean) {
    setOpenExperienceGroups((current) => {
      const next = new Set(current);
      if (isOpen) next.add(group);
      else next.delete(group);
      return next;
    });
  }

  async function saveExperience(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExperienceErrors([]);
    const errors: string[] = [];
    if (!isValidSlug(experience.id))
      errors.push("Experience ID must use lowercase letters, numbers, and single hyphens.");
    if (
      [experience.title, experience.description, experience.duration].some(
        (fields) => !fields.en.trim(),
      )
    )
      errors.push(
        "Enter the title, description, and duration in English. French and Arabic are optional.",
      );
    if (!isValidCurrencyCode(currency))
      errors.push("Set the shared booking currency before saving an experience.");
    const price = Number(experience.price);
    const childPrice = experience.childPrice === "" ? null : Number(experience.childPrice);
    const maxGuests = Number(experience.maxGuests);
    const minGuests = Number(experience.minGuests);
    if (
      experience.price.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      (childPrice !== null && (!Number.isFinite(childPrice) || childPrice < 0)) ||
      !Number.isInteger(maxGuests) ||
      !Number.isInteger(minGuests) ||
      minGuests < 1 ||
      minGuests > maxGuests ||
      maxGuests < 1 ||
      maxGuests > 25
    ) {
      errors.push(
        "Enter valid prices and guest limits (minimum at least 1 and maximum at most 25).",
      );
    }
    const childAgeMin = experience.childAgeMin === "" ? null : Number(experience.childAgeMin);
    const childAgeMax = experience.childAgeMax === "" ? null : Number(experience.childAgeMax);
    if (
      (childPrice === null && (childAgeMin !== null || childAgeMax !== null)) ||
      (childPrice !== null &&
        (!Number.isInteger(childAgeMin) ||
          !Number.isInteger(childAgeMax) ||
          (childAgeMin ?? 0) < 1 ||
          (childAgeMax ?? 0) < (childAgeMin ?? 0) ||
          (childAgeMax ?? 0) > 120))
    ) {
      errors.push("Set a valid child age range when a child price is configured.");
    }
    if (experience.startTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(experience.startTime)) {
      errors.push("Enter the fixed start time in 24-hour HH:MM format.");
    }
    if (hasAnyTranslation(experience.imageAlt) && !experience.imageAlt.en.trim()) {
      errors.push("Provide image alt text in English, or leave it blank.");
    }
    const { items: included, error: includedError } = localizedIncludedItems(experience.included);
    if (includedError) errors.push(`What's included: ${includedError}`);
    const { items: mealOptions, error: mealOptionsError } = localizedLines(experience.mealOptions);
    if (mealOptionsError) errors.push(`Meal options: ${mealOptionsError}`);
    if (experience.whyLove.some((bullet) => hasAnyTranslation(bullet) && !bullet.en.trim()))
      errors.push(
        "Enter each 'Why you'll love this' bullet in English; French and Arabic are optional.",
      );
    const optionalLocalized = [
      experience.whatToExpect,
      experience.whatToRemember,
      experience.hostLanguages,
    ];
    if (optionalLocalized.some((fields) => hasAnyTranslation(fields) && !fields.en.trim()))
      errors.push("Enter each optional content block in English; French and Arabic are optional.");
    const existing = experiences.find((item) => item.id === experience.id);
    const hasImage =
      existing ||
      experienceImage ||
      experienceImages.length > 0 ||
      duplicatedImageUrl ||
      existingImages.length > 0;
    if (!hasImage) {
      errors.push("Upload an experience image before creating it.");
    }
    if (errors.length > 0) {
      setExperienceErrors(errors);
      return;
    }

    setFormBusy(true);
    const filesToUpload =
      experienceImages.length > 0 ? experienceImages : experienceImage ? [experienceImage] : [];
    const uploadedUrls: string[] = [];
    const uploadedPaths: string[] = [];
    for (const file of filesToUpload) {
      const up = await uploadMedia(file, "experiences");
      if (up) {
        uploadedUrls.push(up.url);
        uploadedPaths.push(up.path);
      }
    }
    if (filesToUpload.length > 0 && uploadedUrls.length === 0) {
      setFormBusy(false);
      return;
    }

    const allUrls = [...existingImages, ...uploadedUrls];
    let finalImageUrl = existing?.image_url ?? duplicatedImageUrl ?? "";
    if (allUrls.length > 0) {
      finalImageUrl = allUrls.length === 1 ? allUrls[0]! : JSON.stringify(allUrls);
    }

    const record = {
      id: experience.id,
      title: trimFields(experience.title),
      blurb: trimFields(experience.description),
      duration: trimFields(experience.duration),
      price,
      child_price: childPrice,
      child_age_min: childAgeMin,
      child_age_max: childAgeMax,
      min_guests: minGuests,
      max_guests: maxGuests,
      start_time: experience.startTime || null,
      meal_options: mealOptions,
      image_url: finalImageUrl,
      image_alt: optionalLocalizedFields(experience.imageAlt),
      included,
      why_love: experience.whyLove.filter((bullet) => bullet.en.trim()).map(trimFields),
      what_to_expect: optionalLocalizedFields(experience.whatToExpect),
      what_to_remember: optionalLocalizedFields(experience.whatToRemember),
      host_languages: optionalLocalizedFields(experience.hostLanguages),
      is_published: experience.published,
      updated_at: new Date().toISOString(),
    };
    const result = existing
      ? await supabase.from("experiences").update(record).eq("id", experience.id)
      : await supabase.from("experiences").insert({
          ...record,
          deposit_amount: 0,
        });
    if (result.error) {
      for (const p of uploadedPaths) {
        await removeMedia(p);
      }
      onError(`Could not save experience: ${result.error.message}`);
      setFormBusy(false);
      return;
    }
    resetExperience();
    await onRefresh();
    setFormBusy(false);
  }

  async function saveFamily(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidSlug(family.id)) {
      onError("Family ID must use lowercase letters, numbers, and single hyphens.");
      return;
    }
    if (
      [
        family.name,
        family.neighbourhood,
        family.languages,
        family.signatureDish,
        family.story,
      ].some((fields) => !hasAllTranslations(fields))
    ) {
      onError("Enter all host-family details in EN, FR, and AR.");
      return;
    }
    if (hasAnyTranslation(family.imageAlt) && !hasAllTranslations(family.imageAlt)) {
      onError("Provide image alt text in all three languages, or leave all three blank.");
      return;
    }
    const existing = families.find((item) => item.id === family.id);
    if (!existing && !familyImage) {
      onError("Upload a host-family photo before creating the profile.");
      return;
    }

    setFormBusy(true);
    const uploaded = familyImage ? await uploadMedia(familyImage, "host-families") : null;
    if (familyImage && !uploaded) {
      setFormBusy(false);
      return;
    }
    const record = {
      id: family.id,
      name: trimFields(family.name),
      area: trimFields(family.neighbourhood),
      languages: trimFields(family.languages),
      signature_dish: trimFields(family.signatureDish),
      story: trimFields(family.story),
      image_url: uploaded?.url ?? existing?.image_url ?? "",
      image_alt: optionalLocalizedFields(family.imageAlt),
      is_published: family.published,
      updated_at: new Date().toISOString(),
    };
    const result = existing
      ? await supabase.from("host_families").update(record).eq("id", family.id)
      : await supabase.from("host_families").insert(record);
    if (result.error) {
      const cleanupError = uploaded ? await removeMedia(uploaded.path) : null;
      onError(
        `Could not save host family: ${result.error.message}${cleanupError ? ` Image cleanup also failed: ${cleanupError}` : ""}`,
      );
      setFormBusy(false);
      return;
    }
    resetFamily();
    await onRefresh();
    setFormBusy(false);
  }

  async function togglePublishExperience(item: Experience) {
    const { error } = await supabase
      .from("experiences")
      .update({ is_published: !item.is_published, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) onError(`Could not update experience: ${error.message}`);
    else await onRefresh();
  }

  async function deleteExperience(item: Experience) {
    if (!window.confirm(`Delete experience "${item.id}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("experiences").delete().eq("id", item.id);
    if (error) onError(`Could not delete experience: ${error.message}`);
    else await onRefresh();
  }

  async function deleteFamily(item: Family) {
    if (!window.confirm(`Delete host family "${item.id}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("host_families").delete().eq("id", item.id);
    if (error) onError(`Could not delete host family: ${error.message}`);
    else await onRefresh();
  }

  async function setReviewApproval(review: Review, approved: boolean) {
    const { error } = await supabase.from("reviews").update({ approved }).eq("id", review.id);
    if (error) onError(`Could not update review moderation: ${error.message}`);
    else await onRefresh();
  }

  function editExperience(item: Experience) {
    setExperience(experienceDraftFrom(item));
    setExperienceImage(null);
    setExperienceImages([]);
    setExistingImages(parseExperienceImages(item.image_url));
    setDuplicatedImageUrl("");
    setExperienceErrors([]);
    setExperienceFileKey((key) => key + 1);
  }

  function duplicateExperience(item: Experience) {
    setExperience(
      experienceDraftFrom(
        item,
        duplicateExperienceId(
          item.id,
          experiences.map((experience) => experience.id),
        ),
        false,
      ),
    );
    setExperienceImage(null);
    setExperienceImages([]);
    setExistingImages(parseExperienceImages(item.image_url));
    setDuplicatedImageUrl(item.image_url);
    setExperienceErrors([]);
    setExperienceFileKey((key) => key + 1);
  }

  function editFamily(item: Family) {
    setFamily({
      id: item.id,
      name: readLocalized(item.name),
      neighbourhood: readLocalized(item.area),
      languages: readLocalized(item.languages),
      signatureDish: readLocalized(item.signature_dish),
      story: readLocalized(item.story),
      imageAlt: readLocalized(item.image_alt),
      published: item.is_published,
    });
    setFamilyImage(null);
    setFamilyFileKey((key) => key + 1);
  }

  function resetExperience() {
    setExperience(emptyExperienceDraft());
    setExperienceImage(null);
    setExperienceImages([]);
    setExistingImages([]);
    setDuplicatedImageUrl("");
    setExperienceErrors([]);
    setExperienceFileKey((key) => key + 1);
  }

  function resetFamily() {
    setFamily(emptyFamilyDraft());
    setFamilyImage(null);
    setFamilyFileKey((key) => key + 1);
  }

  if (section === "experiences") {
    return (
      <section className="mt-6 grid gap-8 xl:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">Experiences</h2>
          <form
            onSubmit={(event) => void saveCurrency(event)}
            className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border p-4"
          >
            <label className="block text-sm">
              Shared booking currency (ISO 4217)
              <input
                className={`${inputClass} mt-1`}
                required
                minLength={3}
                maxLength={3}
                pattern="[A-Z]{3}"
                value={currencyDraft}
                onChange={(event) => setCurrencyDraft(event.target.value.toUpperCase())}
              />
            </label>
            <Button type="submit" disabled={currencyBusy}>
              Save currency
            </Button>
          </form>
          <p className="mt-2 text-sm text-muted-foreground">
            This currency is shared by all experience prices and booking totals.
          </p>
          {experiences.length === 0 ? (
            <p className="mt-4 text-muted-foreground">No experiences have been created.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {experiences.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"
                >
                  <span>
                    <strong>{readLocalized(item.title).en || item.id}</strong>{" "}
                    <small className="text-muted-foreground">
                      · {item.price} {currency || "currency unset"} ·{" "}
                      {item.is_published ? "Published" : "Draft"}
                    </small>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={item.is_published ? "outline" : "default"}
                      className="min-h-11"
                      onClick={() => void togglePublishExperience(item)}
                    >
                      {item.is_published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-11"
                      onClick={() => editExperience(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-11"
                      onClick={() => duplicateExperience(item)}
                    >
                      Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-11 text-destructive"
                      onClick={() => void deleteExperience(item)}
                    >
                      Delete
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form
          noValidate
          onSubmit={(event) => void saveExperience(event)}
          className="space-y-3 rounded-lg border p-4"
        >
          <h3 className="text-xl font-semibold">
            {experience.id && experiences.some((item) => item.id === experience.id)
              ? "Edit experience"
              : "Create experience draft"}
          </h3>
          {experienceErrors.length > 0 && (
            <ul
              role="alert"
              className="list-disc space-y-1 rounded-md border border-destructive p-3 ps-8 text-sm text-destructive"
            >
              {experienceErrors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}
          <details
            open={openExperienceGroups.has("basics")}
            onToggle={(event) => setExperienceGroupOpen("basics", event.currentTarget.open)}
            className="rounded-md border p-3"
          >
            <summary className="cursor-pointer font-semibold">Basics</summary>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                URL ID
                <input
                  className={`${inputClass} mt-1`}
                  required
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  disabled={experiences.some((item) => item.id === experience.id)}
                  value={experience.id}
                  onChange={(event) =>
                    setExperience((current) => ({ ...current, id: event.target.value }))
                  }
                />
              </label>
              <LocalizedInputs
                label="Title"
                value={experience.title}
                requiredLanguages={["en"]}
                languages={["en"]}
                onChange={(title) => setExperience((current) => ({ ...current, title }))}
              />
              <LocalizedInputs
                label="Description"
                value={experience.description}
                multiline
                requiredLanguages={["en"]}
                languages={["en"]}
                onChange={(description) =>
                  setExperience((current) => ({ ...current, description }))
                }
              />
              <LocalizedInputs
                label="Duration"
                value={experience.duration}
                requiredLanguages={["en"]}
                languages={["en"]}
                onChange={(duration) => setExperience((current) => ({ ...current, duration }))}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={experience.published}
                  onChange={(event) =>
                    setExperience((current) => ({ ...current, published: event.target.checked }))
                  }
                />
                Publish this experience
              </label>
            </div>
          </details>
          <details
            open={openExperienceGroups.has("pricing")}
            onToggle={(event) => setExperienceGroupOpen("pricing", event.currentTarget.open)}
            className="rounded-md border p-3"
          >
            <summary className="cursor-pointer font-semibold">Pricing and capacity</summary>
            <div className="mt-4 space-y-3">
              <h4 className="pt-3 font-semibold">Pricing and group limits</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  Adult price ({currency || "set shared currency"})
                  <input
                    className={`${inputClass} mt-1`}
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={experience.price}
                    onChange={(event) =>
                      setExperience((current) => ({ ...current, price: event.target.value }))
                    }
                  />
                </label>
                <label className="block text-sm">
                  Child price (optional)
                  <input
                    className={`${inputClass} mt-1`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={experience.childPrice}
                    onChange={(event) =>
                      setExperience((current) => ({ ...current, childPrice: event.target.value }))
                    }
                  />
                </label>
                <label className="block text-sm">
                  Child age from
                  <input
                    className={`${inputClass} mt-1`}
                    type="number"
                    min="1"
                    max="120"
                    disabled={!experience.childPrice}
                    value={experience.childAgeMin}
                    onChange={(event) =>
                      setExperience((current) => ({ ...current, childAgeMin: event.target.value }))
                    }
                  />
                </label>
                <label className="block text-sm">
                  Child age to
                  <input
                    className={`${inputClass} mt-1`}
                    type="number"
                    min="1"
                    max="120"
                    disabled={!experience.childPrice}
                    value={experience.childAgeMax}
                    onChange={(event) =>
                      setExperience((current) => ({ ...current, childAgeMax: event.target.value }))
                    }
                  />
                </label>
                <p className="text-sm text-muted-foreground sm:col-span-2">
                  Infants are free and are not counted toward availability capacity.
                </p>
                <label className="block text-sm">
                  Minimum guests (adults and children)
                  <input
                    className={`${inputClass} mt-1`}
                    type="number"
                    min="1"
                    max="25"
                    step="1"
                    required
                    value={experience.minGuests}
                    onChange={(event) =>
                      setExperience((current) => ({ ...current, minGuests: event.target.value }))
                    }
                  />
                </label>
                <label className="block text-sm">
                  Maximum guests (adults and children)
                  <input
                    className={`${inputClass} mt-1`}
                    type="number"
                    min={experience.minGuests || 1}
                    max="25"
                    step="1"
                    required
                    value={experience.maxGuests}
                    onChange={(event) =>
                      setExperience((current) => ({ ...current, maxGuests: event.target.value }))
                    }
                  />
                </label>
                <label className="block text-sm">
                  Fixed start time
                  <input
                    className={`${inputClass} mt-1`}
                    type="time"
                    value={experience.startTime}
                    onChange={(event) =>
                      setExperience((current) => ({ ...current, startTime: event.target.value }))
                    }
                  />
                </label>
              </div>
            </div>
          </details>
          <details
            open={openExperienceGroups.has("content")}
            onToggle={(event) => setExperienceGroupOpen("content", event.currentTarget.open)}
            className="rounded-md border p-3"
          >
            <summary className="cursor-pointer font-semibold">More options</summary>
            <div className="mt-4 space-y-3">
              <h4 className="pt-3 font-semibold">Optional French and Arabic translations</h4>
              <LocalizedInputs
                label="Title translations"
                value={experience.title}
                required={false}
                languages={["fr", "ar"]}
                onChange={(title) => setExperience((current) => ({ ...current, title }))}
              />
              <LocalizedInputs
                label="Description translations"
                value={experience.description}
                multiline
                required={false}
                languages={["fr", "ar"]}
                onChange={(description) =>
                  setExperience((current) => ({ ...current, description }))
                }
              />
              <LocalizedInputs
                label="Duration translations"
                value={experience.duration}
                required={false}
                languages={["fr", "ar"]}
                onChange={(duration) => setExperience((current) => ({ ...current, duration }))}
              />
              <h4 className="pt-3 font-semibold">
                Meal options (optional, one translated option per line)
              </h4>
              <LocalizedInputs
                label="Available meal choices"
                value={experience.mealOptions}
                multiline
                required={false}
                onChange={(mealOptions) =>
                  setExperience((current) => ({ ...current, mealOptions }))
                }
              />
              <LocalizedInputs
                label="What's included (one translated item per line)"
                value={experience.included}
                multiline
                required={false}
                onChange={(included) => setExperience((current) => ({ ...current, included }))}
              />
              <h4 className="pt-3 font-semibold">Experience page content (optional)</h4>
              {experience.whyLove.map((bullet, index) => (
                <LocalizedInputs
                  key={index}
                  label={`Why you'll love this — bullet ${index + 1}`}
                  value={bullet}
                  required={false}
                  onChange={(value) =>
                    setExperience((current) => ({
                      ...current,
                      whyLove: current.whyLove.map((item, itemIndex) =>
                        itemIndex === index ? value : item,
                      ) as ExperienceDraft["whyLove"],
                    }))
                  }
                />
              ))}
              <LocalizedInputs
                label="What to expect"
                value={experience.whatToExpect}
                multiline
                required={false}
                onChange={(whatToExpect) =>
                  setExperience((current) => ({ ...current, whatToExpect }))
                }
              />
              <LocalizedInputs
                label="What to remember"
                value={experience.whatToRemember}
                multiline
                required={false}
                onChange={(whatToRemember) =>
                  setExperience((current) => ({ ...current, whatToRemember }))
                }
              />
              <LocalizedInputs
                label="Languages spoken by the host"
                value={experience.hostLanguages}
                required={false}
                onChange={(hostLanguages) =>
                  setExperience((current) => ({ ...current, hostLanguages }))
                }
              />
            </div>
          </details>
          <details
            open={openExperienceGroups.has("photo")}
            onToggle={(event) => setExperienceGroupOpen("photo", event.currentTarget.open)}
            className="rounded-md border p-3"
          >
            <summary className="cursor-pointer font-semibold">Photo</summary>
            <div className="mt-4 space-y-3">
              <LocalizedInputs
                label="Image alt text (optional)"
                value={experience.imageAlt}
                required={false}
                onChange={(imageAlt) => setExperience((current) => ({ ...current, imageAlt }))}
              />
              <label className="block text-sm">
                Photos upload (upload several)
                <input
                  key={experienceFileKey}
                  className={`${inputClass} mt-1`}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  required={
                    !experiences.some((item) => item.id === experience.id) &&
                    existingImages.length === 0
                  }
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    setExperienceImages(files);
                    setExperienceImage(files[0] ?? null);
                  }}
                />
              </label>
              {existingImages.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Current photos ({existingImages.length})
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {existingImages.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative group w-20 h-20 rounded-md overflow-hidden border"
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setExistingImages((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold transition-opacity"
                          title="Remove photo"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {experienceImages.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    New photos to upload ({experienceImages.length})
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {experienceImages.map((file, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 rounded-md overflow-hidden border bg-muted flex items-center justify-center text-xs text-center p-1"
                      >
                        <span className="line-clamp-2">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {duplicatedImageUrl && !experienceImage && experienceImages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  The duplicated experience will reuse its existing photo unless you upload a
                  replacement.
                </p>
              )}
            </div>
          </details>
          <div className="flex gap-2">
            <Button type="submit" disabled={formBusy}>
              {formBusy ? "Saving…" : "Save experience"}
            </Button>
            {experience.id && (
              <Button type="button" variant="outline" onClick={resetExperience}>
                Clear
              </Button>
            )}
          </div>
        </form>
      </section>
    );
  }

  if (section === "families") {
    return (
      <section className="mt-6 grid gap-8 xl:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold">Host families</h2>
          {families.length === 0 ? (
            <p className="mt-4 text-muted-foreground">No host-family profiles have been created.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {families.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"
                >
                  <span>
                    <strong>{readLocalized(item.name).en || item.id}</strong>{" "}
                    <small className="text-muted-foreground">
                      · {item.is_published ? "Published" : "Draft"}
                    </small>
                  </span>
                  <span className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => editFamily(item)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void deleteFamily(item)}>
                      Delete
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form
          onSubmit={(event) => void saveFamily(event)}
          className="space-y-3 rounded-lg border p-4"
        >
          <h3 className="text-xl font-semibold">
            {family.id && families.some((item) => item.id === family.id)
              ? "Edit host family"
              : "Create host-family draft"}
          </h3>
          <label className="block text-sm">
            URL ID
            <input
              className={`${inputClass} mt-1`}
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              disabled={families.some((item) => item.id === family.id)}
              value={family.id}
              onChange={(event) => setFamily((current) => ({ ...current, id: event.target.value }))}
            />
          </label>
          <LocalizedInputs
            label="Family name"
            value={family.name}
            onChange={(name) => setFamily((current) => ({ ...current, name }))}
          />
          <LocalizedInputs
            label="Neighbourhood"
            value={family.neighbourhood}
            onChange={(neighbourhood) => setFamily((current) => ({ ...current, neighbourhood }))}
          />
          <LocalizedInputs
            label="Languages"
            value={family.languages}
            onChange={(languages) => setFamily((current) => ({ ...current, languages }))}
          />
          <LocalizedInputs
            label="Signature dish"
            value={family.signatureDish}
            onChange={(signatureDish) => setFamily((current) => ({ ...current, signatureDish }))}
          />
          <LocalizedInputs
            label="Story"
            value={family.story}
            multiline
            onChange={(story) => setFamily((current) => ({ ...current, story }))}
          />
          <LocalizedInputs
            label="Photo alt text (optional)"
            value={family.imageAlt}
            required={false}
            onChange={(imageAlt) => setFamily((current) => ({ ...current, imageAlt }))}
          />
          <label className="block text-sm">
            Photo upload (media bucket)
            <input
              key={familyFileKey}
              className={`${inputClass} mt-1`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required={!families.some((item) => item.id === family.id)}
              onChange={(event) => setFamilyImage(event.target.files?.[0] ?? null)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={family.published}
              onChange={(event) =>
                setFamily((current) => ({ ...current, published: event.target.checked }))
              }
            />
            Publish this host profile
          </label>
          <div className="flex gap-2">
            <Button type="submit" disabled={formBusy}>
              {formBusy ? "Saving…" : "Save host family"}
            </Button>
            {family.id && (
              <Button type="button" variant="outline" onClick={resetFamily}>
                Clear
              </Button>
            )}
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="mt-6">
      <h2 className="text-2xl font-semibold">Guest review moderation</h2>
      {reviews.length === 0 ? (
        <p className="mt-4 text-muted-foreground">No guest reviews have been submitted.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-lg border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {review.author} · {review.rating}/5
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">
                    {localizedValue(review.quote, review.language)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {review.origin || "Origin not provided"} · {review.language.toUpperCase()} ·{" "}
                    {review.approved ? "Approved" : "Pending / rejected"}
                  </p>
                </div>
                <span className="flex gap-2">
                  <Button
                    size="sm"
                    variant={review.approved ? "outline" : "default"}
                    onClick={() => void setReviewApproval(review, true)}
                    disabled={review.approved}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void setReviewApproval(review, false)}
                    disabled={!review.approved}
                  >
                    Reject
                  </Button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  async function saveCurrency(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidCurrencyCode(currencyDraft)) {
      onError("Currency must be a valid three-letter uppercase ISO code.");
      return;
    }
    setCurrencyBusy(true);
    await onSaveCurrency(currencyDraft);
    setCurrencyBusy(false);
  }

  async function uploadMedia(
    file: File,
    folder: "experiences" | "host-families",
  ): Promise<{ url: string; path: string } | null> {
    const extensionByType: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    const extension = extensionByType[file.type];
    if (!extension || file.size > 10 * 1024 * 1024) {
      onError("Choose a JPEG, PNG, WebP, or GIF image no larger than 10 MB.");
      return null;
    }
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("media").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      onError(`Could not upload image to the media bucket: ${error.message}`);
      return null;
    }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return { url: data.publicUrl, path };
  }

  async function removeMedia(path: string): Promise<string | null> {
    const { error } = await supabase.storage.from("media").remove([path]);
    return error?.message ?? null;
  }
}

function LocalizedInputs({
  label,
  value,
  onChange,
  multiline = false,
  required = true,
  requiredLanguages,
  languages,
}: {
  label: string;
  value: LocalizedFields;
  onChange: (value: LocalizedFields) => void;
  multiline?: boolean;
  required?: boolean;
  requiredLanguages?: (keyof LocalizedFields)[];
  languages?: (keyof LocalizedFields)[];
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="font-medium">{label}</legend>
      {(["en", "fr", "ar"] as const)
        .filter((language) => languages?.includes(language) ?? true)
        .map((language) => (
          <label key={language} className="block text-sm">
            {language.toUpperCase()}
            {!required || (requiredLanguages && !requiredLanguages.includes(language))
              ? " (optional)"
              : ""}
            {multiline ? (
              <textarea
                dir={language === "ar" ? "rtl" : "ltr"}
                className={`${inputClass} mt-1`}
                rows={3}
                maxLength={5000}
                required={requiredLanguages ? requiredLanguages.includes(language) : required}
                value={value[language]}
                onChange={(event) => onChange({ ...value, [language]: event.target.value })}
              />
            ) : (
              <input
                dir={language === "ar" ? "rtl" : "ltr"}
                className={`${inputClass} mt-1`}
                maxLength={500}
                required={requiredLanguages ? requiredLanguages.includes(language) : required}
                value={value[language]}
                onChange={(event) => onChange({ ...value, [language]: event.target.value })}
              />
            )}
          </label>
        ))}
    </fieldset>
  );
}

function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function experienceDraftFrom(
  item: Experience,
  id: string = item.id,
  published: boolean = item.is_published,
): ExperienceDraft {
  return {
    id,
    title: readLocalized(item.title),
    description: readLocalized(item.blurb),
    duration: readLocalized(item.duration),
    imageAlt: readLocalized(item.image_alt),
    price: String(item.price),
    childPrice: item.child_price === null ? "" : String(item.child_price),
    childAgeMin: item.child_age_min === null ? "" : String(item.child_age_min),
    childAgeMax: item.child_age_max === null ? "" : String(item.child_age_max),
    minGuests: item.min_guests === null ? "" : String(item.min_guests),
    maxGuests: String(item.max_guests),
    startTime: item.start_time?.slice(0, 5) ?? "",
    mealOptions: localizedRows(item.meal_options),
    included: includedFields(item.included),
    whyLove: localizedBullets(item.why_love),
    whatToExpect: readLocalized(item.what_to_expect),
    whatToRemember: readLocalized(item.what_to_remember),
    hostLanguages: readLocalized(item.host_languages),
    published,
  };
}

function hasAllTranslations(value: LocalizedFields): boolean {
  return Boolean(value.en.trim() && value.fr.trim() && value.ar.trim());
}

function hasAnyTranslation(value: LocalizedFields): boolean {
  return Boolean(value.en.trim() || value.fr.trim() || value.ar.trim());
}

function trimFields(value: LocalizedFields): LocalizedFields {
  return {
    en: value.en.trim(),
    fr: value.fr.trim(),
    ar: value.ar.trim(),
  };
}

function optionalLocalizedFields(value: LocalizedFields): Json | null {
  return hasAnyTranslation(value) ? trimFields(value) : null;
}

function readLocalized(value: Json | null, language: string = "en"): LocalizedFields {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { en: "", fr: "", ar: "" };
  }
  return {
    en: typeof value["en"] === "string" ? value["en"] : "",
    fr: typeof value["fr"] === "string" ? value["fr"] : "",
    ar: typeof value["ar"] === "string" ? value["ar"] : "",
  };
}

function includedFields(value: Json): LocalizedFields {
  const items = Array.isArray(value) ? value : [];
  return {
    en: items
      .map((item) => localizedValue(item, "en"))
      .filter(Boolean)
      .join("\n"),
    fr: items
      .map((item) => localizedValue(item, "fr"))
      .filter(Boolean)
      .join("\n"),
    ar: items
      .map((item) => localizedValue(item, "ar"))
      .filter(Boolean)
      .join("\n"),
  };
}

function localizedRows(value: Json): LocalizedFields {
  const items = Array.isArray(value) ? value : [];
  return {
    en: items
      .map((item) => localizedValue(item, "en"))
      .filter(Boolean)
      .join("\n"),
    fr: items
      .map((item) => localizedValue(item, "fr"))
      .filter(Boolean)
      .join("\n"),
    ar: items
      .map((item) => localizedValue(item, "ar"))
      .filter(Boolean)
      .join("\n"),
  };
}

function localizedBullets(value: Json): ExperienceDraft["whyLove"] {
  const items = Array.isArray(value) ? value : [];
  const getBullet = (index: number) =>
    items[index] === undefined
      ? emptyLocalizedFields()
      : {
          en: localizedValue(items[index]!, "en"),
          fr: localizedValue(items[index]!, "fr"),
          ar: localizedValue(items[index]!, "ar"),
        };
  return [getBullet(0), getBullet(1), getBullet(2)];
}

function localizedValue(value: Json, language: string): string {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return "";
  const localized = value[language];
  return typeof localized === "string" ? localized : "";
}
