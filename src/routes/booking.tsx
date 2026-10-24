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
  ShieldCheck,
  MapPin,
  Sun,
  Moon,
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
  const [allergies, setAllergies] = useState("");
  const [message, setMessage] = useState("");
  const [showExtras, setShowExtras] = useState(false);

  type TouchedState = {
    name?: boolean;
    phone?: boolean;
    email?: boolean;
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

  const [selectedExperienceId, setSelectedExperienceId] = useState<string>(
    initialExperienceId || "family-dinner-marrakech",
  );

  useEffect(() => {
    if (initialExperienceId) {
      setSelectedExperienceId(initialExperienceId);
    } else if (options?.experiences && options.experiences.length > 0) {
      if (!options.experiences.some((e) => e.id === selectedExperienceId)) {
        setSelectedExperienceId(options.experiences[0]!.id);
      }
    }
  }, [initialExperienceId, options]);

  const targetExperienceId = selectedExperienceId;
  const targetExperience =
    options?.experiences.find((e) => e.id === targetExperienceId) ??
    options?.experiences[0] ??
    null;

  const startTimeDisplay = useMemo(() => {
    if (targetExperience?.id === "family-lunch-marrakech" || targetExperience?.start_time?.slice(0, 5) === "14:30") {
      return lang === "fr" ? "14h30 – 17h00" : "14:30 – 17:00";
    }
    if (targetExperience?.id === "family-dinner-marrakech" || targetExperience?.start_time?.slice(0, 5) === "19:00") {
      return lang === "fr" ? "19h00 – 22h00" : "19:00 – 22:00";
    }
    return targetExperience?.start_time?.slice(0, 5) || "19:00";
  }, [targetExperience, lang]);

  const experienceSubtitle = useMemo(() => {
    if (targetExperience?.id === "family-lunch-marrakech") {
      return lang === "fr"
        ? "Déjeuner chez une famille locale à Marrakech"
        : lang === "ar"
          ? "غداء عند عائلة محلية في مراكش"
          : "Lunch with a local family in Marrakech";
    }
    return lang === "fr"
      ? "Dîner chez une famille locale à Marrakech"
      : lang === "ar"
        ? "عشاء عند عائلة محلية في مراكش"
        : "Dinner with a local family in Marrakech";
  }, [targetExperience, lang]);

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
        ?.filter((slot) => slot.experienceId === targetExperienceId && slot.state === "full")
        .map((slot) => new Date(`${slot.date}T12:00:00`)) ?? [],
    [options, targetExperienceId],
  );

  const closedDates = useMemo(
    () =>
      options?.calendarStatuses
        ?.filter((slot) => slot.experienceId === targetExperienceId && slot.state === "closed")
        .map((slot) => new Date(`${slot.date}T12:00:00`)) ?? [],
    [options, targetExperienceId],
  );

  // WhatsApp prefilled link with chosen date and guests
  const formattedDateEn = date ? formatDateInWords(date, "en") : "";
  const formattedDateFr = date ? formatDateInWords(date, "fr") : "";
  const formattedDateAr = date ? formatDateInWords(date, "ar") : "";

  const whatsappMessage = useMemo(() => {
    const isLunch = targetExperience?.id === "family-lunch-marrakech";
    const mealEn = isLunch ? "lunch" : "dinner";
    const mealFr = isLunch ? "déjeuner" : "dîner";
    const mealAr = isLunch ? "غداء" : "عشاء";
    const timeSlotEn = isLunch ? " (14:30 – 17:00)" : " (19:00 – 22:00)";
    const timeSlotFr = isLunch ? " (14h30 – 17h00)" : " (19h00 – 22h00)";
    const timeSlotAr = isLunch ? " (14:30 – 17:00)" : " (19:00 – 22:00)";

    if (lang === "fr") {
      const datePart = formattedDateFr ? ` le ${formattedDateFr}${timeSlotFr}` : "";
      return `Bonjour, je souhaite réserver un ${mealFr} en famille marocaine pour ${guests} personne${guests > 1 ? "s" : ""}${datePart}.`;
    }
    if (lang === "ar") {
      const datePart = formattedDateAr ? ` بتاريخ ${formattedDateAr}${timeSlotAr}` : "";
      return `مرحباً، أود حجز ${mealAr} مع عائلة مغربية لـ ${guests} ضيوف${datePart}.`;
    }
    const datePart = formattedDateEn ? ` on ${formattedDateEn}${timeSlotEn}` : "";
    return `Hello, I would like to book a ${mealEn} with a Moroccan family for ${guests} guest${guests > 1 ? "s" : ""}${datePart}.`;
  }, [lang, guests, formattedDateEn, formattedDateFr, formattedDateAr, targetExperience]);

  const waHref = options?.whatsapp
    ? `https://wa.me/${options.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`
    : null;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isNameValid = name.trim().length >= 2;
  const isPhoneValid = phone.trim().length >= 3;
  const isDateValid = Boolean(date);

  // Stepper completion checks
  const step1Complete = isDateValid;
  const step2Complete = guests >= 1;
  const step3Complete = isNameValid && isPhoneValid && isEmailValid;

  const canSubmit = isDateValid && isNameValid && isPhoneValid && isEmailValid && guests >= 1;

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    setTouched({ name: true, phone: true, email: true, date: true });

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
      mealChoice: "",
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
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground font-medium">
                  {lang === "fr" ? "Expérience" : lang === "ar" ? "التجربة" : "Experience"}
                </dt>
                <dd className="font-bold text-foreground mt-0.5">
                  {confirmation.experience_title[lang] || experienceSubtitle}
                </dd>
              </div>
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
                <dd className="font-bold text-foreground mt-0.5">{startTimeDisplay}</dd>
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
                    ? "Conditions d'annulation"
                    : lang === "ar"
                      ? "سياسة الإلغاء"
                      : "Cancellation policy"}
                </dt>
                <dd className="font-medium text-foreground mt-0.5">
                  {lang === "fr"
                    ? "Remboursement intégral en annulant au moins 1 jour (24 h) avant ; aucun remboursement après."
                    : lang === "ar"
                      ? "استرداد كامل عند الإلغاء قبل يوم واحد (24 ساعة) على الأقل؛ ولا استرداد بعد ذلك."
                      : "Full refund when cancelling at least 1 day (24 hours) before; nothing after."}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-muted-foreground font-medium">
                  {lang === "fr"
                    ? "Lieu de rendez-vous public"
                    : lang === "ar"
                      ? "منطقة اللقاء العامة"
                      : "Public meeting area"}
                </dt>
                <dd className="font-medium text-foreground mt-0.5">
                  Bab Ghmat, Marrakech
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
                    ? "Dîner traditionnel fait maison, plats locaux et échanges culturels."
                    : lang === "ar"
                      ? "عشاء تقليدي منزلي، أطباق محلية وتبادل ثقافي."
                      : "Traditional home-cooked dinner, local dishes and cultural exchange."}
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
        className="w-full rounded-[20px] border border-stone-200/60 bg-white p-4 sm:p-8 lg:p-10 shadow-soft"
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
                    ? "bg-gold text-oxblood shadow-xs"
                    : "bg-gold text-oxblood shadow-xs ring-4 ring-gold/25"
                }`}
              >
                {step1Complete ? <Check className="h-4 w-4 stroke-[3]" /> : "1"}
              </div>
              <span
                className={`text-[12px] sm:text-[13px] leading-tight font-semibold max-w-[65px] sm:max-w-none text-start break-words ${
                  step1Complete ? "text-gold" : "text-oxblood font-bold"
                }`}
              >
                {lang === "fr" ? "Date" : lang === "ar" ? "التاريخ" : "Date"}
              </span>
            </div>

            {/* Connecting line 1 -> 2 */}
            <div
              className={`h-0.5 flex-1 min-w-[8px] sm:min-w-[16px] mx-1 sm:mx-3 transition-colors ${
                step1Complete ? "bg-gold" : "bg-stone-200"
              }`}
            />

            {/* Step 2: Guests */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <div
                className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all ${
                  step2Complete
                    ? "bg-gold text-oxblood shadow-xs"
                    : step1Complete
                      ? "bg-gold text-oxblood shadow-xs ring-4 ring-gold/25"
                      : "bg-stone-100 text-stone-400 border border-stone-300"
                }`}
              >
                {step2Complete ? <Check className="h-4 w-4 stroke-[3]" /> : "2"}
              </div>
              <span
                className={`text-[12px] sm:text-[13px] leading-tight font-semibold max-w-[80px] sm:max-w-none text-start break-words ${
                  step2Complete
                    ? "text-gold"
                    : step1Complete
                      ? "text-oxblood font-bold"
                      : "text-stone-400"
                }`}
              >
                {lang === "fr" ? "Invités" : lang === "ar" ? "الضيوف" : "Guests"}
              </span>
            </div>

            {/* Connecting line 2 -> 3 */}
            <div
              className={`h-0.5 flex-1 min-w-[8px] sm:min-w-[16px] mx-1 sm:mx-3 transition-colors ${
                step2Complete ? "bg-gold" : "bg-stone-200"
              }`}
            />

            {/* Step 3: Your details */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <div
                className={`flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all ${
                  step3Complete
                    ? "bg-gold text-oxblood shadow-xs"
                    : step2Complete
                      ? "bg-gold text-oxblood shadow-xs ring-4 ring-gold/25"
                      : "bg-stone-100 text-stone-400 border border-stone-300"
                }`}
              >
                {step3Complete ? <Check className="h-4 w-4 stroke-[3]" /> : "3"}
              </div>
              <span
                className={`text-[12px] sm:text-[13px] leading-tight font-semibold max-w-[75px] sm:max-w-none text-start break-words ${
                  step3Complete
                    ? "text-gold"
                    : step2Complete
                      ? "text-oxblood font-bold"
                      : "text-stone-400"
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
                SECTION 1: SEATING & CALENDAR
            ------------------------------------------------------- */}
            <div>
              <div className="flex items-center gap-3 mb-5 text-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  1
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {lang === "fr"
                    ? "Choisissez votre créneau et la date"
                    : lang === "ar"
                      ? "اختر موعد الوجبة والتاريخ"
                      : "Choose seating & date"}
                </h3>
              </div>

              {/* Seating / Time slot selector */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-start">
                  {lang === "fr"
                    ? "Créneau au choix"
                    : lang === "ar"
                      ? "الموعد المفضل"
                      : "Available daily seatings"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Lunch Option */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedExperienceId !== "family-lunch-marrakech") {
                        setSelectedExperienceId("family-lunch-marrakech");
                      }
                    }}
                    className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      selectedExperienceId === "family-lunch-marrakech"
                        ? "border-gold bg-gold/10 ring-2 ring-gold/40 shadow-xs"
                        : "border-stone-200/90 hover:border-stone-300 bg-background"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Sun className="h-4 w-4 text-gold shrink-0" />
                        <span className="font-display font-bold text-foreground text-base">
                          {lang === "fr" ? "Déjeuner" : lang === "ar" ? "الغداء" : "Lunch"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-oxblood">
                        {lang === "fr" ? "14h30 – 17h00" : "14:30 – 17:00"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {lang === "fr" ? "Environ 2h30" : lang === "ar" ? "حوالي ساعتين ونصف" : "About 2.5 hours"}
                      </p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedExperienceId === "family-lunch-marrakech"
                          ? "border-gold bg-gold text-oxblood"
                          : "border-stone-300"
                      }`}
                    >
                      {selectedExperienceId === "family-lunch-marrakech" && (
                        <Check className="h-3 w-3 stroke-[3]" />
                      )}
                    </div>
                  </button>

                  {/* Dinner Option */}
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedExperienceId !== "family-dinner-marrakech") {
                        setSelectedExperienceId("family-dinner-marrakech");
                      }
                    }}
                    className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      selectedExperienceId === "family-dinner-marrakech"
                        ? "border-gold bg-gold/10 ring-2 ring-gold/40 shadow-xs"
                        : "border-stone-200/90 hover:border-stone-300 bg-background"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Moon className="h-4 w-4 text-oxblood shrink-0" />
                        <span className="font-display font-bold text-foreground text-base">
                          {lang === "fr" ? "Dîner" : lang === "ar" ? "العشاء" : "Dinner"}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-oxblood">
                        {lang === "fr" ? "19h00 – 22h00" : "19:00 – 22:00"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {lang === "fr" ? "Environ 3 heures" : lang === "ar" ? "حوالي 3 ساعات" : "About 3 hours"}
                      </p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                        selectedExperienceId === "family-dinner-marrakech"
                          ? "border-gold bg-gold text-oxblood"
                          : "border-stone-300"
                      }`}
                    >
                      {selectedExperienceId === "family-dinner-marrakech" && (
                        <Check className="h-3 w-3 stroke-[3]" />
                      )}
                    </div>
                  </button>
                </div>
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
                      "font-display text-xl sm:text-2xl font-bold text-oxblood tracking-wide",
                    button_previous:
                      "h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-stone-200/80 hover:bg-stone-100 text-oxblood flex items-center justify-center transition-colors disabled:opacity-30 disabled:pointer-events-none aria-disabled:opacity-30 aria-disabled:pointer-events-none",
                    button_next:
                      "h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-stone-200/80 hover:bg-stone-100 text-oxblood flex items-center justify-center transition-colors",
                    weekday:
                      "flex items-center justify-center text-center text-[12px] sm:text-[13px] uppercase text-stone-500 font-semibold py-1 select-none min-w-0",
                  }}
                />

                {/* Calendar Legend */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-foreground/85">
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2F5D34]" aria-hidden="true" />
                    {lang === "fr" ? "Disponible" : lang === "ar" ? "متاح" : "Available"}
                  </span>
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span
                      className="h-3.5 w-3.5 rounded-md bg-oxblood shadow-2xs"
                      aria-hidden="true"
                    />
                    {lang === "fr" ? "Sélectionné" : lang === "ar" ? "المحدد" : "Selected"}
                  </span>
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span
                      className="relative flex h-3.5 w-3.5 items-center justify-center rounded-md border border-stone-300 bg-stone-100 overflow-hidden"
                      aria-hidden="true"
                    >
                      <span className="absolute h-[1.5px] w-5 rotate-45 bg-stone-400" />
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
                SECTION 2: GUESTS
            ------------------------------------------------------- */}
            <div className="pt-6 border-t border-border/70 space-y-7">
              <div className="flex items-center gap-3 text-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  2
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {lang === "fr"
                    ? "Nombre d'invités"
                    : lang === "ar"
                      ? "عدد الضيوف"
                      : "Number of guests"}
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
                    className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full border border-stone-300 bg-white text-oxblood shadow-2xs hover:bg-stone-100 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
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
                    className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full border border-stone-300 bg-white text-oxblood shadow-2xs hover:bg-stone-100 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
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

              {/* =========================================================
                  MOBILE BOOKING SUMMARY & SEND BUTTON (lg:hidden)
                  In normal page flow inside the booking card after details fields
              ========================================================= */}
              <div className="lg:hidden mt-8 pt-6 border-t border-stone-200/80 space-y-6">
                <div className="rounded-[24px] border border-stone-200/80 bg-paper p-5 sm:p-6 shadow-soft space-y-6">
                  <div className="border-b border-stone-200/80 pb-4">
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      {lang === "fr"
                        ? "Votre réservation"
                        : lang === "ar"
                          ? "ملخص حجزك"
                          : "Your booking"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {experienceSubtitle}
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
                      <dd className="font-semibold text-foreground">{startTimeDisplay}</dd>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-muted-foreground font-medium flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          {lang === "fr" ? "Invités" : lang === "ar" ? "الضيوف" : "Guests"}
                        </span>
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

                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-200/60">
                      <dt className="text-muted-foreground font-medium flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          {lang === "fr"
                            ? "Lieu de rendez-vous"
                            : lang === "ar"
                              ? "منطقة اللقاء"
                              : "Meeting area"}
                        </span>
                      </dt>
                      <dd className="font-semibold text-foreground text-end">
                        Bab Ghmat, Marrakech
                      </dd>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60">
                      <dt className="text-muted-foreground font-medium flex items-center gap-1.5 mb-1">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                        <span>
                          {lang === "fr"
                            ? "Conditions d'annulation"
                            : lang === "ar"
                              ? "سياسة الإلغاء"
                              : "Cancellation policy"}
                        </span>
                      </dt>
                      <dd className="font-medium text-foreground text-xs leading-relaxed">
                        {lang === "fr"
                          ? "Remboursement intégral en annulant au moins 1 jour (24 h) avant ; aucun remboursement après."
                          : lang === "ar"
                            ? "استرداد كامل عند الإلغاء قبل يوم واحد (24 ساعة) على الأقل؛ ولا استرداد بعد ذلك."
                            : "Full refund when cancelling at least 1 day (24 hours) before; nothing after."}
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

                  {/* Mobile Send button (56px, full width, full label, disabled reason) */}
                  <div className="space-y-3 pt-2">
                    {!canSubmit && (
                      <p className="text-xs font-semibold text-amber-800 text-center">
                        {!date
                          ? lang === "fr"
                            ? "Choisissez un jour"
                            : lang === "ar"
                              ? "اختر يوماً"
                              : "Pick a day"
                          : lang === "fr"
                            ? "Complétez vos coordonnées"
                            : lang === "ar"
                              ? "أكمل بياناتك"
                              : "Fill in your details"}
                      </p>
                    )}
                    <Button
                      type="submit"
                      disabled={submitting || !canSubmit}
                      className="btn bg-oxblood text-white hover:bg-burgundy rounded-full w-full h-[56px] text-base font-bold shadow-btn cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {/* Secondary outlined WhatsApp button */}
                    {waHref && (
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary rounded-full w-full inline-flex items-center justify-center gap-2.5 h-[50px] text-sm font-semibold border-stone-300 hover:bg-stone-100"
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
                  {experienceSubtitle}
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
                  <dd className="font-semibold text-foreground">{startTimeDisplay}</dd>
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

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-200/60">
                  <dt className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      {lang === "fr"
                        ? "Lieu de rendez-vous"
                        : lang === "ar"
                          ? "منطقة اللقاء"
                          : "Meeting area"}
                    </span>
                  </dt>
                  <dd className="font-semibold text-foreground text-end">
                    Bab Ghmat, Marrakech
                  </dd>
                </div>

                <div className="pt-2 border-t border-stone-200/60">
                  <dt className="text-muted-foreground font-medium flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      {lang === "fr"
                        ? "Conditions d'annulation"
                        : lang === "ar"
                          ? "سياسة الإلغاء"
                          : "Cancellation policy"}
                    </span>
                  </dt>
                  <dd className="font-medium text-foreground text-xs leading-relaxed">
                    {lang === "fr"
                      ? "Remboursement intégral en annulant au moins 1 jour (24 h) avant ; aucun remboursement après."
                      : lang === "ar"
                        ? "استرداد كامل عند الإلغاء قبل يوم واحد (24 ساعة) على الأقل؛ ولا استرداد بعد ذلك."
                        : "Full refund when cancelling at least 1 day (24 hours) before; nothing after."}
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
                  className="btn bg-oxblood text-white hover:bg-burgundy rounded-full w-full h-[56px] text-base font-bold shadow-btn cursor-pointer flex items-center justify-center gap-2"
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
                    className="btn btn-secondary rounded-full w-full inline-flex items-center justify-center gap-2.5 h-[50px] text-sm font-semibold border-stone-300 hover:bg-stone-100"
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
    </BookingFrame>
  );
}

function BookingFrame({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}
