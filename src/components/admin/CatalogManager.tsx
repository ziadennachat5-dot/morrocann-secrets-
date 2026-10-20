import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import {
  emptyExperienceDraft,
  emptyFamilyDraft,
  isValidCurrencyCode,
  localizedIncludedItems,
  type ExperienceDraft,
  type FamilyDraft,
  type LocalizedFields,
} from "@/lib/admin-catalog";

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
  const [familyImage, setFamilyImage] = useState<File | null>(null);
  const [currencyDraft, setCurrencyDraft] = useState(currency);
  const [currencyBusy, setCurrencyBusy] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [experienceFileKey, setExperienceFileKey] = useState(0);
  const [familyFileKey, setFamilyFileKey] = useState(0);

  useEffect(() => {
    setCurrencyDraft(currency);
  }, [currency]);

  async function saveExperience(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidSlug(experience.id)) {
      onError("Experience ID must use lowercase letters, numbers, and single hyphens.");
      return;
    }
    const requiredFields = [experience.title, experience.description, experience.duration];
    if (requiredFields.some((fields) => !hasAllTranslations(fields))) {
      onError("Enter the experience title, description, and duration in EN, FR, and AR.");
      return;
    }
    if (!isValidCurrencyCode(currency)) {
      onError("Set the shared booking currency before saving an experience.");
      return;
    }
    const price = Number(experience.price);
    const maxGuests = Number(experience.maxGuests);
    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(maxGuests) ||
      maxGuests < 1 ||
      maxGuests > 25
    ) {
      onError("Enter a non-negative price and a maximum guest count from 1 to 25.");
      return;
    }
    if (hasAnyTranslation(experience.imageAlt) && !hasAllTranslations(experience.imageAlt)) {
      onError("Provide image alt text in all three languages, or leave all three blank.");
      return;
    }
    const { items: included, error: includedError } = localizedIncludedItems(experience.included);
    if (includedError) {
      onError(includedError);
      return;
    }
    const existing = experiences.find((item) => item.id === experience.id);
    if (!existing && !experienceImage) {
      onError("Upload an experience image before creating it.");
      return;
    }

    setFormBusy(true);
    const uploaded = experienceImage ? await uploadMedia(experienceImage, "experiences") : null;
    if (experienceImage && !uploaded) {
      setFormBusy(false);
      return;
    }
    const record = {
      id: experience.id,
      title: trimFields(experience.title),
      blurb: trimFields(experience.description),
      duration: trimFields(experience.duration),
      price,
      max_guests: maxGuests,
      image_url: uploaded?.url ?? existing?.image_url ?? "",
      image_alt: optionalLocalizedFields(experience.imageAlt),
      included,
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
      const cleanupError = uploaded ? await removeMedia(uploaded.path) : null;
      onError(
        `Could not save experience: ${result.error.message}${cleanupError ? ` Image cleanup also failed: ${cleanupError}` : ""}`,
      );
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
    setExperience({
      id: item.id,
      title: readLocalized(item.title),
      description: readLocalized(item.blurb),
      duration: readLocalized(item.duration),
      imageAlt: readLocalized(item.image_alt),
      price: String(item.price),
      maxGuests: String(item.max_guests),
      included: includedFields(item.included),
      published: item.is_published,
    });
    setExperienceImage(null);
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
                  <span className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => editExperience(item)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void deleteExperience(item)}>
                      Delete
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <form
          onSubmit={(event) => void saveExperience(event)}
          className="space-y-3 rounded-lg border p-4"
        >
          <h3 className="text-xl font-semibold">
            {experience.id && experiences.some((item) => item.id === experience.id)
              ? "Edit experience"
              : "Create experience draft"}
          </h3>
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
            onChange={(title) => setExperience((current) => ({ ...current, title }))}
          />
          <LocalizedInputs
            label="Description"
            value={experience.description}
            multiline
            onChange={(description) => setExperience((current) => ({ ...current, description }))}
          />
          <LocalizedInputs
            label="Duration"
            value={experience.duration}
            onChange={(duration) => setExperience((current) => ({ ...current, duration }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              Price per person ({currency || "set shared currency"})
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
              Maximum guests
              <input
                className={`${inputClass} mt-1`}
                type="number"
                min="1"
                max="25"
                step="1"
                required
                value={experience.maxGuests}
                onChange={(event) =>
                  setExperience((current) => ({ ...current, maxGuests: event.target.value }))
                }
              />
            </label>
          </div>
          <LocalizedInputs
            label="What's included (one translated item per line)"
            value={experience.included}
            multiline
            required={false}
            onChange={(included) => setExperience((current) => ({ ...current, included }))}
          />
          <LocalizedInputs
            label="Image alt text (optional)"
            value={experience.imageAlt}
            required={false}
            onChange={(imageAlt) => setExperience((current) => ({ ...current, imageAlt }))}
          />
          <label className="block text-sm">
            Image upload (media bucket)
            <input
              key={experienceFileKey}
              className={`${inputClass} mt-1`}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required={!experiences.some((item) => item.id === experience.id)}
              onChange={(event) => setExperienceImage(event.target.files?.[0] ?? null)}
            />
          </label>
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
                    {readLocalized(review.quote, review.language)}
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
}: {
  label: string;
  value: LocalizedFields;
  onChange: (value: LocalizedFields) => void;
  multiline?: boolean;
  required?: boolean;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="font-medium">{label}</legend>
      {(["en", "fr", "ar"] as const).map((language) => (
        <label key={language} className="block text-sm">
          {language.toUpperCase()}
          {multiline ? (
            <textarea
              dir={language === "ar" ? "rtl" : "ltr"}
              className={`${inputClass} mt-1`}
              rows={3}
              maxLength={5000}
              required={required}
              value={value[language]}
              onChange={(event) => onChange({ ...value, [language]: event.target.value })}
            />
          ) : (
            <input
              dir={language === "ar" ? "rtl" : "ltr"}
              className={`${inputClass} mt-1`}
              maxLength={500}
              required={required}
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
  return hasAllTranslations(value) ? trimFields(value) : null;
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

function localizedValue(value: Json, language: string): string {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return "";
  const localized = value[language];
  return typeof localized === "string" ? localized : "";
}
