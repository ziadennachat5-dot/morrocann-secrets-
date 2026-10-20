import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { CalendarDays, Check, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionHead } from "@/components/site/Brand";
import { useI18n, type Lang } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { BRAND_NAME } from "@/lib/brand";
import { getBookingOptions, submitBooking } from "@/lib/booking.functions";
import { filterAvailableBookingSlots } from "@/lib/booking-availability";
import type { BookingRequest } from "@/lib/booking-schema";
import {
  calculateBookingTotal,
  countCapacityGuests,
  formatCancellationTiers,
} from "@/lib/booking-pricing";

const stepKeys = ["experience", "date", "guests", "contact", "summary"] as const;
const progressSchema = z.object({
  step: z.number().int().min(0).max(4),
  experienceId: z.string(),
  date: z.string(),
  adults: z.number().int().min(0),
  children: z.number().int().min(0),
  infants: z.number().int().min(0),
  mealChoice: z.string().max(200),
  privateGroup: z.boolean(),
  dietaryNeeds: z.string().max(500),
  specialOccasion: z.enum(["", "birthday", "anniversary", "honeymoon"]),
  name: z.string().max(100),
  email: z.string().max(255),
  phone: z.string().max(30),
});

type BookingDraft = z.infer<typeof progressSchema>;
type BookingOptions = Awaited<ReturnType<typeof getBookingOptions>>;
const confirmationSchema = z.object({
  success: z.literal(true),
  booking_id: z.string().uuid(),
  experience_id: z.string(),
  experience_title: z.record(z.string(), z.string()),
  date: z.string(),
  guests: z.number().int(),
  adults: z.number().int(),
  children: z.number().int(),
  infants: z.number().int(),
  start_time: z.string(),
  total_price: z.number(),
  status: z.literal("pending"),
});
type Confirmation = z.infer<typeof confirmationSchema>;

const storageKey = "moroccan-secrets-booking-progress";

function emptyDraft(): BookingDraft {
  return {
    step: 0,
    experienceId: "",
    date: "",
    adults: 1,
    children: 0,
    infants: 0,
    mealChoice: "",
    privateGroup: false,
    dietaryNeeds: "",
    specialOccasion: "",
    name: "",
    email: "",
    phone: "",
  };
}

function saveConfirmationCalendarFile(
  confirmation: Confirmation,
  title: string,
  brandName: string,
) {
  const escapeText = (value: string) => value.replace(/[\\,;]/g, "\\$&").replace(/\n/g, "\\n");
  const eventDate = confirmation.date.replaceAll("-", "");
  const nextDate = new Date(`${confirmation.date}T12:00:00`);
  nextDate.setDate(nextDate.getDate() + 1);
  const endDate = [
    nextDate.getFullYear(),
    String(nextDate.getMonth() + 1).padStart(2, "0"),
    String(nextDate.getDate()).padStart(2, "0"),
  ].join("");
  const event = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Moroccan Secrets//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${confirmation.booking_id}@moroccansecrets.com`,
    `DTSTAMP:${new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "")}`,
    `DTSTART;VALUE=DATE:${eventDate}`,
    `DTEND;VALUE=DATE:${endDate}`,
    `SUMMARY:${escapeText(`${title} — ${brandName}`)}`,
    `DESCRIPTION:${escapeText(`${confirmation.guests} guests. Booking reference: ${confirmation.booking_id}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([event], { type: "text/calendar;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `moroccan-secrets-${confirmation.date}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const Route = createFileRoute("/booking")({
  head: () =>
    pageHead(
      "/booking",
      `Booking — ${BRAND_NAME}`,
      "Choose a published experience and an available date to request a booking.",
    ),
  component: BookingPage,
});

function BookingPage() {
  const { t, l, lang } = useI18n();
  const [options, setOptions] = useState<BookingOptions | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [draft, setDraft] = useState<BookingDraft>(emptyDraft);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const storedDraft = localStorage.getItem(storageKey);
      if (storedDraft) {
        const parsed = progressSchema.safeParse(JSON.parse(storedDraft));
        if (parsed.success) setDraft(parsed.data);
        else localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error("Unable to restore booking progress:", error);
    }
    getBookingOptions()
      .then(setOptions)
      .catch((error: unknown) => {
        console.error("Unable to load booking options:", error);
        setLoadError(true);
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(draft));
    } catch (error) {
      console.error("Unable to save booking progress:", error);
    }
  }, [draft]);

  const selectedExperience = options?.experiences.find(
    (experience) => experience.id === draft.experienceId,
  );
  const capacityGuests = countCapacityGuests(draft.adults, draft.children);
  const guestsTotal = capacityGuests + draft.infants;
  const relevantSlots = useMemo(
    () =>
      options
        ? filterAvailableBookingSlots(
            options.availability,
            draft.experienceId,
            capacityGuests,
            new Date().toISOString().slice(0, 10),
            draft.privateGroup,
          )
        : [],
    [options, draft.experienceId, capacityGuests, draft.privateGroup],
  );
  const availableDates = useMemo(
    () => relevantSlots.map((slot) => new Date(`${slot.date}T12:00:00`)),
    [relevantSlots],
  );
  const selectedSlot = relevantSlots.find((slot) => slot.date === draft.date);
  const waHref = options?.whatsapp
    ? `https://wa.me/${options.whatsapp}?text=${encodeURIComponent(t.booking.whatsappMessage)}`
    : null;
  const price = selectedExperience
    ? calculateBookingTotal(
        selectedExperience.price,
        selectedExperience.child_price,
        draft.adults,
        draft.children,
      )
    : null;
  const deposit =
    selectedExperience && selectedExperience.deposit_amount > 0
      ? selectedExperience.deposit_amount
      : null;

  const updateDraft = (values: Partial<BookingDraft>) => {
    setDraft((current) => ({ ...current, ...values }));
    setSubmitError("");
  };

  const canContinue = () => {
    if (!options?.currency || options.cancellationTiers.length === 0) return false;
    if (draft.step === 0) return Boolean(selectedExperience);
    if (draft.step === 1) return Boolean(selectedSlot);
    if (draft.step === 2)
      return (
        capacityGuests >= (selectedExperience?.min_guests ?? 0) &&
        capacityGuests <= (selectedExperience?.max_guests ?? 0) &&
        Boolean(selectedExperience) &&
        (draft.children === 0 || selectedExperience?.child_price !== null) &&
        (!selectedExperience?.meal_options.length || Boolean(draft.mealChoice)) &&
        (!draft.privateGroup || capacityGuests >= 6)
      );
    if (draft.step === 3)
      return (
        draft.name.trim().length >= 2 &&
        z.string().email().safeParse(draft.email).success &&
        draft.phone.trim().length >= 3
      );
    return Boolean(options?.cancellationTiers.length && options.currency && selectedSlot);
  };

  const continueStep = () => {
    if (!canContinue()) return;
    if (draft.step < 4) updateDraft({ step: draft.step + 1 });
  };

  const submit = async () => {
    if (
      !selectedExperience ||
      !selectedSlot ||
      !options?.cancellationTiers.length ||
      !options.currency
    )
      return;
    const payload: BookingRequest = {
      name: draft.name,
      email: draft.email,
      phone: draft.phone,
      experienceId: draft.experienceId,
      date: draft.date,
      adults: draft.adults,
      children: draft.children,
      infants: draft.infants,
      mealChoice: draft.mealChoice,
      privateGroup: draft.privateGroup,
      dietaryNeeds: draft.dietaryNeeds,
      specialOccasion: draft.specialOccasion,
      language: lang,
      honeypot: "",
    };
    setSubmitting(true);
    setSubmitError("");
    try {
      const result = confirmationSchema.parse(await submitBooking({ data: payload }));
      setConfirmation(result);
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error("Unable to clear saved booking progress:", error);
      }
    } catch (error) {
      console.error("Booking could not be submitted:", error);
      setSubmitError(t.booking.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <BookingFrame>
        <p role="alert">{t.booking.unavailable}</p>
      </BookingFrame>
    );
  }

  if (!options) {
    return (
      <BookingFrame>
        <p role="status">{t.booking.loading}</p>
      </BookingFrame>
    );
  }

  if (confirmation && selectedExperience) {
    return (
      <BookingFrame>
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-10">
          <Check className="h-10 w-10 text-accent" aria-hidden />
          <h2 className="mt-4 text-3xl">{t.booking.confirmationTitle}</h2>
          <p className="mt-2 text-muted-foreground">{t.booking.confirmationNext}</p>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="font-semibold">{t.booking.experienceLabel}</dt>
              <dd>{selectedExperience.title[lang] ?? selectedExperience.title["en"]}</dd>
            </div>
            <div>
              <dt className="font-semibold">{t.booking.dateLabel}</dt>
              <dd>
                {confirmation.date} · {confirmation.start_time.slice(0, 5)}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">{t.booking.guestsLabel}</dt>
              <dd>
                {confirmation.adults} {t.booking.adults.toLocaleLowerCase()} ·{" "}
                {confirmation.children} {t.booking.children.toLocaleLowerCase()} ·{" "}
                {confirmation.infants} {t.booking.infants.toLocaleLowerCase()}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">{t.booking.reference}</dt>
              <dd className="break-all">{confirmation.booking_id}</dd>
            </div>
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={() =>
                saveConfirmationCalendarFile(
                  confirmation,
                  selectedExperience.title[lang] ?? selectedExperience.title["en"] ?? BRAND_NAME,
                  BRAND_NAME,
                )
              }
            >
              <CalendarDays aria-hidden /> {t.booking.addToCalendar}
            </Button>
            {waHref && (
              <a className="btn btn-ghost" href={waHref} target="_blank" rel="noreferrer">
                <MessageCircle aria-hidden /> WhatsApp
              </a>
            )}
            {options.meetingArea?.[lang]?.trim() && (
              <div className="sm:col-span-2">
                <dt className="font-semibold">{t.booking.meetingArea}</dt>
                <dd>{options.meetingArea[lang]}</dd>
              </div>
            )}
            <Link to="/" className="btn btn-ghost">
              {t.booking.home}
            </Link>
          </div>
        </div>
      </BookingFrame>
    );
  }

  const goBack = () => updateDraft({ step: Math.max(0, draft.step - 1) });

  return (
    <BookingFrame>
      <ol
        aria-label={t.booking.progress}
        className="mb-8 grid grid-cols-5 gap-2 text-center text-xs sm:text-sm"
      >
        {stepKeys.map((step, index) => (
          <li
            key={step}
            aria-current={draft.step === index ? "step" : undefined}
            className={
              draft.step >= index
                ? "border-b-2 border-primary pb-2 text-primary"
                : "border-b-2 border-border pb-2 text-muted-foreground"
            }
          >
            <span className="hidden sm:inline">{index + 1}. </span>
            {t.booking.steps[step]}
          </li>
        ))}
      </ol>

      <section
        aria-labelledby="booking-step-title"
        className="rounded-2xl border border-border bg-card p-5 sm:p-8"
      >
        <h2 id="booking-step-title" className="text-3xl">
          {t.booking.steps[stepKeys[draft.step] ?? "experience"]}
        </h2>
        {options.cancellationTiers.length === 0 && (
          <p role="alert" className="mt-4 text-destructive">
            {t.booking.policyMissing}
          </p>
        )}
        {!options.currency && (
          <p role="alert" className="mt-4 text-destructive">
            {t.booking.currencyMissing}
          </p>
        )}
        {draft.step === 0 && (
          <fieldset className="mt-6 space-y-3">
            <legend className="sr-only">{t.booking.chooseExperience}</legend>
            {options.experiences.map((experience) => (
              <label
                key={experience.id}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 has-[:checked]:border-primary"
              >
                <input
                  type="radio"
                  name="experience"
                  value={experience.id}
                  checked={draft.experienceId === experience.id}
                  onChange={() =>
                    updateDraft({ experienceId: experience.id, date: "", mealChoice: "" })
                  }
                  className="mt-1 accent-primary"
                />
                <span>
                  <span className="block font-semibold">
                    {experience.title[lang] ?? experience.title["en"] ?? experience.id}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {experience.blurb[lang] ?? experience.blurb["en"] ?? ""}
                  </span>
                  {options.currency && (
                    <span className="mt-2 block text-sm">
                      {new Intl.NumberFormat(lang, {
                        style: "currency",
                        currency: options.currency,
                      }).format(experience.price)}{" "}
                      {t.exp.adultPrice.toLocaleLowerCase()} · {experience.min_guests}–
                      {experience.max_guests} {t.booking.adultsAndChildren.toLocaleLowerCase()}
                    </span>
                  )}
                  {options.currency && experience.child_price !== null && (
                    <span className="block text-sm text-muted-foreground">
                      {new Intl.NumberFormat(lang, {
                        style: "currency",
                        currency: options.currency,
                      }).format(experience.child_price)}{" "}
                      {t.exp.childPrice.toLocaleLowerCase()}
                      {experience.child_age_min !== null && experience.child_age_max !== null
                        ? ` (${experience.child_age_min}–${experience.child_age_max})`
                        : ""}
                    </span>
                  )}
                  {experience.start_time && (
                    <span className="block text-sm text-muted-foreground">
                      {t.booking.startTime}: {experience.start_time.slice(0, 5)}
                    </span>
                  )}
                  {options.meetingArea?.[lang]?.trim() && (
                    <span className="block text-sm text-muted-foreground">
                      {t.booking.meetingArea}: {options.meetingArea[lang]}
                    </span>
                  )}
                </span>
              </label>
            ))}
            {options.experiences.length === 0 && <p>{t.booking.noExperiences}</p>}
          </fieldset>
        )}

        {draft.step === 1 && (
          <div className="mt-6">
            {selectedExperience && (
              <>
                <Calendar
                  mode="single"
                  selected={draft.date ? new Date(`${draft.date}T12:00:00`) : undefined}
                  onSelect={(date) =>
                    updateDraft({
                      date: date
                        ? [
                            date.getFullYear(),
                            String(date.getMonth() + 1).padStart(2, "0"),
                            String(date.getDate()).padStart(2, "0"),
                          ].join("-")
                        : "",
                    })
                  }
                  disabled={(date) =>
                    !availableDates.some(
                      (available) => available.toDateString() === date.toDateString(),
                    )
                  }
                  modifiers={{ available: availableDates }}
                  modifiersClassNames={{ available: "font-bold text-accent" }}
                  aria-label={t.booking.availableDates}
                />
                {relevantSlots.length === 0 && (
                  <p className="mt-3 text-muted-foreground">{t.booking.noDates}</p>
                )}
                {selectedSlot && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t.booking.spotsRemaining}: {selectedSlot.remaining}
                    {selectedExperience.start_time
                      ? ` · ${t.booking.startTime}: ${selectedExperience.start_time.slice(0, 5)}`
                      : ""}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {draft.step === 2 && (
          <div className="mt-6 space-y-5">
            <div>
              <Label htmlFor="booking-adults">{t.booking.adults}</Label>
              <Input
                id="booking-adults"
                type="number"
                min={0}
                max={selectedExperience?.max_guests ?? 25}
                value={draft.adults}
                onChange={(event) => updateDraft({ adults: Number(event.target.value), date: "" })}
              />
            </div>
            <div>
              <Label htmlFor="booking-children">{t.booking.children}</Label>
              <Input
                id="booking-children"
                type="number"
                min={0}
                max={selectedExperience?.max_guests ?? 25}
                value={draft.children}
                onChange={(event) =>
                  updateDraft({ children: Number(event.target.value), date: "" })
                }
              />
              {selectedExperience &&
                selectedExperience.child_price !== null &&
                selectedExperience.child_age_min !== null &&
                selectedExperience.child_age_max !== null && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t.booking.childAgeRange}: {selectedExperience.child_age_min}–
                    {selectedExperience.child_age_max}
                  </p>
                )}
            </div>
            <div>
              <Label htmlFor="booking-infants">{t.booking.infants}</Label>
              <Input
                id="booking-infants"
                type="number"
                min={0}
                max={2147483647}
                value={draft.infants}
                onChange={(event) => updateDraft({ infants: Number(event.target.value), date: "" })}
              />
              <p className="mt-1 text-sm text-muted-foreground">{t.booking.infantsFree}</p>
            </div>
            {selectedExperience && selectedExperience.meal_options.length > 0 && (
              <div>
                <Label htmlFor="booking-meal">{t.booking.mealChoice}</Label>
                <select
                  id="booking-meal"
                  value={draft.mealChoice}
                  onChange={(event) => updateDraft({ mealChoice: event.target.value })}
                  className="field"
                  required
                >
                  <option value="">{t.booking.chooseMeal}</option>
                  {selectedExperience.meal_options.map((option) => (
                    <option key={option.en} value={option[lang]}>
                      {option[lang]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={draft.privateGroup}
                onChange={(event) => updateDraft({ privateGroup: event.target.checked, date: "" })}
                className="mt-1 accent-primary"
              />
              <span>
                {t.booking.privateGroup}{" "}
                <span className="block text-sm text-muted-foreground">
                  {t.booking.privateGroupNote}
                </span>
              </span>
            </label>
            <div>
              <Label htmlFor="booking-dietary">{t.booking.dietary}</Label>
              <textarea
                id="booking-dietary"
                value={draft.dietaryNeeds}
                maxLength={500}
                onChange={(event) => updateDraft({ dietaryNeeds: event.target.value })}
                className="field min-h-24"
              />
            </div>
            <div>
              <Label htmlFor="booking-occasion">{t.booking.specialOccasion}</Label>
              <select
                id="booking-occasion"
                value={draft.specialOccasion}
                onChange={(event) =>
                  updateDraft({
                    specialOccasion: event.target.value as BookingDraft["specialOccasion"],
                  })
                }
                className="field"
              >
                <option value="">{t.booking.noOccasion}</option>
                <option value="birthday">{t.booking.birthday}</option>
                <option value="anniversary">{t.booking.anniversary}</option>
                <option value="honeymoon">{t.booking.honeymoon}</option>
              </select>
            </div>
            {selectedExperience && options.currency && price !== null && (
              <div aria-live="polite" className="rounded-lg bg-sand p-4">
                <p>
                  {t.booking.adults}: {draft.adults} ×{" "}
                  {new Intl.NumberFormat(lang, {
                    style: "currency",
                    currency: options.currency,
                  }).format(selectedExperience.price)}
                </p>
                {draft.children > 0 && selectedExperience.child_price !== null && (
                  <p>
                    {t.booking.children}: {draft.children} ×{" "}
                    {new Intl.NumberFormat(lang, {
                      style: "currency",
                      currency: options.currency,
                    }).format(selectedExperience.child_price)}
                  </p>
                )}
                <p>
                  {t.booking.infants}: {draft.infants} · {t.booking.infantsFree}
                </p>
                <p className="mt-1 font-semibold">
                  {t.booking.estimatedTotal}:{" "}
                  {new Intl.NumberFormat(lang, {
                    style: "currency",
                    currency: options.currency,
                  }).format(price)}
                </p>
                {deposit !== null && (
                  <p className="mt-1">
                    {t.booking.deposit}:{" "}
                    {new Intl.NumberFormat(lang, {
                      style: "currency",
                      currency: options.currency,
                    }).format(deposit)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {draft.step === 3 && (
          <div className="mt-6 grid gap-5">
            <div>
              <Label htmlFor="booking-name">{t.booking.name}</Label>
              <Input
                id="booking-name"
                autoComplete="name"
                value={draft.name}
                onChange={(event) => updateDraft({ name: event.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="booking-email">{t.booking.email}</Label>
              <Input
                id="booking-email"
                type="email"
                autoComplete="email"
                value={draft.email}
                onChange={(event) => updateDraft({ email: event.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="booking-phone">{t.booking.phone}</Label>
              <Input
                id="booking-phone"
                type="tel"
                autoComplete="tel"
                value={draft.phone}
                onChange={(event) => updateDraft({ phone: event.target.value })}
                required
              />
            </div>
          </div>
        )}

        {draft.step === 4 && (
          <div className="mt-6 space-y-6">
            {selectedExperience && (
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="font-semibold">{t.booking.experienceLabel}</dt>
                  <dd>{selectedExperience.title[lang] ?? selectedExperience.title["en"]}</dd>
                </div>
                <div>
                  <dt className="font-semibold">{t.booking.dateLabel}</dt>
                  <dd>{draft.date}</dd>
                </div>
                <div>
                  <dt className="font-semibold">{t.booking.startTime}</dt>
                  <dd>{selectedExperience.start_time?.slice(0, 5)}</dd>
                </div>
                <div>
                  <dt className="font-semibold">{t.booking.guestsLabel}</dt>
                  <dd>
                    {draft.adults} {t.booking.adults.toLocaleLowerCase()} · {draft.children}{" "}
                    {t.booking.children.toLocaleLowerCase()} · {draft.infants}{" "}
                    {t.booking.infants.toLocaleLowerCase()}
                    {" · "}
                    {guestsTotal} {t.booking.guestsLabel.toLocaleLowerCase()}
                    {draft.privateGroup ? ` · ${t.booking.privateGroup}` : ""}
                  </dd>
                </div>
                {draft.mealChoice && (
                  <div>
                    <dt className="font-semibold">{t.booking.mealChoice}</dt>
                    <dd>{draft.mealChoice}</dd>
                  </div>
                )}
                <div>
                  <dt className="font-semibold">{t.booking.name}</dt>
                  <dd>{draft.name}</dd>
                </div>
                <div>
                  <dt className="font-semibold">{t.booking.email}</dt>
                  <dd>{draft.email}</dd>
                </div>
                <div>
                  <dt className="font-semibold">{t.booking.phone}</dt>
                  <dd>{draft.phone}</dd>
                </div>
                {draft.dietaryNeeds && (
                  <div className="sm:col-span-2">
                    <dt className="font-semibold">{t.booking.dietary}</dt>
                    <dd>{draft.dietaryNeeds}</dd>
                  </div>
                )}
                {draft.specialOccasion && (
                  <div>
                    <dt className="font-semibold">{t.booking.specialOccasion}</dt>
                    <dd>{t.booking[draft.specialOccasion]}</dd>
                  </div>
                )}
              </dl>
            )}
            {selectedExperience && options.currency && price !== null && (
              <div className="text-lg">
                <p>
                  {t.booking.adults}: {draft.adults} ×{" "}
                  {new Intl.NumberFormat(lang, {
                    style: "currency",
                    currency: options.currency,
                  }).format(selectedExperience.price)}
                </p>
                {draft.children > 0 && selectedExperience.child_price !== null && (
                  <p>
                    {t.booking.children}: {draft.children} ×{" "}
                    {new Intl.NumberFormat(lang, {
                      style: "currency",
                      currency: options.currency,
                    }).format(selectedExperience.child_price)}
                  </p>
                )}
                <p>
                  {t.booking.infants}: {draft.infants} · {t.booking.infantsFree}
                </p>
                <p className="mt-1 font-semibold">
                  {t.booking.estimatedTotal}:{" "}
                  {new Intl.NumberFormat(lang, {
                    style: "currency",
                    currency: options.currency,
                  }).format(price)}
                </p>
                {deposit !== null && (
                  <p className="mt-1 text-base font-normal">
                    {t.booking.deposit}:{" "}
                    {new Intl.NumberFormat(lang, {
                      style: "currency",
                      currency: options.currency,
                    }).format(deposit)}
                  </p>
                )}
              </div>
            )}
            {options.cancellationTiers.length > 0 && (
              <div className="rounded-xl border border-border p-4">
                <h3 className="font-semibold">{t.booking.cancellationPolicy}</h3>
                <ul className="mt-2 list-disc space-y-1 ps-5">
                  {formatCancellationTiers(options.cancellationTiers, lang).map((tier) => (
                    <li key={tier}>{tier}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {submitError && (
          <p role="alert" className="mt-5 text-destructive">
            {submitError}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-between gap-3">
          <Button
            variant="outline"
            type="button"
            disabled={draft.step === 0 || submitting}
            onClick={goBack}
          >
            <ChevronLeft aria-hidden />
            {t.booking.back}
          </Button>
          {draft.step < 4 ? (
            <Button type="button" disabled={!canContinue()} onClick={continueStep}>
              {t.booking.continue}
              <ChevronRight aria-hidden />
            </Button>
          ) : (
            <Button type="button" disabled={!canContinue() || submitting} onClick={submit}>
              {submitting ? t.booking.sending : t.booking.submit}
            </Button>
          )}
        </div>
      </section>

      {waHref && (
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-primary underline"
        >
          <MessageCircle aria-hidden className="h-4 w-4" />
          {t.booking.whatsappAlternative}
        </a>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t border-border bg-background/95 p-3 shadow-lg backdrop-blur sm:hidden">
        <span className="text-sm">{t.booking.steps[stepKeys[draft.step] ?? "experience"]}</span>
        {draft.step < 4 ? (
          <Button type="button" size="sm" disabled={!canContinue()} onClick={continueStep}>
            {t.booking.continue}
          </Button>
        ) : (
          <Button type="button" size="sm" disabled={!canContinue() || submitting} onClick={submit}>
            {submitting ? t.booking.sending : t.booking.submit}
          </Button>
        )}
      </div>
    </BookingFrame>
  );
}

function BookingFrame({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 pb-28 sm:pb-16">
      <SectionHead eyebrow={t.booking.eyebrow} title={t.booking.title} sub={t.booking.subtitle} />
      {children}
      <p className="mt-8 text-sm text-muted-foreground">{t.booking.bookingRequestOnly}</p>
    </div>
  );
}
