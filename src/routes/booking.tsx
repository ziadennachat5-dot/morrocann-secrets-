import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { z } from "zod";
import { CalendarDays, Check, MessageCircle, AlertCircle, Users } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useI18n, type Lang } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { BRAND_NAME } from "@/lib/brand";
import { getBookingOptions, submitBooking } from "@/lib/booking.functions";
import type { BookingRequest } from "@/lib/booking-schema";
import { MAIN_DISHES } from "@/components/site/ConceptAndMenu";

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

export const Route = createFileRoute("/booking")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "booking" });
  },
  head: () =>
    pageHead(
      "/booking",
      `Booking — ${BRAND_NAME}`,
      "Reserve your authentic Moroccan dinner experience with a local family.",
    ),
  component: BookingPage,
});

function BookingPage() {
  return <BookingFlow />;
}

function formatDateInWords(dateStr: string, lang: Lang): string {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y!, m! - 1, d!);
    const locale = lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(dateObj);
  } catch {
    return dateStr;
  }
}

export function BookingFlow({
  initialExperienceId,
  initialOptions,
}: {
  initialExperienceId?: string;
  initialOptions?: BookingOptions;
}) {
  const { lang } = useI18n();
  const [options, setOptions] = useState<BookingOptions | null>(initialOptions ?? null);
  const [loadError, setLoadError] = useState(false);

  // Form state
  const [date, setDate] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState<number>(2);
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [allergies, setAllergies] = useState("");
  const [message, setMessage] = useState("");
  type TouchedState = {
    name?: boolean;
    phone?: boolean;
    email?: boolean;
    dishes?: boolean;
    date?: boolean;
  };
  const [touched, setTouched] = useState<TouchedState>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  useEffect(() => {
    if (!initialOptions) {
      getBookingOptions()
        .then(setOptions)
        .catch((error: unknown) => {
          console.error("Unable to load booking options:", error);
          setLoadError(true);
        });
    }
  }, [initialOptions]);

  const targetExperience = options?.experiences[0] ?? null;
  const targetExperienceId =
    initialExperienceId || targetExperience?.id || "family-dinner-marrakech";

  // Filter slots for availability
  const relevantSlots = useMemo(
    () =>
      options
        ? options.availability.filter(
            (slot) => slot.experienceId === targetExperienceId && slot.remaining >= guests,
          )
        : [],
    [options, targetExperienceId, guests],
  );

  const availableDates = useMemo(
    () => relevantSlots.map((slot) => new Date(`${slot.date}T12:00:00`)),
    [relevantSlots],
  );

  const fullyBookedDates = useMemo(
    () =>
      options?.calendarStatuses
        .filter((slot) => slot.experienceId === targetExperienceId && slot.state === "full")
        .map((slot) => new Date(`${slot.date}T12:00:00`)) ?? [],
    [options, targetExperienceId],
  );

  const closedDates = useMemo(
    () =>
      options?.calendarStatuses
        .filter((slot) => slot.experienceId === targetExperienceId && slot.state === "closed")
        .map((slot) => new Date(`${slot.date}T12:00:00`)) ?? [],
    [options, targetExperienceId],
  );

  const waHref = options?.whatsapp
    ? `https://wa.me/${options.whatsapp}?text=${encodeURIComponent(
        lang === "fr"
          ? "Bonjour, je souhaite réserver un dîner en famille marocaine."
          : lang === "ar"
            ? "مرحباً، أود حجز عشاء مع عائلة مغربية."
            : "Hello, I would like to book a dinner with a Moroccan family.",
      )}`
    : null;

  const isDishSelected = (dish: (typeof MAIN_DISHES)[number]) => {
    return selectedDishes.some(
      (d) =>
        d === dish.label[lang] ||
        d === dish.label.en ||
        d === dish.label.fr ||
        d === dish.label.ar ||
        d === dish.id,
    );
  };

  const toggleDish = (dish: (typeof MAIN_DISHES)[number]) => {
    setTouched((prev) => ({ ...prev, dishes: true }));
    const isSelected = isDishSelected(dish);
    let updated: string[];
    if (isSelected) {
      updated = selectedDishes.filter(
        (d) =>
          d !== dish.label[lang] &&
          d !== dish.label.en &&
          d !== dish.label.fr &&
          d !== dish.label.ar &&
          d !== dish.id,
      );
    } else if (selectedDishes.length < 2) {
      updated = [...selectedDishes, dish.label[lang]];
    } else {
      updated = [selectedDishes[0]!, dish.label[lang]];
    }
    setSelectedDishes(updated);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isNameValid = name.trim().length >= 2;
  const isPhoneValid = phone.trim().length >= 3;
  const isDishesValid = selectedDishes.length === 2;
  const isDateValid = Boolean(date);

  const canSubmit =
    isDateValid && isNameValid && isPhoneValid && isEmailValid && guests >= 1 && isDishesValid;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ name: true, phone: true, email: true, dishes: true, date: true });

    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError("");

    const payload: BookingRequest = {
      experienceId: targetExperienceId,
      date,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      adults: guests,
      children: 0,
      infants: 0,
      mealChoice: selectedDishes.join(", "),
      privateGroup: false,
      dietaryNeeds: allergies.trim(),
      message: message.trim(),
      specialOccasion: "",
      language: lang,
      honeypot: "",
    };

    try {
      const result = confirmationSchema.parse(await submitBooking({ data: payload }));
      setConfirmation(result);
    } catch (error) {
      console.error("Booking submission failed:", error);
      setSubmitError(
        lang === "fr"
          ? "Impossible d'enregistrer la réservation. Veuillez vérifier vos informations ou nous contacter sur WhatsApp."
          : lang === "ar"
            ? "تعذر إرسال طلب الحجز. يرجى التحقق من المعلومات أو التواصل معنا عبر واتساب."
            : "Unable to submit booking request. Please check your details or contact us on WhatsApp.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <BookingFrame>
        <p role="alert" className="text-destructive text-center py-8">
          {lang === "fr"
            ? "Le calendrier de réservation est temporairement indisponible."
            : lang === "ar"
              ? "نظام الحجز غير متاح مؤقتاً."
              : "Booking is temporarily unavailable."}
        </p>
      </BookingFrame>
    );
  }

  if (!options) {
    return (
      <BookingFrame>
        <p role="status" className="text-center py-8 text-muted-foreground animate-pulse">
          {lang === "fr"
            ? "Chargement des disponibilités..."
            : lang === "ar"
              ? "جاري تحميل المواعيد..."
              : "Loading availability..."}
        </p>
      </BookingFrame>
    );
  }

  // Confirmation view
  if (confirmation) {
    return (
      <BookingFrame>
        <div className="rounded-3xl border border-emerald-300 bg-emerald-50/70 p-6 sm:p-12 text-center shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-xs">
            <Check className="h-9 w-9 stroke-[2.5]" aria-hidden />
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold text-emerald-950 sm:text-4xl">
            {lang === "fr"
              ? "Demande de réservation reçue !"
              : lang === "ar"
                ? "تم استلام طلب الحجز بنجاح!"
                : "Booking Request Received!"}
          </h2>
          <p className="mt-3 text-base text-emerald-900/80 max-w-xl mx-auto leading-relaxed">
            {lang === "fr"
              ? `Merci ${name} ! Nous vous contacterons rapidement par WhatsApp ou email pour confirmer votre table et vous communiquer l'adresse de la maison.`
              : lang === "ar"
                ? `شكراً لك ${name}! سنتواصل معك قريباً عبر واتساب أو البريد الإلكتروني لتأكيد طاولتك ومشاركتك عنوان البيت.`
                : `Thank you, ${name}! We will contact you shortly via WhatsApp or email to confirm your table and share the exact house address.`}
          </p>

          <div className="mt-8 mx-auto max-w-lg rounded-2xl border border-emerald-200/90 bg-white/95 p-6 text-start shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {lang === "fr"
                ? "Récapitulatif de votre demande"
                : lang === "ar"
                  ? "تفاصيل الطلب"
                  : "Booking details"}
            </h3>
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">
                  {lang === "fr" ? "Date" : lang === "ar" ? "التاريخ" : "Date"}
                </dt>
                <dd className="font-semibold text-foreground capitalize">
                  {formatDateInWords(confirmation.date, lang)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {lang === "fr" ? "Personnes" : lang === "ar" ? "الضيوف" : "Guests"}
                </dt>
                <dd className="font-semibold text-foreground">
                  {confirmation.guests}{" "}
                  {confirmation.guests === 1
                    ? lang === "fr"
                      ? "personne"
                      : lang === "ar"
                        ? "ضيف"
                        : "guest"
                    : lang === "fr"
                      ? "personnes"
                      : lang === "ar"
                        ? "ضيوف"
                        : "guests"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground">
                  {lang === "fr"
                    ? "Plats choisis"
                    : lang === "ar"
                      ? "الأطباق المختارة"
                      : "Selected dishes"}
                </dt>
                <dd className="font-semibold text-foreground">
                  {selectedDishes.join(", ") || "—"}
                </dd>
              </div>
              {allergies && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">
                    {lang === "fr"
                      ? "Allergies / régimes"
                      : lang === "ar"
                        ? "الحساسية"
                        : "Allergies"}
                  </dt>
                  <dd className="font-medium text-foreground">{allergies}</dd>
                </div>
              )}
              {message && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">
                    {lang === "fr" ? "Message" : lang === "ar" ? "رسالة" : "Message"}
                  </dt>
                  <dd className="font-medium text-foreground">{message}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setConfirmation(null);
                setDate("");
                setSelectedDishes([]);
                setAllergies("");
                setMessage("");
                setTouched({});
              }}
              className="border-emerald-700/30 text-emerald-900 hover:bg-emerald-100/60 h-12 px-6"
            >
              {lang === "fr"
                ? "Faire une autre réservation"
                : lang === "ar"
                  ? "حجز موعد آخر"
                  : "Book another date"}
            </Button>
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary inline-flex items-center gap-2 h-12 px-6"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </BookingFrame>
    );
  }

  return (
    <BookingFrame>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
        className="w-full rounded-3xl border border-border/80 bg-white p-6 sm:p-10 lg:p-12 shadow-card"
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* =========================================================
              LEFT COLUMN: CALENDAR (lg:col-span-5)
          ========================================================= */}
          <div className="lg:col-span-5 flex flex-col items-center">
            {/* Step 1 header with numbered circle */}
            <div className="w-full flex items-center gap-3.5 mb-5 text-start">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold text-sm shadow-xs">
                1
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground">
                {lang === "fr"
                  ? "Choisissez un jour"
                  : lang === "ar"
                    ? "اختر التاريخ"
                    : "Pick a day"}
              </h3>
            </div>

            <Calendar
              mode="single"
              selected={date ? new Date(`${date}T12:00:00`) : undefined}
              onSelect={(selected) => {
                setTouched((prev) => ({ ...prev, date: true }));
                if (selected) {
                  const y = selected.getFullYear();
                  const m = String(selected.getMonth() + 1).padStart(2, "0");
                  const d = String(selected.getDate()).padStart(2, "0");
                  setDate(`${y}-${m}-${d}`);
                } else {
                  setDate("");
                }
              }}
              disabled={(d) => !availableDates.some((a) => a.toDateString() === d.toDateString())}
              modifiers={{
                available: availableDates,
                fullyBooked: fullyBookedDates,
                closed: closedDates,
              }}
              className="w-full max-w-lg rounded-2xl border border-border p-3 sm:p-5 bg-background shadow-xs booking-calendar [--cell-size:48px] sm:[--cell-size:56px]"
              classNames={{
                caption_label:
                  "font-display text-xl sm:text-2xl font-bold text-primary tracking-wide",
                button_previous:
                  "h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-border/80 hover:bg-muted text-primary flex items-center justify-center transition-colors",
                button_next:
                  "h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-border/80 hover:bg-muted text-primary flex items-center justify-center transition-colors",
                weekday: "text-foreground/85 font-bold text-xs sm:text-sm py-2",
              }}
            />

            {/* Calendar Legend — larger, placed under the calendar */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-foreground/85">
              <span className="inline-flex items-center gap-2 font-medium">
                <span className="h-4 w-4 rounded-md border-2 border-accent bg-white shadow-2xs" />
                {lang === "fr" ? "Disponible" : lang === "ar" ? "متاح" : "Available"}
              </span>
              <span className="inline-flex items-center gap-2 font-medium">
                <span className="h-4 w-4 rounded-md bg-primary shadow-2xs" />
                {lang === "fr" ? "Sélectionné" : lang === "ar" ? "المحدد" : "Selected"}
              </span>
              <span className="inline-flex items-center gap-2 font-medium">
                <span className="relative flex h-4 w-4 items-center justify-center rounded-md border border-red-300 bg-red-100">
                  <span className="absolute h-0.5 w-4 rotate-45 bg-red-600" />
                </span>
                {lang === "fr" ? "Complet" : lang === "ar" ? "محجوز بالكامل" : "Fully booked"}
              </span>
              <span className="inline-flex items-center gap-2 font-medium">
                <span className="h-4 w-4 rounded-md border border-stone-300 bg-stone-200" />
                {lang === "fr" ? "Fermé / Passé" : lang === "ar" ? "مغلق / ماضٍ" : "Closed / Past"}
              </span>
            </div>

            {/* Selected Date Summary Box — appears once a day is chosen */}
            {date ? (
              <div className="mt-5 w-full max-w-lg rounded-2xl border-2 border-accent/40 bg-accent/5 p-4 text-start shadow-xs animate-in fade-up">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-accent">
                      {lang === "fr"
                        ? "Date sélectionnée"
                        : lang === "ar"
                          ? "التاريخ المختار"
                          : "Selected date"}
                    </p>
                    <p className="mt-1 font-display text-lg font-bold text-foreground capitalize">
                      {formatDateInWords(date, lang)}
                    </p>
                  </div>
                  <div className="text-end shrink-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3.5 py-1.5 text-xs font-bold text-accent">
                      <Users className="h-3.5 w-3.5" />
                      {guests}{" "}
                      {guests === 1
                        ? lang === "fr"
                          ? "personne"
                          : lang === "ar"
                            ? "ضيف"
                            : "guest"
                        : lang === "fr"
                          ? "personnes"
                          : lang === "ar"
                            ? "ضيوف"
                            : "guests"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 w-full max-w-lg rounded-xl border border-border/80 bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {lang === "fr"
                    ? "Cliquez sur une date verte disponible"
                    : lang === "ar"
                      ? "انقر على تاريخ متاح بالأخضر"
                      : "Click on an available green date"}
                </p>
                {touched.date && !date && (
                  <p className="mt-1.5 text-xs font-semibold text-destructive">
                    {lang === "fr"
                      ? "Veuillez sélectionner un jour sur le calendrier."
                      : lang === "ar"
                        ? "يرجى تحديد تاريخ على التقويم."
                        : "Please choose a day on the calendar."}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* =========================================================
              RIGHT COLUMN: GUEST DETAILS & DISHES (lg:col-span-7)
          ========================================================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 2 header with numbered circle */}
            <div className="flex items-center gap-3.5 pb-3 border-b border-border/70 text-start">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white font-bold text-sm shadow-xs">
                2
              </span>
              <h3 className="font-display text-2xl font-bold text-foreground">
                {lang === "fr"
                  ? "Vos informations"
                  : lang === "ar"
                    ? "معلومات الحجز"
                    : "Your details"}
              </h3>
            </div>

            {/* Number of guests */}
            <div>
              <Label
                htmlFor="booking-guests"
                className="text-sm font-semibold text-foreground mb-1.5 block"
              >
                {lang === "fr"
                  ? "Nombre de personnes"
                  : lang === "ar"
                    ? "عدد الضيوف"
                    : "Number of guests"}{" "}
                *
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="booking-guests"
                  type="number"
                  min={1}
                  max={8}
                  value={guests}
                  onChange={(e) => setGuests(Math.max(1, Math.min(8, Number(e.target.value) || 1)))}
                  className="max-w-[130px] h-[52px] text-base font-semibold rounded-xl border-input focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                  required
                />
                <span className="text-sm text-muted-foreground">
                  {lang === "fr"
                    ? "(1 à 8 personnes)"
                    : lang === "ar"
                      ? "(من 1 إلى 8 ضيوف)"
                      : "(1 to 8 guests)"}
                </span>
              </div>
            </div>

            {/* Name, Phone, Email */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label
                  htmlFor="booking-name"
                  className="text-sm font-semibold text-foreground mb-1.5 block"
                >
                  {lang === "fr" ? "Nom complet" : lang === "ar" ? "الاسم الكامل" : "Full name"} *
                </Label>
                <Input
                  id="booking-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  placeholder={
                    lang === "fr"
                      ? "Ex. Sophie Martin"
                      : lang === "ar"
                        ? "مثال: محمد العلوي"
                        : "e.g. John Smith"
                  }
                  required
                  className={`h-[52px] text-base rounded-xl border px-4 focus-visible:ring-2 ${
                    touched.name && !isNameValid
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input focus-visible:ring-primary focus-visible:border-primary"
                  }`}
                />
                {touched.name && !isNameValid && (
                  <p className="mt-1 text-xs font-semibold text-destructive">
                    {lang === "fr"
                      ? "Veuillez indiquer votre nom complet (au moins 2 caractères)."
                      : lang === "ar"
                        ? "يرجى إدخال اسمك الكامل (حرفين على الأقل)."
                        : "Please enter your full name (at least 2 characters)."}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="booking-phone"
                  className="text-sm font-semibold text-foreground mb-1.5 block"
                >
                  {lang === "fr"
                    ? "Téléphone (avec WhatsApp)"
                    : lang === "ar"
                      ? "رقم الهاتف (مع واتساب)"
                      : "Phone number (WhatsApp)"}{" "}
                  *
                </Label>
                <Input
                  id="booking-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                  placeholder="+212 600..."
                  required
                  className={`h-[52px] text-base rounded-xl border px-4 focus-visible:ring-2 ${
                    touched.phone && !isPhoneValid
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input focus-visible:ring-primary focus-visible:border-primary"
                  }`}
                />
                {touched.phone && !isPhoneValid && (
                  <p className="mt-1 text-xs font-semibold text-destructive">
                    {lang === "fr"
                      ? "Veuillez entrer un numéro de téléphone valide."
                      : lang === "ar"
                        ? "يرجى إدخال رقم هاتف صحيح."
                        : "Please enter a valid phone number."}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="booking-email"
                  className="text-sm font-semibold text-foreground mb-1.5 block"
                >
                  {lang === "fr"
                    ? "Adresse email"
                    : lang === "ar"
                      ? "البريد الإلكتروني"
                      : "Email address"}{" "}
                  *
                </Label>
                <Input
                  id="booking-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  placeholder="contact@example.com"
                  required
                  className={`h-[52px] text-base rounded-xl border px-4 focus-visible:ring-2 ${
                    touched.email && !isEmailValid
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input focus-visible:ring-primary focus-visible:border-primary"
                  }`}
                />
                {touched.email && !isEmailValid && (
                  <p className="mt-1 text-xs font-semibold text-destructive">
                    {lang === "fr"
                      ? "Veuillez entrer une adresse email valide."
                      : lang === "ar"
                        ? "يرجى إدخال بريد إلكتروني صحيح."
                        : "Please enter a valid email address."}
                  </p>
                )}
              </div>
            </div>

            {/* Main dishes — two-column tappable cards with green check and 0/2 counter */}
            <div className="pt-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm font-semibold text-foreground">
                  {lang === "fr"
                    ? "Plats principaux (choix de 2)"
                    : lang === "ar"
                      ? "الأطباق الرئيسية (اختر طبقين)"
                      : "Main dishes (choose 2)"}{" "}
                  *
                </Label>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    selectedDishes.length === 2
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-900 border border-amber-300"
                  }`}
                >
                  {selectedDishes.length}/2
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {lang === "fr"
                  ? "Cochez exactement 2 plats principaux que vous partagerez."
                  : lang === "ar"
                    ? "يرجى تحديد طبقين رئيسيين للمائدة."
                    : "Check exactly 2 main dishes for your table."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                {MAIN_DISHES.map((dish) => {
                  const checked = isDishSelected(dish);
                  return (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={() => toggleDish(dish)}
                      className={`group relative flex items-center justify-between gap-3 rounded-xl border p-3.5 text-start transition-all cursor-pointer ${
                        checked
                          ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary"
                          : "border-border/80 bg-white hover:border-primary/50 hover:bg-offwhite/50"
                      }`}
                    >
                      <span
                        className={`text-sm leading-snug ${
                          checked ? "font-bold text-primary" : "font-medium text-foreground"
                        }`}
                      >
                        {dish.label[lang]}
                      </span>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all ${
                          checked
                            ? "bg-accent text-white"
                            : "border border-border/80 bg-stone-50 group-hover:border-primary/40"
                        }`}
                      >
                        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
              {touched.dishes && !isDishesValid && (
                <p className="mt-2 text-xs font-semibold text-destructive">
                  {lang === "fr"
                    ? "Veuillez choisir exactement 2 plats principaux."
                    : lang === "ar"
                      ? "يرجى اختيار طبقين رئيسيين بالضبط."
                      : "Please choose exactly 2 main dishes."}
                </p>
              )}
            </div>

            {/* Allergies (optional) */}
            <div>
              <Label
                htmlFor="booking-dietary"
                className="text-sm font-semibold text-foreground mb-1.5 block"
              >
                {lang === "fr"
                  ? "Allergies ou régimes alimentaires (facultatif)"
                  : lang === "ar"
                    ? "أي حساسية أو متطلبات غذائية (اختياري)"
                    : "Allergies or dietary requirements (optional)"}
              </Label>
              <textarea
                id="booking-dietary"
                rows={2}
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder={
                  lang === "fr"
                    ? "Ex. Végétarien, sans gluten, allergie aux noix..."
                    : lang === "ar"
                      ? "مثال: نباتي، بدون غلوتين، حساسية من المكسرات..."
                      : "e.g. Vegetarian, gluten-free, nut allergy..."
                }
                className="w-full rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>

            {/* Message (optional) */}
            <div>
              <Label
                htmlFor="booking-message"
                className="text-sm font-semibold text-foreground mb-1.5 block"
              >
                {lang === "fr"
                  ? "Message ou demandes particulières (facultatif)"
                  : lang === "ar"
                    ? "رسالة أو طلبات خاصة (اختياري)"
                    : "Message or special requests (optional)"}
              </Label>
              <textarea
                id="booking-message"
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  lang === "fr"
                    ? "Une question ou une occasion spéciale ?"
                    : lang === "ar"
                      ? "هل لديك أي استفسار أو مناسبة خاصة؟"
                      : "Any questions or special occasion?"
                }
                className="w-full rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
              />
            </div>

            {submitError && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-sm text-destructive font-medium border border-destructive/20"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Send button — full width burgundy */}
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="btn btn-primary w-full h-[54px] text-base font-bold shadow-md cursor-pointer"
              >
                {submitting
                  ? lang === "fr"
                    ? "Envoi en cours..."
                    : lang === "ar"
                      ? "جاري الإرسال..."
                      : "Sending request..."
                  : lang === "fr"
                    ? "Envoyer la demande de réservation"
                    : lang === "ar"
                      ? "إرسال طلب الحجز"
                      : "Send booking request"}
              </Button>

              {!canSubmit && touched.name && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {!date
                    ? lang === "fr"
                      ? "Veuillez choisir un jour disponible sur le calendrier."
                      : lang === "ar"
                        ? "يرجى اختيار تاريخ متاح على التقويم."
                        : "Please select an available date on the calendar."
                    : selectedDishes.length !== 2
                      ? lang === "fr"
                        ? "Veuillez choisir exactement 2 plats principaux."
                        : lang === "ar"
                          ? "يرجى اختيار طبقين رئيسيين."
                          : "Please choose exactly 2 main dishes."
                      : lang === "fr"
                        ? "Veuillez remplir vos coordonnées complètes."
                        : lang === "ar"
                          ? "يرجى ملء جميع البيانات المطلوبة."
                          : "Please fill in all required contact fields."}
                </p>
              )}
            </div>

            {/* Prefer to book via WhatsApp — secondary outlined button */}
            {waHref && (
              <div className="pt-2">
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary w-full inline-flex items-center justify-center gap-2.5 h-[52px] text-sm sm:text-base font-semibold"
                >
                  <MessageCircle className="h-5 w-5 text-accent" />
                  <span>
                    {lang === "fr"
                      ? "Préférer réserver via WhatsApp ?"
                      : lang === "ar"
                        ? "تفضل الحجز عبر واتساب؟"
                        : "Prefer to book via WhatsApp?"}
                  </span>
                </a>
              </div>
            )}
          </div>
        </div>
      </form>
    </BookingFrame>
  );
}

function BookingFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1100px] px-0 sm:px-2 py-4 sm:py-6">{children}</div>;
}
