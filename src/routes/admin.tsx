import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import { CatalogManager } from "@/components/admin/CatalogManager";
import { GuestPhotoManager } from "@/components/admin/GuestPhotoManager";
import { parseCancellationTiers, type CancellationTier } from "@/lib/booking-pricing";
import { getCalendarSlotState, nextCalendarSlotState } from "@/lib/admin-calendar";

type Booking = Tables<"bookings">;
type Availability = Tables<"availability">;
type SiteSetting = Tables<"site_settings">;
type AdminLang = "en" | "fr" | "ar";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-12";

const ADMIN_I18N = {
  en: {
    title: "Moroccan Secrets Admin",
    subtitle: "Simplified management dashboard",
    bookings: "Bookings",
    calendar: "Calendar",
    experiences: "Experiences",
    photos: "Photos",
    settings: "Settings",
    refresh: "Refresh",
    signOut: "Sign out",
    exportCsv: "Export CSV",
    confirm: "Confirm",
    decline: "Decline",
    confirmed: "Confirmed",
    cancelled: "Declined / Cancelled",
    pending: "Pending",
    guest: "Guest",
    guests: "Guests",
    date: "Date",
    experience: "Experience",
    status: "Status",
    phone: "Phone",
    email: "Email",
    mainDishes: "Main dishes (choose 2)",
    allergiesDietary: "Allergies or dietary requirements",
    noBookings: "No booking requests yet.",
    calendarTitle: "Availability calendar",
    calendarDesc:
      "Tap any day to cycle: Available (Green) → Fully booked (Orange) → Closed (Grey). Changes appear immediately on the website.",
    available: "Available",
    fullyBooked: "Fully booked",
    closed: "Closed",
    capacity: "Capacity per day",
    selectExperience: "Choose experience",
    whatsappNumber: "WhatsApp number (with country code, e.g. 212600123456)",
    publicEmail: "Public contact email",
    cancellationPolicy: "Cancellation policy",
    policyFlexible: "Flexible (100% refund up to 24h before)",
    policyModerate: "Moderate (100% up to 48h before, 50% up to 24h)",
    policyStrict: "Strict (100% up to 7 days before, 50% up to 48h)",
    currency: "Currency (e.g. MAD, EUR, USD)",
    saveSettings: "Save settings",
    saving: "Saving…",
    saved: "Settings saved successfully.",
  },
  fr: {
    title: "Administration Moroccan Secrets",
    subtitle: "Tableau de bord simplifié",
    bookings: "Réservations",
    calendar: "Calendrier",
    experiences: "Expériences",
    photos: "Photos",
    settings: "Paramètres",
    refresh: "Actualiser",
    signOut: "Déconnexion",
    exportCsv: "Exporter CSV",
    confirm: "Confirmer",
    decline: "Refuser",
    confirmed: "Confirmée",
    cancelled: "Refusée / Annulée",
    pending: "En attente",
    guest: "Client",
    guests: "Personnes",
    date: "Date",
    experience: "Expérience",
    status: "Statut",
    phone: "Téléphone",
    email: "E-mail",
    mainDishes: "Plats principaux (choix de 2)",
    allergiesDietary: "Allergies ou régimes alimentaires",
    noBookings: "Aucune demande de réservation pour le moment.",
    calendarTitle: "Calendrier des disponibilités",
    calendarDesc:
      "Appuyez sur un jour pour changer : Disponible (Vert) → Complet (Orange) → Fermé (Gris). Visible immédiatement sur le site.",
    available: "Disponible",
    fullyBooked: "Complet",
    closed: "Fermé",
    capacity: "Capacité par jour",
    selectExperience: "Choisir l'expérience",
    whatsappNumber: "Numéro WhatsApp (avec indicatif, ex. 212600123456)",
    publicEmail: "E-mail public de contact",
    cancellationPolicy: "Politique d'annulation",
    policyFlexible: "Flexible (remboursement 100% jusqu'à 24h avant)",
    policyModerate: "Modérée (100% jusqu'à 48h avant, 50% jusqu'à 24h)",
    policyStrict: "Stricte (100% jusqu'à 7 jours avant, 50% jusqu'à 48h)",
    currency: "Devise (ex. MAD, EUR, USD)",
    saveSettings: "Enregistrer les paramètres",
    saving: "Enregistrement…",
    saved: "Paramètres enregistrés avec succès.",
  },
  ar: {
    title: "إدارة أسرار المغرب",
    subtitle: "لوحة تحكم مبسطة",
    bookings: "الحجوزات",
    calendar: "التقويم",
    experiences: "التجارب",
    photos: "الصور",
    settings: "الإعدادات",
    refresh: "تحديث",
    signOut: "تسجيل الخروج",
    exportCsv: "تصدير CSV",
    confirm: "تأكيد",
    decline: "رفض",
    confirmed: "مؤكد",
    cancelled: "مرفوض / ملغى",
    pending: "قيد الانتظار",
    guest: "الضيف",
    guests: "عدد الضيوف",
    date: "التاريخ",
    experience: "التجربة",
    status: "الحالة",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    mainDishes: "الأطباق الرئيسية (اختر 2)",
    allergiesDietary: "أي حساسية أو متطلبات غذائية",
    noBookings: "لا توجد طلبات حجز بعد.",
    calendarTitle: "تقويم المواعيد المتاحة",
    calendarDesc:
      "انقر على أي يوم لتغيير حالته: متاح (أخضر) ← محجوز بالكامل (برتقالي) ← مغلق (رمادي). التغيير يظهر فوراً في الموقع.",
    available: "متاح",
    fullyBooked: "محجوز بالكامل",
    closed: "مغلق",
    capacity: "السعة اليومية",
    selectExperience: "اختر التجربة",
    whatsappNumber: "رقم واتساب (مع رمز الدولة، مثلاً 212600123456)",
    publicEmail: "البريد الإلكتروني للتواصل",
    cancellationPolicy: "شروط الإلغاء",
    policyFlexible: "مرن (استرداد 100% حتى 24 ساعة قبل الموعد)",
    policyModerate: "معتدل (استرداد 100% حتى 48 ساعة، و50% حتى 24 ساعة)",
    policyStrict: "صارم (استرداد 100% حتى 7 أيام، و50% حتى 48 ساعة)",
    currency: "العملة (مثال: MAD, EUR, USD)",
    saveSettings: "حفظ الإعدادات",
    saving: "جارٍ الحفظ…",
    saved: "تم حفظ الإعدادات بنجاح.",
  },
} as const;

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [adminLang, setAdminLang] = useState<AdminLang>("en");
  const t = ADMIN_I18N[adminLang];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [experiences, setExperiences] = useState<Tables<"experiences">[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [guestPhotos, setGuestPhotos] = useState<Tables<"guest_photos">[]>([]);

  // Calendar state
  const [availabilityExperience, setAvailabilityExperience] = useState("");
  const [availabilityCapacity, setAvailabilityCapacity] = useState("8");
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [calendarMessage, setCalendarMessage] = useState("");

  // Settings form state
  const [settingWhatsapp, setSettingWhatsapp] = useState("");
  const [settingEmail, setSettingEmail] = useState("");
  const [settingCurrency, setSettingCurrency] = useState("MAD");
  const [cancellationPreset, setCancellationPreset] = useState("flexible");

  async function saveCurrencyDirect(value: string) {
    const { error: saveError } = await supabase.from("site_settings").upsert(
      {
        setting_key: "booking.currency",
        value: value.trim().toUpperCase() as Json,
        is_public: true,
      },
      { onConflict: "setting_key" },
    );
    if (saveError) setError(`Could not save currency: ${saveError.message}`);
    else {
      setSettingCurrency(value.trim().toUpperCase());
      await refresh();
    }
  }

  const calendarDates = useMemo(() => {
    const first = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [calendarMonth]);

  const refresh = useCallback(async () => {
    setBusy(true);
    setError("");
    const [bookingResult, experienceResult, availabilityResult, settingsResult, guestPhotoResult] =
      await Promise.all([
        supabase.from("bookings").select("*").order("date", { ascending: false }),
        supabase.from("experiences").select("*").order("id"),
        supabase.from("availability").select("*").order("date", { ascending: true }),
        supabase.from("site_settings").select("*").order("setting_key"),
        supabase.from("guest_photos").select("*").order("sort_order", { ascending: true }),
      ]);

    const failure =
      bookingResult.error ||
      experienceResult.error ||
      availabilityResult.error ||
      settingsResult.error;

    if (failure) {
      setError(`Could not load admin data: ${failure.message}`);
      setBusy(false);
      return;
    }

    setBookings(bookingResult.data ?? []);
    setExperiences(experienceResult.data ?? []);
    setAvailability(availabilityResult.data ?? []);
    setSettings(settingsResult.data ?? []);
    setGuestPhotos(guestPhotoResult.data ?? []);

    if (experienceResult.data?.length) {
      setAvailabilityExperience((curr) => curr || experienceResult.data[0]!.id);
    }

    // Populate settings state
    const sMap = new Map((settingsResult.data ?? []).map((s) => [s.setting_key, s.value]));
    const wa = sMap.get("contact.whatsapp");
    if (typeof wa === "string") setSettingWhatsapp(wa);
    const em = sMap.get("contact.email");
    if (typeof em === "string") setSettingEmail(em);
    const curr = sMap.get("booking.currency");
    if (typeof curr === "string") setSettingCurrency(curr);

    const rawTiers = sMap.get("booking.cancellation_tiers");
    const parsedTiers = parseCancellationTiers(rawTiers);
    if (parsedTiers.length === 1 && parsedTiers[0]?.hours_before === 24) {
      setCancellationPreset("flexible");
    } else if (parsedTiers.length === 2 && parsedTiers[0]?.hours_before === 48) {
      setCancellationPreset("moderate");
    } else if (parsedTiers.length === 2 && parsedTiers[0]?.hours_before === 168) {
      setCancellationPreset("strict");
    }

    setBusy(false);
  }, []);

  const verifyAdmin = useCallback(async () => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      setError(sessionError.message);
      setAuthReady(true);
      return;
    }
    if (!sessionData.session) {
      setAuthorized(false);
      setAuthReady(true);
      return;
    }
    const { data, error: adminError } = await supabase.rpc("is_admin");
    if (adminError || !data) {
      setError(
        adminError
          ? `Access check failed: ${adminError.message}`
          : "Account is not an approved administrator.",
      );
      setAuthorized(false);
    } else {
      setAuthorized(data);
    }
    setAuthReady(true);
  }, []);

  useEffect(() => {
    void verifyAdmin();
  }, [verifyAdmin]);

  useEffect(() => {
    if (authorized) void refresh();
  }, [authorized, refresh]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setBusy(false);
      return;
    }
    await verifyAdmin();
    setBusy(false);
  }

  async function signOut() {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
    else setAuthorized(false);
  }

  async function saveBookingStatus(booking: Booking, status: Booking["status"]) {
    setError("");
    const { error: updateError } = await supabase.rpc("admin_set_booking_status", {
      p_booking_id: booking.id,
      p_status: status,
    });
    if (updateError) setError(`Could not update booking: ${updateError.message}`);
    else await refresh();
  }

  function exportBookings() {
    const today = new Date().toISOString().slice(0, 10);
    const columns: (keyof Booking)[] = [
      "id",
      "name",
      "email",
      "phone",
      "experience_id",
      "date",
      "guests",
      "adults",
      "children",
      "infants",
      "meal_choice",
      "dietary_needs",
      "adult_unit_price",
      "child_unit_price",
      "status",
      "total_price",
      "language",
    ];
    const quote = (value: unknown) => {
      const text = String(value ?? "");
      const safeText =
        typeof value === "string" && /^[\t\r ]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replaceAll('"', '""')}"`;
    };
    const csv = [
      columns.join(","),
      ...bookings.map((b) => columns.map((col) => quote(b[col])).join(",")),
    ].join("\r\n");
    const blobUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = `moroccan-secrets-bookings-${today}.csv`;
    anchor.click();
    URL.revokeObjectURL(blobUrl);
  }

  async function cycleCalendarDay(date: string) {
    if (!availabilityExperience) {
      setError("Choose an experience to manage its calendar.");
      return;
    }
    const slot = availability.find(
      (item) => item.experience_id === availabilityExperience && item.date === date,
    );
    const activeGuests = bookings
      .filter(
        (b) =>
          b.experience_id === availabilityExperience && b.date === date && b.status !== "cancelled",
      )
      .reduce((total, b) => total + b.adults + b.children, 0);

    const currentState = getCalendarSlotState(slot ?? null, activeGuests);
    const nextState = nextCalendarSlotState(currentState);
    const capacity = Number(availabilityCapacity) || 8;

    const { error: saveError } = await supabase.from("availability").upsert(
      {
        date,
        experience_id: availabilityExperience,
        capacity,
        status: nextState === "full" ? "booked" : nextState,
      },
      { onConflict: "date,experience_id" },
    );
    if (saveError) {
      setError(`Could not update ${date}: ${saveError.message}`);
      return;
    }
    setCalendarMessage(
      `${date}: ${nextState === "full" ? t.fullyBooked : nextState === "closed" ? t.closed : t.available}`,
    );
    await refresh();
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSuccessMessage("");

    let tiers: CancellationTier[] = [{ hours_before: 24, refund_percent: 100 }];
    if (cancellationPreset === "moderate") {
      tiers = [
        { hours_before: 48, refund_percent: 100 },
        { hours_before: 24, refund_percent: 50 },
      ];
    } else if (cancellationPreset === "strict") {
      tiers = [
        { hours_before: 168, refund_percent: 100 },
        { hours_before: 48, refund_percent: 50 },
      ];
    }

    const updates = [
      {
        setting_key: "contact.whatsapp",
        value: settingWhatsapp.replace(/\D/g, "") as Json,
        is_public: true,
      },
      {
        setting_key: "contact.email",
        value: settingEmail.trim() as Json,
        is_public: true,
      },
      {
        setting_key: "booking.currency",
        value: settingCurrency.trim().toUpperCase() as Json,
        is_public: true,
      },
      {
        setting_key: "booking.cancellation_tiers",
        value: tiers as unknown as Json,
        is_public: true,
      },
    ];

    const { error: saveError } = await supabase
      .from("site_settings")
      .upsert(updates, { onConflict: "setting_key" });

    if (saveError) {
      setError(`Could not save settings: ${saveError.message}`);
    } else {
      setSuccessMessage(t.saved);
      await refresh();
    }
    setBusy(false);
  }

  if (!authReady) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-lg" aria-busy="true">
        Checking administrator access…
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="mx-auto max-w-sm px-4 py-16">
        <h1 className="font-display text-3xl text-primary text-center">Admin Sign In</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Moroccan Secrets owner login
        </p>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <form onSubmit={signIn} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            Email
            <input
              className={`${inputClass} mt-1`}
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              className={`${inputClass} mt-1`}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <Button type="submit" disabled={busy} className="w-full min-h-12 text-base font-semibold">
            {busy ? "Signing in…" : "Sign In"}
          </Button>
        </form>
      </main>
    );
  }

  return (
    <div
      dir={adminLang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen bg-background text-foreground antialiased"
    >
      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-8 overflow-x-hidden">
        {/* Header with Title and Language Switcher */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Moroccan Secrets
            </span>
            <h1 className="font-display text-3xl sm:text-4xl text-primary">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Language Switcher Buttons */}
            <div className="flex rounded-lg border bg-muted p-1">
              {(["en", "fr", "ar"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setAdminLang(l)}
                  className={`min-h-10 min-w-10 px-3 rounded-md text-sm font-bold uppercase transition ${
                    adminLang === l
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              className="min-h-11"
              onClick={() => void refresh()}
              disabled={busy}
            >
              {t.refresh}
            </Button>
            <Button variant="outline" className="min-h-11" onClick={() => void signOut()}>
              {t.signOut}
            </Button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive font-medium"
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 font-medium"
          >
            {successMessage}
          </div>
        )}

        {/* 5 Big Navigation Tabs */}
        <nav
          aria-label="Admin Navigation"
          className="sticky top-0 z-20 mt-4 border-b bg-background/95 py-3 backdrop-blur"
        >
          <div className="flex flex-wrap gap-2">
            {[
              ["#admin-bookings", t.bookings],
              ["#admin-calendar", t.calendar],
              ["#admin-experiences", t.experiences],
              ["#admin-photos", t.photos],
              ["#admin-settings", t.settings],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="min-h-12 inline-flex items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-bold text-foreground shadow-sm hover:bg-muted active:scale-95 transition"
              >
                {label}
              </a>
            ))}
          </div>
        </nav>

        {/* ====================================================================
            SECTION 1: BOOKINGS
        ==================================================================== */}
        <section id="admin-bookings" className="mt-10 scroll-mt-24">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t.bookings}</h2>
              <p className="text-sm text-muted-foreground">
                {bookings.length} {t.bookings.toLowerCase()}
              </p>
            </div>
            <Button variant="outline" onClick={exportBookings} className="min-h-12 px-5 font-bold">
              {t.exportCsv}
            </Button>
          </div>

          <div className="mt-5 space-y-4">
            {bookings.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">{t.noBookings}</p>
            ) : (
              bookings.map((booking) => {
                const isConfirmed = booking.status === "confirmed";
                const isCancelled = booking.status === "cancelled";
                const isPending = !isConfirmed && !isCancelled;
                const expTitle = experiences.find((e) => e.id === booking.experience_id);
                const titleText =
                  typeof expTitle?.title === "object" && expTitle.title !== null
                    ? (expTitle.title as Record<string, string>)[adminLang] ||
                      (expTitle.title as Record<string, string>)["en"] ||
                      booking.experience_id
                    : booking.experience_id;

                return (
                  <article
                    key={booking.id}
                    className="w-full rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-foreground">{booking.name}</h3>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                              isConfirmed
                                ? "bg-emerald-100 text-emerald-950 border border-emerald-400"
                                : isCancelled
                                  ? "bg-stone-200 text-stone-700 border border-stone-300"
                                  : "bg-amber-100 text-amber-950 border border-amber-400"
                            }`}
                          >
                            {isConfirmed ? t.confirmed : isCancelled ? t.cancelled : t.pending}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground break-all">
                          {booking.phone} · {booking.email}
                        </p>
                      </div>

                      {/* Confirm & Decline Buttons */}
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {!isConfirmed && (
                          <Button
                            type="button"
                            onClick={() => void saveBookingStatus(booking, "confirmed")}
                            className="flex-1 sm:flex-none min-h-12 px-6 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            {t.confirm}
                          </Button>
                        )}
                        {!isCancelled && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => void saveBookingStatus(booking, "cancelled")}
                            className="flex-1 sm:flex-none min-h-12 px-6 font-bold border-stone-300 text-stone-700 hover:bg-stone-100 hover:text-stone-900"
                          >
                            {t.decline}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 sm:grid-cols-4 text-sm">
                      <div>
                        <span className="block text-xs font-semibold text-muted-foreground">
                          {t.date}
                        </span>
                        <span className="font-medium text-foreground">{booking.date}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-muted-foreground">
                          {t.guests}
                        </span>
                        <span className="font-medium text-foreground">
                          {booking.guests} ({booking.adults} ad, {booking.children} ch)
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-xs font-semibold text-muted-foreground">
                          {t.experience}
                        </span>
                        <span className="font-medium text-foreground">{titleText}</span>
                      </div>
                    </div>

                    {/* Main dishes & Allergies row */}
                    <div className="mt-3 grid grid-cols-1 gap-2.5 rounded-xl border border-border/70 bg-muted/30 p-3 text-sm sm:grid-cols-2">
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {t.mainDishes}
                        </span>
                        <span className="font-medium text-foreground">
                          {booking.meal_choice || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {t.allergiesDietary}
                        </span>
                        <span className="font-medium text-foreground">
                          {booking.dietary_needs || "—"}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* ====================================================================
            SECTION 2: CALENDAR
        ==================================================================== */}
        <section id="admin-calendar" className="mt-12 scroll-mt-24 border-t pt-8">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-foreground">{t.calendarTitle}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t.calendarDesc}</p>
          </div>

          {/* Color Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-md border border-emerald-500 bg-emerald-100" />
              <span className="text-emerald-950">{t.available} (Green)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-md border border-amber-500 bg-amber-100" />
              <span className="text-amber-950">{t.fullyBooked} (Orange)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-md border border-stone-400 bg-stone-200" />
              <span className="text-stone-800">{t.closed} (Grey)</span>
            </div>
          </div>

          {/* Controls: Experience selector + Capacity + Month navigation */}
          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t.selectExperience}
              </label>
              <select
                className={inputClass}
                value={availabilityExperience}
                onChange={(e) => setAvailabilityExperience(e.target.value)}
              >
                {experiences.map((exp) => {
                  const title =
                    typeof exp.title === "object" && exp.title !== null
                      ? (exp.title as Record<string, string>)[adminLang] ||
                        (exp.title as Record<string, string>)["en"] ||
                        exp.id
                      : exp.id;
                  return (
                    <option key={exp.id} value={exp.id}>
                      {title}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                {t.capacity}
              </label>
              <input
                type="number"
                min="1"
                max="200"
                className={inputClass}
                value={availabilityCapacity}
                onChange={(e) => setAvailabilityCapacity(e.target.value)}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-12 min-w-12 text-lg font-bold"
                onClick={() =>
                  setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
                }
              >
                ‹
              </Button>
              <div className="flex-1 min-h-12 flex items-center justify-center rounded-lg border bg-muted/40 font-bold text-center text-sm px-2">
                {calendarMonth.toLocaleDateString(adminLang === "ar" ? "ar-MA" : adminLang, {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                className="min-h-12 min-w-12 text-lg font-bold"
                onClick={() =>
                  setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
                }
              >
                ›
              </Button>
            </div>
          </div>

          {calendarMessage && (
            <p role="status" className="mt-3 text-sm font-semibold text-emerald-800">
              {calendarMessage}
            </p>
          )}

          {/* Month Calendar Grid - Fits comfortably at 360px width */}
          <div className="mt-5 w-full">
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-muted-foreground mb-1">
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="py-1">
                  {new Date(2024, 0, 7 + i).toLocaleDateString(
                    adminLang === "ar" ? "ar-MA" : adminLang,
                    { weekday: "narrow" },
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDates.map((date) => {
                const dateVal = toLocalDateString(date);
                const slot = availability.find(
                  (s) => s.experience_id === availabilityExperience && s.date === dateVal,
                );
                const bookedCount = bookings
                  .filter(
                    (b) =>
                      b.experience_id === availabilityExperience &&
                      b.date === dateVal &&
                      b.status !== "cancelled",
                  )
                  .reduce((acc, b) => acc + b.adults + b.children, 0);

                const activeGuests = Math.max(slot?.booked_count ?? 0, bookedCount);
                const state = getCalendarSlotState(slot ?? null, activeGuests);
                const inMonth = date.getMonth() === calendarMonth.getMonth();

                const isAvailable = state === "available";
                const isFull = state === "full";
                const isClosed = state === "closed";

                const stateStyle = isAvailable
                  ? "bg-emerald-100 text-emerald-950 border-emerald-400 hover:bg-emerald-200"
                  : isFull
                    ? "bg-amber-100 text-amber-950 border-amber-400 hover:bg-amber-200"
                    : "bg-stone-200 text-stone-700 border-stone-400 hover:bg-stone-300";

                const statusLabel = isAvailable ? t.available : isFull ? t.fullyBooked : t.closed;

                return (
                  <button
                    key={dateVal}
                    type="button"
                    onClick={() => void cycleCalendarDay(dateVal)}
                    disabled={!availabilityExperience}
                    aria-label={`${dateVal}, ${statusLabel}. Tap to change.`}
                    className={`w-full min-h-[54px] sm:min-h-[64px] rounded-xl border p-1 flex flex-col items-center justify-center transition active:scale-95 ${stateStyle} ${
                      !inMonth ? "opacity-35" : ""
                    }`}
                  >
                    <span className="font-bold text-sm sm:text-base leading-none">
                      {date.getDate()}
                    </span>
                    <span className="mt-1 text-[10px] sm:text-xs font-semibold leading-tight line-clamp-1">
                      {statusLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ====================================================================
            SECTION 3: EXPERIENCES
        ==================================================================== */}
        <section id="admin-experiences" className="mt-12 scroll-mt-24 border-t pt-8">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-foreground">{t.experiences}</h2>
            <p className="text-sm text-muted-foreground">
              Add or edit dining experiences and their photos
            </p>
          </div>

          <div className="mt-6">
            <CatalogManager
              section="experiences"
              experiences={experiences}
              families={[]}
              reviews={[]}
              currency={settingCurrency}
              onSaveCurrency={saveCurrencyDirect}
              onRefresh={refresh}
              onError={setError}
            />
          </div>
        </section>

        {/* ====================================================================
            SECTION 4: PHOTOS
        ==================================================================== */}
        <section id="admin-photos" className="mt-12 scroll-mt-24 border-t pt-8">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-foreground">{t.photos}</h2>
            <p className="text-sm text-muted-foreground">
              Manage website gallery photos, guest consent, and folder sync
            </p>
          </div>

          <div className="mt-6">
            <GuestPhotoManager photos={guestPhotos} onRefresh={refresh} onError={setError} />
          </div>
        </section>

        {/* ====================================================================
            SECTION 5: SETTINGS
        ==================================================================== */}
        <section id="admin-settings" className="mt-12 scroll-mt-24 border-t pt-8 pb-16">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-bold text-foreground">{t.settings}</h2>
            <p className="text-sm text-muted-foreground">
              Contact info, booking rules, and currency
            </p>
          </div>

          <form onSubmit={saveSettings} className="mt-6 max-w-xl space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                {t.whatsappNumber}
              </label>
              <input
                type="tel"
                className={inputClass}
                placeholder="212600123456"
                value={settingWhatsapp}
                onChange={(e) => setSettingWhatsapp(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                {t.publicEmail}
              </label>
              <input
                type="email"
                className={inputClass}
                placeholder="contact@moroccansecrets.com"
                value={settingEmail}
                onChange={(e) => setSettingEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                {t.cancellationPolicy}
              </label>
              <select
                className={inputClass}
                value={cancellationPreset}
                onChange={(e) => setCancellationPreset(e.target.value)}
              >
                <option value="flexible">{t.policyFlexible}</option>
                <option value="moderate">{t.policyModerate}</option>
                <option value="strict">{t.policyStrict}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">
                {t.currency}
              </label>
              <input
                type="text"
                maxLength={3}
                className={inputClass}
                placeholder="MAD"
                value={settingCurrency}
                onChange={(e) => setSettingCurrency(e.target.value.toUpperCase())}
              />
            </div>

            <Button
              type="submit"
              disabled={busy}
              className="w-full min-h-12 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow"
            >
              {busy ? t.saving : t.saveSettings}
            </Button>
          </form>
        </section>
      </main>
    </div>
  );
}

function toLocalDateString(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
