import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { z } from "zod";
import {
  CalendarDays,
  Check,
  MessageCircle,
  AlertCircle,
  Users,
  Minus,
  Plus,
  Loader2,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
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
      "Reserve your authentic Moroccan dinner experience with a local family in Marrakech.",
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

function formatShortDateInWords(dateStr: string, lang: Lang): string {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y!, m! - 1, d!);
    const locale = lang === "ar" ? "ar-MA" : lang === "fr" ? "fr-FR" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(dateObj);
  } catch {
    return dateStr;
  }
}

const WEEKDAY_NAMES: Record<Lang, string[]> = {
  en: ["SU", "MO", "TU", "WE", "TH", "FR", "SA"],
  fr: ["DI", "LU", "MA", "ME", "JE", "VE", "SA"],
  ar: ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"],
};

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
  const [showExtras, setShowExtras] = useState(false);
  const [dishWarning, setDishWarning] = useState(false);

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

  // WhatsApp prefilled link with chosen date, guests and dishes
  const formattedDateEn = date ? formatDateInWords(date, "en") : "";
  const formattedDateFr = date ? formatDateInWords(date, "fr") : "";
  const formattedDateAr = date ? formatDateInWords(date, "ar") : "";

  const whatsappMessage = useMemo(() => {
    const dishesList = selectedDishes.length > 0 ? selectedDishes.join(", ") : "";
    if (lang === "fr") {
      const datePart = formattedDateFr ? ` le ${formattedDateFr}` : "";
      const dishPart = dishesList ? `. Plats : ${dishesList}` : "";
      return `Bonjour, je souhaite réserver un dîner en famille marocaine pour ${guests} personne${guests > 1 ? "s" : ""}${datePart}${dishPart}.`;
    }
    if (lang === "ar") {
      const datePart = formattedDateAr ? ` بتاريخ ${formattedDateAr}` : "";
      const dishPart = dishesList ? `. الأطباق: ${dishesList}` : "";
      return `مرحباً، أود حجز عشاء مع عائلة مغربية لـ ${guests} ضيوف${datePart}${dishPart}.`;
    }
    const datePart = formattedDateEn ? ` on ${formattedDateEn}` : "";
    const dishPart = dishesList ? `. Dishes: ${dishesList}` : "";
    return `Hello, I would like to book a dinner with a Moroccan family for ${guests} guest${guests > 1 ? "s" : ""}${datePart}${dishPart}.`;
  }, [lang, guests, formattedDateEn, formattedDateFr, formattedDateAr, selectedDishes]);

  const waHref = options?.whatsapp
    ? `https://wa.me/${options.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`
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
    if (isSelected) {
      setDishWarning(false);
      setSelectedDishes((prev) =>
        prev.filter(
          (d) =>
            d !== dish.label[lang] &&
            d !== dish.label.en &&
            d !== dish.label.fr &&
            d !== dish.label.ar &&
            d !== dish.id,
        ),
      );
    } else {
      if (selectedDishes.length >= 2) {
        setDishWarning(true);
        return;
      }
      setDishWarning(false);
      setSelectedDishes((prev) => [...prev, dish.label[lang]]);
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isNameValid = name.trim().length >= 2;
  const isPhoneValid = phone.trim().length >= 3;
  const isDishesValid = selectedDishes.length === 2;
  const isDateValid = Boolean(date);

  // Stepper completion checks
  const step1Complete = isDateValid;
  const step2Complete = guests >= 1 && isDishesValid;
  const step3Complete = isNameValid && isPhoneValid && isEmailValid;

  const canSubmit =
    isDateValid && isNameValid && isPhoneValid && isEmailValid && guests >= 1 && isDishesValid;

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
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

  // =========================================================================
  // SUCCESS STATE (calm confirmation card with green check, recap, next steps, Back to top)
  // =========================================================================
  if (confirmation) {
    return (
      <BookingFrame>
        <div
          className="rounded-[28px] border border-stone-200/90 bg-white p-6 sm:p-10 lg:p-12 text-center shadow-soft max-w-3xl mx-auto"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          {/* Large green check */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-accent border-2 border-emerald-200/80 shadow-soft">
            <Check className="h-10 w-10 stroke-[2.5]" aria-hidden />
          </div>

          <h2 className="mt-6 font-display text-3xl sm:text-4xl font-bold text-foreground">
            {lang === "fr" ? "Demande envoyée" : lang === "ar" ? "تم إرسال الطلب" : "Request sent"}
          </h2>

          <p className="mt-3 text-base text-foreground/75 max-w-xl mx-auto leading-relaxed">
            {lang === "fr"
              ? `Merci ${name} ! Votre demande pour ${guests} personne${guests > 1 ? "s" : ""} a bien été transmise à la famille d'accueil.`
              : lang === "ar"
                ? `شكراً لك ${name}! تم إرسال طلبك لـ ${guests} ضيوف إلى العائلة المستضيفة.`
                : `Thank you, ${name}! Your booking request for ${guests} guest${guests > 1 ? "s" : ""} has been sent to the host family.`}
          </p>

          {/* Recap card */}
          <div className="mt-8 rounded-[20px] border border-stone-200 bg-stone-50/70 p-6 sm:p-7 text-start shadow-soft">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-stone-200 pb-3">
              {lang === "fr"
                ? "Récapitulatif de votre demande"
                : lang === "ar"
                  ? "ملخص تفاصيل الحجز"
                  : "Your booking recap"}
            </h3>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground font-medium">
                  {lang === "fr" ? "Date" : lang === "ar" ? "التاريخ" : "Date"}
                </dt>
                <dd className="font-bold text-foreground capitalize mt-0.5">
                  {formatDateInWords(confirmation.date, lang)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground font-medium">
                  {lang === "fr" ? "Heure de début" : lang === "ar" ? "وقت البداية" : "Start time"}
                </dt>
                <dd className="font-bold text-foreground mt-0.5">19:00</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground font-medium">
                  {lang === "fr" ? "Invités" : lang === "ar" ? "الضيوف" : "Guests"}
                </dt>
                <dd className="font-bold text-foreground mt-0.5">
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
              <div>
                <dt className="text-xs text-muted-foreground font-medium">
                  {lang === "fr" ? "Coordonnées" : lang === "ar" ? "معلومات التواصل" : "Contact"}
                </dt>
                <dd className="font-medium text-foreground mt-0.5">
                  {name} · {phone}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground font-medium">
                  {lang === "fr"
                    ? "Plats choisis (2)"
                    : lang === "ar"
                      ? "الأطباق المختارة (2)"
                      : "Selected main dishes (2)"}
                </dt>
                <dd className="font-semibold text-primary mt-0.5">
                  {selectedDishes.join(", ") || "—"}
                </dd>
              </div>
              {allergies && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground font-medium">
                    {lang === "fr"
                      ? "Allergies / régimes"
                      : lang === "ar"
                        ? "الحساسية"
                        : "Allergies / dietary needs"}
                  </dt>
                  <dd className="font-medium text-foreground mt-0.5">{allergies}</dd>
                </div>
              )}
              {message && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground font-medium">
                    {lang === "fr" ? "Message" : lang === "ar" ? "رسالة" : "Message"}
                  </dt>
                  <dd className="font-medium text-foreground mt-0.5">{message}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* What happens next 1-2-3 list */}
          <div className="mt-6 rounded-[20px] border border-stone-200 bg-stone-50/50 p-6 text-start">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
              {lang === "fr"
                ? "Comment ça se passe ensuite :"
                : lang === "ar"
                  ? "ماذا يحدث الآن؟"
                  : "What happens next"}
            </h4>
            <ol className="space-y-3 text-sm text-foreground/80">
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white font-bold text-xs">
                  ✓
                </span>
                <span>
                  <strong>
                    {lang === "fr"
                      ? "1. Vous avez envoyé la demande."
                      : lang === "ar"
                        ? "1. أرسلت طلب الحجز بنجاح."
                        : "1. You sent the request."}
                  </strong>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  2
                </span>
                <span>
                  <strong>
                    {lang === "fr"
                      ? "2. L'hôte confirme votre table"
                      : lang === "ar"
                        ? "2. يؤكد المضيف طاولتك"
                        : "2. The host confirms by WhatsApp or email"}
                  </strong>{" "}
                  {lang === "fr"
                    ? "et vous communique l'adresse exacte de la maison familiale dans Marrakech."
                    : lang === "ar"
                      ? "ويشاركك العنوان التفصيلي للبيت في مراكش."
                      : "and provides the exact family home address in Marrakech."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  3
                </span>
                <span>
                  <strong>
                    {lang === "fr"
                      ? "3. Vous profitez de votre soirée."
                      : lang === "ar"
                        ? "3. تستمتع بأمسيتك العائلية."
                        : "3. You enjoy the evening."}
                  </strong>{" "}
                  {lang === "fr"
                    ? "Accueil au thé, cuisine partagée, grand dîner et musique traditionnelle."
                    : lang === "ar"
                      ? "استقبال بالشاي، مشاركة في الطبخ، عشاء أصيل وموسيقى تراثية."
                      : "Welcome mint tea, cooking together, authentic table and traditional music."}
                </span>
              </li>
            </ol>
          </div>

          {/* Action buttons: Back to top + Book another date */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="btn btn-primary h-12 px-7 text-sm font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
            >
              <ArrowUp className="h-4 w-4" />
              <span>
                {lang === "fr" ? "Retour en haut" : lang === "ar" ? "العودة للأعلى" : "Back to top"}
              </span>
            </Button>
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
              className="h-12 px-6 border-stone-300 text-foreground hover:bg-stone-100 text-sm font-semibold cursor-pointer"
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
                className="btn btn-secondary inline-flex items-center gap-2 h-12 px-6 text-sm font-semibold"
              >
                <MessageCircle className="h-4 w-4 text-accent" />
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </BookingFrame>
    );
  }

  // =========================================================================
  // MAIN BOOKING FORM
  // =========================================================================
  return (
    <BookingFrame>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        noValidate
        className="w-full rounded-[28px] border border-stone-200/80 bg-white p-3.5 sm:p-10 lg:p-12 shadow-soft pb-36 lg:pb-12"
      >
        {/* =========================================================
            SLIM PROGRESS STEPPER AT TOP (32px circles, 12-13px labels, RTL-correct)
        ========================================================= */}
        <div
          className="w-full pb-6 sm:pb-8 border-b border-border/70 mb-6 sm:mb-8"
          dir={lang === "ar" ? "rtl" : "ltr"}
          aria-label="Booking steps"
        >
          <div className="flex items-center justify-between max-w-2xl mx-auto px-1 sm:px-2">
            {/* Step 1: Date */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <div
                className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all ${
                  step1Complete
                    ? "bg-accent text-white shadow-xs"
                    : "bg-primary text-white shadow-xs ring-4 ring-primary/10"
                }`}
              >
                {step1Complete ? <Check className="h-4 w-4 stroke-[3]" /> : "1"}
              </div>
              <span
                className={`text-[12px] sm:text-[13px] leading-tight font-semibold max-w-[65px] sm:max-w-none text-start break-words ${
                  step1Complete ? "text-accent" : "text-foreground"
                }`}
              >
                {lang === "fr" ? "Date" : lang === "ar" ? "التاريخ" : "Date"}
              </span>
            </div>

            {/* Connecting line 1 -> 2 */}
            <div
              className={`h-0.5 flex-1 min-w-[8px] sm:min-w-[16px] mx-1 sm:mx-3 transition-colors ${
                step1Complete ? "bg-accent" : "bg-stone-200"
              }`}
            />

            {/* Step 2: Guests & dishes */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <div
                className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all ${
                  step2Complete
                    ? "bg-accent text-white shadow-xs"
                    : step1Complete
                      ? "bg-primary text-white shadow-xs ring-4 ring-primary/10"
                      : "bg-stone-100 text-stone-500 border border-stone-300"
                }`}
              >
                {step2Complete ? <Check className="h-4 w-4 stroke-[3]" /> : "2"}
              </div>
              <span
                className={`text-[12px] sm:text-[13px] leading-tight font-semibold max-w-[80px] sm:max-w-none text-start break-words ${
                  step2Complete
                    ? "text-accent"
                    : step1Complete
                      ? "text-foreground"
                      : "text-stone-500"
                }`}
              >
                {lang === "fr"
                  ? "Invités & plats"
                  : lang === "ar"
                    ? "الضيوف والأطباق"
                    : "Guests & dishes"}
              </span>
            </div>

            {/* Connecting line 2 -> 3 */}
            <div
              className={`h-0.5 flex-1 min-w-[8px] sm:min-w-[16px] mx-1 sm:mx-3 transition-colors ${
                step2Complete ? "bg-accent" : "bg-stone-200"
              }`}
            />

            {/* Step 3: Your details */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <div
                className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all ${
                  step3Complete
                    ? "bg-accent text-white shadow-xs"
                    : step2Complete
                      ? "bg-primary text-white shadow-xs ring-4 ring-primary/10"
                      : "bg-stone-100 text-stone-500 border border-stone-300"
                }`}
              >
                {step3Complete ? <Check className="h-4 w-4 stroke-[3]" /> : "3"}
              </div>
              <span
                className={`text-[12px] sm:text-[13px] leading-tight font-semibold max-w-[75px] sm:max-w-none text-start break-words ${
                  step3Complete
                    ? "text-accent"
                    : step2Complete
                      ? "text-foreground"
                      : "text-stone-500"
                }`}
              >
                {lang === "fr" ? "Vos coordonnées" : lang === "ar" ? "بياناتكم" : "Your details"}
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================
            TWO-COLUMN DESKTOP LAYOUT (lg:grid-cols-12)
        ========================================================= */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* =========================================================
              LEFT COLUMN: FORM FIELDS (lg:col-span-7)
          ========================================================= */}
          <div className="lg:col-span-7 space-y-10">
            {/* -------------------------------------------------------
                SECTION 1: CALENDAR
            ------------------------------------------------------- */}
            <div>
              <div className="flex items-center gap-3 mb-5 text-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
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

              <div className="flex flex-col items-center">
                <Calendar
                  mode="single"
                  startMonth={new Date()}
                  dir={lang === "ar" ? "rtl" : "ltr"}
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
                  disabled={(d) =>
                    !availableDates.some((a) => a.toDateString() === d.toDateString())
                  }
                  modifiers={{
                    available: availableDates,
                    fullyBooked: fullyBookedDates,
                    closed: closedDates,
                  }}
                  formatters={{
                    formatWeekdayName: (dayDate) => {
                      const dayIdx = dayDate.getDay();
                      return WEEKDAY_NAMES[lang]?.[dayIdx] ?? "";
                    },
                  }}
                  className="w-full max-w-lg rounded-2xl border border-border p-3 sm:p-5 bg-background shadow-xs booking-calendar overflow-hidden"
                  classNames={{
                    caption_label:
                      "font-display text-xl sm:text-2xl font-bold text-primary tracking-wide",
                    button_previous:
                      "h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-border/80 hover:bg-muted text-primary flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none aria-disabled:opacity-30 aria-disabled:pointer-events-none",
                    button_next:
                      "h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-border/80 hover:bg-muted text-primary flex items-center justify-center transition-colors",
                    weekday:
                      "flex items-center justify-center text-center text-[12px] sm:text-[13px] uppercase text-stone-500 font-semibold py-1 select-none min-w-0",
                  }}
                />

                {/* Calendar Legend */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-foreground/85">
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
                    {lang === "fr" ? "Disponible" : lang === "ar" ? "متاح" : "Available"}
                  </span>
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span
                      className="h-3.5 w-3.5 rounded-md bg-primary shadow-2xs"
                      aria-hidden="true"
                    />
                    {lang === "fr" ? "Sélectionné" : lang === "ar" ? "المحدد" : "Selected"}
                  </span>
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span
                      className="relative flex h-3.5 w-3.5 items-center justify-center rounded-md border border-red-300 bg-red-50 overflow-hidden"
                      aria-hidden="true"
                    >
                      <span className="absolute h-[1.5px] w-5 rotate-45 bg-red-500" />
                    </span>
                    {lang === "fr" ? "Complet" : lang === "ar" ? "محجوز بالكامل" : "Fully booked"}
                  </span>
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span
                      className="h-3.5 w-3.5 rounded-md border border-stone-200 bg-stone-100 opacity-60"
                      aria-hidden="true"
                    />
                    {lang === "fr"
                      ? "Fermé / Passé"
                      : lang === "ar"
                        ? "مغلق / ماضٍ"
                        : "Closed / Past"}
                  </span>
                </div>

                {/* Start time "19:00" displayed under calendar once a day is picked */}
                {date ? (
                  <div className="mt-5 w-full max-w-lg rounded-2xl border border-primary/20 bg-primary/5 p-4 text-start shadow-xs animate-in fade-up">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-primary">
                          {lang === "fr"
                            ? "Date sélectionnée"
                            : lang === "ar"
                              ? "التاريخ المحدد"
                              : "Selected date"}
                        </p>
                        <p className="mt-1 font-display text-lg sm:text-xl font-bold text-foreground capitalize">
                          {formatDateInWords(date, lang)}
                        </p>
                      </div>
                      <div className="text-end shrink-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary text-white px-3.5 py-1.5 text-xs font-bold shadow-xs">
                          <Clock className="h-3.5 w-3.5" />
                          19:00
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 w-full max-w-lg rounded-xl border border-border/80 bg-stone-50/70 p-3.5 text-center">
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 font-medium">
                      <CalendarDays className="h-4 w-4 text-primary" />
                      {lang === "fr"
                        ? "Cliquez sur une date verte disponible"
                        : lang === "ar"
                          ? "انقر على تاريخ متاح بالأخضر"
                          : "Click on an available green date"}
                    </p>
                    {touched.date && !date && (
                      <p
                        role="alert"
                        className="mt-2 text-xs font-semibold text-destructive flex items-center justify-center gap-1.5"
                      >
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>
                          {lang === "fr"
                            ? "Veuillez sélectionner un jour sur le calendrier."
                            : lang === "ar"
                              ? "يرجى تحديد تاريخ على التقويم."
                              : "Please choose a day on the calendar."}
                        </span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* -------------------------------------------------------
                SECTION 2: GUESTS & DISHES
            ------------------------------------------------------- */}
            <div className="pt-6 border-t border-border/70 space-y-7">
              <div className="flex items-center gap-3 text-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  2
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {lang === "fr"
                    ? "Invités & plats"
                    : lang === "ar"
                      ? "الضيوف والأطباق"
                      : "Guests & dishes"}
                </h3>
              </div>

              {/* Number of guests stepper (- / number / +) limited to 1 to 8 */}
              <div>
                <Label className="text-sm font-semibold text-foreground mb-2 block">
                  {lang === "fr"
                    ? "Nombre de personnes"
                    : lang === "ar"
                      ? "عدد الضيوف"
                      : "Number of guests"}{" "}
                  *
                </Label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={
                      lang === "fr"
                        ? "Diminuer le nombre d'invités"
                        : lang === "ar"
                          ? "تقليل عدد الضيوف"
                          : "Decrease number of guests"
                    }
                    disabled={guests <= 1}
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-xl border border-input bg-white text-foreground shadow-2xs hover:bg-stone-100 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <span className="min-w-[56px] text-center font-display text-3xl font-bold text-foreground">
                    {guests}
                  </span>
                  <button
                    type="button"
                    aria-label={
                      lang === "fr"
                        ? "Augmenter le nombre d'invités"
                        : lang === "ar"
                          ? "زيادة عدد الضيوف"
                          : "Increase number of guests"
                    }
                    disabled={guests >= 8}
                    onClick={() => setGuests((g) => Math.min(8, g + 1))}
                    className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-xl border border-input bg-white text-foreground shadow-2xs hover:bg-stone-100 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  <span className="text-xs sm:text-sm text-muted-foreground ms-2">
                    {lang === "fr"
                      ? "(1 à 8 personnes par soirée)"
                      : lang === "ar"
                        ? "(من 1 إلى 8 ضيوف لكل أمسية)"
                        : "(1 to 8 guests per evening)"}
                  </span>
                </div>
              </div>

              {/* Dishes selection: 7 tappable cards in two columns with green check and 1/2 counter */}
              <div>
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
                    ? "Choisissez 2 plats qui seront préparés et partagés autour de la table."
                    : lang === "ar"
                      ? "اختر طبقين رئيسيين سيتم إعدادهما ومشاركتهما على المائدة."
                      : "Choose 2 dishes to be prepared and shared around the family table."}
                </p>

                {/* Gentle 3rd selection blocking notice */}
                {dishWarning && (
                  <div
                    role="status"
                    className="mt-3 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-2.5 text-xs text-amber-900 font-medium"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
                    <span>
                      {lang === "fr"
                        ? "Vous pouvez choisir 2 plats maximum. Décochez-en un pour en choisir un autre."
                        : lang === "ar"
                          ? "يمكنك اختيار طبقين رئيسيين كحد أقصى. قم بإلغاء تحديد طبق لاختيار غيره."
                          : "You can select up to 2 main dishes. Deselect one to pick another."}
                    </span>
                  </div>
                )}

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
                            : "border-border/80 bg-white hover:border-primary/50 hover:bg-stone-50/50"
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
                  <p
                    role="alert"
                    className="mt-2 text-xs font-semibold text-destructive flex items-center gap-1.5"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>
                      {lang === "fr"
                        ? "Veuillez choisir exactement 2 plats principaux."
                        : lang === "ar"
                          ? "يرجى اختيار طبقين رئيسيين بالضبط."
                          : "Please choose exactly 2 main dishes."}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* -------------------------------------------------------
                SECTION 3: DETAILS (52px inputs, labels above, validation)
            ------------------------------------------------------- */}
            <div className="pt-6 border-t border-border/70 space-y-5">
              <div className="flex items-center gap-3 text-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  3
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {lang === "fr" ? "Vos coordonnées" : lang === "ar" ? "بياناتكم" : "Your details"}
                </h3>
              </div>

              {/* Name */}
              <div>
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
                  className={`h-[52px] text-base rounded-xl border px-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary focus-visible:outline-none ${
                    touched.name && !isNameValid
                      ? "border-destructive focus-visible:ring-destructive"
                      : "border-input"
                  }`}
                />
                {touched.name && !isNameValid && (
                  <p
                    role="alert"
                    className="mt-1.5 text-xs font-semibold text-destructive flex items-center gap-1.5"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>
                      {lang === "fr"
                        ? "Veuillez indiquer votre nom complet (au moins 2 caractères)."
                        : lang === "ar"
                          ? "يرجى إدخال اسمك الكامل (حرفين على الأقل)."
                          : "Please enter your full name (at least 2 characters)."}
                    </span>
                  </p>
                )}
              </div>

              {/* Phone + Email */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                    className={`h-[52px] text-base rounded-xl border px-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary focus-visible:outline-none ${
                      touched.phone && !isPhoneValid
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input"
                    }`}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {lang === "fr"
                      ? "Avec l'indicatif pays (ex. +33, +212, +1)"
                      : lang === "ar"
                        ? "مع رمز الدولة (مثل +212، +33)"
                        : "Include country code (e.g. +33, +212, +1)"}
                  </p>
                  {touched.phone && !isPhoneValid && (
                    <p
                      role="alert"
                      className="mt-1.5 text-xs font-semibold text-destructive flex items-center gap-1.5"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>
                        {lang === "fr"
                          ? "Veuillez entrer un numéro de téléphone valide."
                          : lang === "ar"
                            ? "يرجى إدخال رقم هاتف صحيح."
                            : "Please enter a valid phone number."}
                      </span>
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
                    className={`h-[52px] text-base rounded-xl border px-4 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary focus-visible:outline-none ${
                      touched.email && !isEmailValid
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input"
                    }`}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {lang === "fr"
                      ? "Pour la confirmation écrite"
                      : lang === "ar"
                        ? "لتأكيد الحجز كتابياً"
                        : "For written booking confirmation"}
                  </p>
                  {touched.email && !isEmailValid && (
                    <p
                      role="alert"
                      className="mt-1.5 text-xs font-semibold text-destructive flex items-center gap-1.5"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>
                        {lang === "fr"
                          ? "Veuillez entrer une adresse email valide."
                          : lang === "ar"
                            ? "يرجى إدخال بريد إلكتروني صحيح."
                            : "Please enter a valid email address."}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Collapsed optional allergies and message toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowExtras((prev) => !prev)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark cursor-pointer py-1 transition-colors"
                >
                  {showExtras ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span>
                    {showExtras
                      ? lang === "fr"
                        ? "Masquer allergies et message"
                        : lang === "ar"
                          ? "إخفاء الحساسية والرسالة"
                          : "Hide allergies and message"
                      : lang === "fr"
                        ? "+ Ajouter des allergies ou un message"
                        : lang === "ar"
                          ? "+ إضافة حساسية أو رسالة خاصة"
                          : "+ Add allergies or a message"}
                  </span>
                </button>

                {(showExtras || allergies.trim() !== "" || message.trim() !== "") && (
                  <div className="mt-4 space-y-4 rounded-2xl border border-stone-200 bg-stone-50/60 p-4 sm:p-5 animate-in fade-up">
                    {/* Allergies */}
                    <div>
                      <Label
                        htmlFor="booking-dietary"
                        className="text-xs font-semibold text-foreground mb-1.5 block"
                      >
                        {lang === "fr"
                          ? "Allergies ou régimes alimentaires (facultatif)"
                          : lang === "ar"
                            ? "حساسية أو متطلبات غذائية (اختياري)"
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
                        className="w-full rounded-xl border border-input bg-white px-4 py-2.5 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <Label
                        htmlFor="booking-message"
                        className="text-xs font-semibold text-foreground mb-1.5 block"
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
                        className="w-full rounded-xl border border-input bg-white px-4 py-2.5 text-sm shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Error alert with retry button, preserving entered data */}
              {submitError && (
                <div
                  role="alert"
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl bg-destructive/10 border border-destructive/25 p-4 text-destructive"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span className="text-sm font-semibold">{submitError}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handleSubmit()}
                    className="shrink-0 h-9 px-4 border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-bold"
                  >
                    {lang === "fr" ? "Réessayer" : lang === "ar" ? "إعادة المحاولة" : "Retry"}
                  </Button>
                </div>
              )}

              {/* Mobile send button inline inside form */}
              <div className="lg:hidden pt-4 space-y-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full h-[56px] text-base font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>
                        {lang === "fr"
                          ? "Envoi en cours..."
                          : lang === "ar"
                            ? "جاري الإرسال..."
                            : "Sending request..."}
                      </span>
                    </>
                  ) : (
                    <span>
                      {lang === "fr"
                        ? "Envoyer la demande de réservation"
                        : lang === "ar"
                          ? "إرسال طلب الحجز"
                          : "Send booking request"}
                    </span>
                  )}
                </Button>

                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary w-full inline-flex items-center justify-center gap-2.5 h-[50px] text-sm font-semibold border-stone-300 hover:bg-stone-100"
                  >
                    <MessageCircle className="h-4 w-4 text-accent" />
                    <span>
                      {lang === "fr"
                        ? "Préférer WhatsApp ?"
                        : lang === "ar"
                          ? "تفضل عبر واتساب؟"
                          : "Prefer WhatsApp?"}
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: STICKY "YOUR BOOKING" SUMMARY PANEL (lg:col-span-5)
          ========================================================= */}
          <div className="hidden lg:block lg:col-span-5">
            <div className="sticky top-28 rounded-[28px] border border-stone-200/80 bg-paper p-6 sm:p-7 shadow-soft space-y-6">
              <div className="border-b border-stone-200/80 pb-4">
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {lang === "fr"
                    ? "Votre réservation"
                    : lang === "ar"
                      ? "ملخص حجزك"
                      : "Your booking"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "fr"
                    ? "Dîner chez une famille locale à Marrakech"
                    : lang === "ar"
                      ? "عشاء عند عائلة محلية في مراكش"
                      : "Dinner with a local family in Marrakech"}
                </p>
              </div>

              {/* Booking details recap */}
              <dl className="space-y-4 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-primary shrink-0" />
                    <span>{lang === "fr" ? "Date" : lang === "ar" ? "التاريخ" : "Date"}</span>
                  </dt>
                  <dd className="font-semibold text-foreground text-end capitalize">
                    {date ? (
                      formatDateInWords(date, lang)
                    ) : (
                      <span className="text-muted-foreground italic font-normal">
                        {lang === "fr"
                          ? "À choisir sur le calendrier"
                          : lang === "ar"
                            ? "يرجى تحديد التاريخ"
                            : "Select on calendar"}
                      </span>
                    )}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span>{lang === "fr" ? "Heure" : lang === "ar" ? "الوقت" : "Time"}</span>
                  </dt>
                  <dd className="font-semibold text-foreground">19:00</dd>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-primary shrink-0" />
                    <span>{lang === "fr" ? "Invités" : lang === "ar" ? "الضيوف" : "Guests"}</span>
                  </dt>
                  <dd className="font-semibold text-foreground">
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
                  </dd>
                </div>

                <div className="pt-2 border-t border-stone-200/60">
                  <dt className="text-muted-foreground font-medium mb-1.5">
                    {lang === "fr"
                      ? "Plats principaux (2)"
                      : lang === "ar"
                        ? "الأطباق الرئيسية (2)"
                        : "Main dishes (2)"}
                    :
                  </dt>
                  <dd className="font-medium text-foreground">
                    {selectedDishes.length > 0 ? (
                      <ul className="space-y-1">
                        {selectedDishes.map((dish, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-xs font-semibold text-primary"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            {dish}
                          </li>
                        ))}
                        {selectedDishes.length < 2 && (
                          <li className="text-xs text-muted-foreground italic">
                            {lang === "fr"
                              ? "+ Choisissez encore 1 plat"
                              : lang === "ar"
                                ? "+ اختر طبقاً إضافياً"
                                : "+ Pick 1 more dish"}
                          </li>
                        )}
                      </ul>
                    ) : (
                      <span className="text-xs text-muted-foreground italic font-normal">
                        {lang === "fr"
                          ? "Aucun plat sélectionné"
                          : lang === "ar"
                            ? "لم يتم تحديد أطباق بعد"
                            : "No dishes selected yet"}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>

              {/* What happens next list (1 you send, 2 host confirms, 3 enjoy evening) */}
              <div className="rounded-xl border border-stone-200/80 bg-white p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  {lang === "fr"
                    ? "Comment ça se passe :"
                    : lang === "ar"
                      ? "ماذا يحدث بعد ذلك؟"
                      : "What happens next"}
                </h4>
                <ol className="space-y-2.5 text-xs text-foreground/80">
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                      1
                    </span>
                    <span>
                      {lang === "fr"
                        ? "Vous envoyez la demande de réservation."
                        : lang === "ar"
                          ? "ترسل طلب الحجز."
                          : "You send the booking request."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                      2
                    </span>
                    <span>
                      {lang === "fr"
                        ? "L'hôte confirme par WhatsApp ou email."
                        : lang === "ar"
                          ? "يؤكد المضيف عبر واتساب أو البريد."
                          : "The host confirms by WhatsApp or email."}
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px]">
                      3
                    </span>
                    <span>
                      {lang === "fr"
                        ? "Vous profitez pleinement de la soirée."
                        : lang === "ar"
                          ? "تستمتع بأمسيتك العائلية."
                          : "You enjoy the evening."}
                    </span>
                  </li>
                </ol>
              </div>

              {/* Desktop Send button (56px, full width, burgundy, loading spinner) */}
              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full h-[56px] text-base font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>
                        {lang === "fr"
                          ? "Envoi en cours..."
                          : lang === "ar"
                            ? "جاري الإرسال..."
                            : "Sending request..."}
                      </span>
                    </>
                  ) : (
                    <span>
                      {lang === "fr"
                        ? "Envoyer la demande"
                        : lang === "ar"
                          ? "إرسال طلب الحجز"
                          : "Send booking request"}
                    </span>
                  )}
                </Button>

                {/* Secondary outlined WhatsApp button */}
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary w-full inline-flex items-center justify-center gap-2.5 h-[50px] text-sm font-semibold border-stone-300 hover:bg-stone-100"
                  >
                    <MessageCircle className="h-4 w-4 text-accent" />
                    <span>
                      {lang === "fr"
                        ? "Préférer WhatsApp ?"
                        : lang === "ar"
                          ? "تفضل عبر واتساب؟"
                          : "Prefer WhatsApp?"}
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* =========================================================
          STICKY BOTTOM BAR ON PHONES (<1024px)
          Row 1 = summary at 14px, allowed to wrap to 2 lines + disabled reason
          Row 2 = full-width 52px Send button with full label, never truncated
      ========================================================= */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 p-3 sm:p-4 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden booking-sticky-bar"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div className="max-w-md mx-auto space-y-2">
          {/* Row 1: Summary at 14px, allowed to wrap to two lines */}
          <div className="flex flex-col gap-0.5">
            <p className="text-[14px] leading-snug font-semibold text-foreground">
              {date ? (
                formatShortDateInWords(date, lang)
              ) : (
                <span className="text-muted-foreground italic font-normal">
                  {lang === "fr" ? "Date à choisir" : lang === "ar" ? "حدد التاريخ" : "Pick a date"}
                </span>
              )}
              {", 19:00"}
              {" · "}
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
              {" · "}
              {selectedDishes.length}/2 {lang === "fr" ? "plats" : lang === "ar" ? "أطباق" : "dishes"}
            </p>

            {/* Disabled state reason */}
            {!canSubmit && (
              <p className="text-[12px] font-medium text-amber-800">
                {!date
                  ? lang === "fr"
                    ? "Choisissez un jour sur le calendrier"
                    : lang === "ar"
                      ? "اختر يوماً من التقويم"
                      : "Pick a day on the calendar"
                  : selectedDishes.length !== 2
                    ? lang === "fr"
                      ? "Choisissez 2 plats principaux"
                      : lang === "ar"
                        ? "اختر طبقين رئيسيين"
                        : "Choose 2 main dishes"
                    : !isNameValid || !isPhoneValid || !isEmailValid
                      ? lang === "fr"
                        ? "Remplissez vos coordonnées ci-dessus"
                        : lang === "ar"
                          ? "أكمل بياناتك الشخصية أعلاه"
                          : "Fill in your details above"
                      : ""}
              </p>
            )}
          </div>

          {/* Row 2: Full-width 52px Send button with full label */}
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || !canSubmit}
            className="btn btn-primary w-full h-[52px] text-base font-bold shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>
                  {lang === "fr"
                    ? "Envoi en cours..."
                    : lang === "ar"
                      ? "جاري الإرسال..."
                      : "Sending request..."}
                </span>
              </>
            ) : (
              <span>
                {lang === "fr"
                  ? "Envoyer la demande de réservation"
                  : lang === "ar"
                    ? "إرسال طلب الحجز"
                    : "Send booking request"}
              </span>
            )}
          </Button>
        </div>
      </div>
    </BookingFrame>
  );
}

function BookingFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1180px] px-0 sm:px-2 py-4 sm:py-6">{children}</div>;
}
