import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import { CatalogManager } from "@/components/admin/CatalogManager";
import { AdminAvailabilityManager } from "@/components/admin/AdminAvailabilityManager";
import { ArrowUpDown, Clock, Filter, MessageCircle, Search } from "lucide-react";
import { formatClientWhatsappUrl } from "@/lib/whatsapp-client";
import { parseCancellationTiers, type CancellationTier } from "@/lib/booking-pricing";

type Booking = Tables<"bookings">;
type Availability = Tables<"availability">;
type SiteSetting = Tables<"site_settings">;
type AdminLang = "en" | "fr" | "ar";

if (typeof window !== "undefined") {
  (window as unknown as { __supabase?: typeof supabase }).__supabase = supabase;
}

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
    delete: "Delete",
    confirmed: "Confirmed",
    cancelled: "Declined / Cancelled",
    pending: "Pending",
    guest: "Guest",
    guests: "Guests",
    date: "Date",
    time: "Time",
    experience: "Experience",
    status: "Status",
    phone: "Phone",
    email: "Email",
    mainDishes: "Main dishes",
    allergiesDietary: "Allergies or dietary requirements",
    noBookings: "No booking requests yet.",
    calendarTitle: "Availability calendar",
    calendarDesc:
      "Tap days to change availability, or use the quick bulk tools below to set all days at once.",
    available: "Available",
    fullyBooked: "Fully booked",
    closed: "Closed",
    capacity: "Capacity per day",
    selectExperience: "Choose experience",
    bulkUpdate: "Bulk update days",
    targetStatus: "Choose status to apply",
    applyToMonth: "All days in this month",
    applyToUpcoming: "From today onwards",
    applyToWeekdays: "Weekdays (Mon–Fri)",
    applyToWeekends: "Weekends (Sat–Sun)",
    applyToSelected: "Apply to selected days",
    customRange: "Date range",
    fromDate: "From",
    toDate: "To",
    allExperiences: "Apply to all experiences",
    applyChanges: "Apply",
    applying: "Applying…",
    bulkSuccess: "Successfully updated availability",
    bulkError: "Could not update availability",
    clickAction: "Tap behavior",
    clickActionDirect: "Direct apply chosen status",
    clickActionCycle: "Cycle status on tap",
    multiSelect: "Multi-select days",
    selectAllMonth: "Select all in month",
    clearSelection: "Clear selection",
    daysSelected: "days selected",
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
    contactWhatsapp: "Contact on WhatsApp",
    all: "All",
    searchPlaceholder: "Search by guest name, email, or phone…",
    sortBy: "Sort by",
    sortNewest: "Newest requests",
    sortDateDesc: "Dinner date (latest)",
    sortDateAsc: "Dinner date (earliest)",
    bookedAt: "Requested on",
    newRequestBadge: "NEW",
    forgotPassword: "Forgot password / Set my password",
    backToSignIn: "← Back to Sign In",
    sendResetLink: "Send Reset Link to Email",
    resetEmailDesc: "Enter the owner email to receive a secure link to create or choose your private password:",
    resetLinkSent: "A reset link has been sent to your email. Check your inbox (and spam folder) and click the link to set your password.",
    setNewPasswordTitle: "Set Your Secret Password",
    setNewPasswordDesc: "Choose a secure password that only you will know.",
    newPasswordLabel: "New Password (min 6 characters)",
    confirmPasswordLabel: "Confirm Password",
    savePasswordBtn: "Save Password & Enter Admin",
    passwordsDoNotMatch: "Passwords do not match.",
    passwordMinLength: "Password must be at least 6 characters.",
    passwordUpdated: "Password updated successfully! Welcome to your dashboard.",
    showPassword: "Show password",
    changePasswordTitle: "Admin Password",
    changePasswordDesc: "Update your private administrator password",
    changePasswordBtn: "Update Password",
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
    delete: "Supprimer",
    confirmed: "Confirmée",
    cancelled: "Refusée / Annulée",
    pending: "En attente",
    guest: "Client",
    guests: "Personnes",
    date: "Date",
    time: "Heure",
    experience: "Expérience",
    status: "Statut",
    phone: "Téléphone",
    email: "E-mail",
    mainDishes: "Plats principaux",
    allergiesDietary: "Allergies ou régimes alimentaires",
    noBookings: "Aucune demande de réservation pour le moment.",
    calendarTitle: "Calendrier des disponibilités",
    calendarDesc:
      "Appuyez sur un jour pour changer sa disponibilité, ou utilisez les outils ci-dessous pour modifier tous les jours à la fois.",
    available: "Disponible",
    fullyBooked: "Complet",
    closed: "Fermé",
    capacity: "Capacité par jour",
    selectExperience: "Choisir l'expérience",
    bulkUpdate: "Modifier plusieurs jours",
    targetStatus: "Statut à appliquer",
    applyToMonth: "Tous les jours du mois",
    applyToUpcoming: "À partir d'aujourd'hui",
    applyToWeekdays: "Jours de semaine (Lun–Ven)",
    applyToWeekends: "Week-ends uniquement (Sam–Dim)",
    applyToSelected: "Appliquer aux jours sélectionnés",
    customRange: "Plage de dates",
    fromDate: "Du",
    toDate: "Au",
    allExperiences: "Appliquer à toutes les expériences",
    applyChanges: "Appliquer",
    applying: "Application en cours…",
    bulkSuccess: "Disponibilité mise à jour avec succès",
    bulkError: "Impossible de mettre à jour les disponibilités",
    clickAction: "Mode de clic",
    clickActionDirect: "Appliquer directement le statut choisi",
    clickActionCycle: "Changer en boucle (Disponible → Complet → Fermé)",
    multiSelect: "Sélection multiple",
    selectAllMonth: "Tout sélectionner ce mois",
    clearSelection: "Effacer la sélection",
    daysSelected: "jours sélectionnés",
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
    contactWhatsapp: "Contacter sur WhatsApp",
    all: "Tous",
    searchPlaceholder: "Rechercher par nom, email, ou téléphone…",
    sortBy: "Trier par",
    sortNewest: "Demandes récentes",
    sortDateDesc: "Date du repas (récent)",
    sortDateAsc: "Date du repas (proche)",
    bookedAt: "Reçu le",
    newRequestBadge: "NOUVEAU",
    forgotPassword: "Mot de passe oublié / Définir mon mot de passe",
    backToSignIn: "← Retour à la connexion",
    sendResetLink: "Envoyer le lien par e-mail",
    resetEmailDesc: "Entrez l'e-mail du propriétaire pour recevoir un lien sécurisé permettant de créer ou modifier votre mot de passe secret :",
    resetLinkSent: "Un e-mail de réinitialisation a été envoyé. Vérifiez votre boîte de réception (et spams) et cliquez sur le lien pour choisir votre mot de passe.",
    setNewPasswordTitle: "Définir votre mot de passe secret",
    setNewPasswordDesc: "Choisissez un mot de passe sécurisé que vous seul connaîtrez.",
    newPasswordLabel: "Nouveau mot de passe (min. 6 caractères)",
    confirmPasswordLabel: "Confirmer le mot de passe",
    savePasswordBtn: "Enregistrer et accéder à l'administration",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas.",
    passwordMinLength: "Le mot de passe doit contenir au moins 6 caractères.",
    passwordUpdated: "Mot de passe mis à jour avec succès ! Bienvenue.",
    showPassword: "Afficher le mot de passe",
    changePasswordTitle: "Mot de passe administrateur",
    changePasswordDesc: "Modifier votre mot de passe secret",
    changePasswordBtn: "Mettre à jour le mot de passe",
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
    delete: "حذف",
    confirmed: "مؤكد",
    cancelled: "مرفوض / ملغى",
    pending: "قيد الانتظار",
    guest: "الضيف",
    guests: "عدد الضيوف",
    date: "التاريخ",
    time: "الوقت",
    experience: "التجربة",
    status: "الحالة",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    mainDishes: "الأطباق الرئيسية",
    allergiesDietary: "أي حساسية أو متطلبات غذائية",
    noBookings: "لا توجد طلبات حجز بعد.",
    calendarTitle: "تقويم المواعيد المتاحة",
    calendarDesc:
      "انقر على أي يوم لتغيير توفره، أو استخدم أدوات التحديث الجماعي لتعديل جميع الأيام دفعة واحدة.",
    available: "متاح",
    fullyBooked: "محجوز بالكامل",
    closed: "مغلق",
    capacity: "السعة اليومية",
    selectExperience: "اختر التجربة",
    bulkUpdate: "تحديث جماعي للأيام",
    targetStatus: "الحالة المراد تطبيقها",
    applyToMonth: "جميع أيام هذا الشهر",
    applyToUpcoming: "ابتداءً من اليوم",
    applyToWeekdays: "أيام الأسبوع (الإثنين–الجمعة)",
    applyToWeekends: "عطلة نهاية الأسبوع (السبت–الأحد)",
    applyToSelected: "تطبيق على الأيام المحددة",
    customRange: "نطاق تواريخ مخصص",
    fromDate: "من",
    toDate: "إلى",
    allExperiences: "تطبيق على جميع التجارب",
    applyChanges: "تطبيق",
    applying: "جارٍ التطبيق…",
    bulkSuccess: "تم تحديث التوفر بنجاح",
    bulkError: "تعذر تحديث التوفر",
    clickAction: "سلوك النقر",
    clickActionDirect: "تطبيق الحالة المحددة مباشرة",
    clickActionCycle: "التبديل دورياً (متاح ← محجوز ← مغلق)",
    multiSelect: "تحديد أيام متعددة",
    selectAllMonth: "تحديد كل أيام الشهر",
    clearSelection: "إلغاء التحديد",
    daysSelected: "أيام محددة",
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
    contactWhatsapp: "مراسلة عبر واتساب",
    all: "الكل",
    searchPlaceholder: "بحث بالاسم، البريد أو الهاتف…",
    sortBy: "ترتيب حسب",
    sortNewest: "أحدث الطلبات أولاً",
    sortDateDesc: "تاريخ الوجبة (الأحدث)",
    sortDateAsc: "تاريخ الوجبة (الأقرب)",
    bookedAt: "تاريخ الطلب",
    newRequestBadge: "جديد",
    forgotPassword: "نسيت كلمة المرور / تعيين كلمة المرور الخاصة بي",
    backToSignIn: "← العودة لتسجيل الدخول",
    sendResetLink: "إرسال الرابط إلى البريد الإلكتروني",
    resetEmailDesc: "أدخل بريد المالك لتلقي رابط آمن لتحديد كلمة المرور السرية الخاصة بك:",
    resetLinkSent: "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني. تحقق من صندوق الوارد (أو الرسائل غير المرغوب فيها) وانقر على الرابط.",
    setNewPasswordTitle: "تعيين كلمة المرور السرية",
    setNewPasswordDesc: "اختر كلمة مرور آمنة تعرفها أنت فقط.",
    newPasswordLabel: "كلمة المرور الجديدة (6 أحرف على الأقل)",
    confirmPasswordLabel: "تأكيد كلمة المرور",
    savePasswordBtn: "حفظ كلمة المرور والدخول للوحة التحكم",
    passwordsDoNotMatch: "كلمتا المرور غير متطابقتين.",
    passwordMinLength: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
    passwordUpdated: "تم تحديث كلمة المرور بنجاح! مرحباً بك.",
    showPassword: "إظهار كلمة المرور",
    changePasswordTitle: "كلمة مرور المدير",
    changePasswordDesc: "تعديل كلمة المرور السرية الخاصة بك",
    changePasswordBtn: "تحديث كلمة المرور",
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

  const [email, setEmail] = useState("moroccosecretsmarrakech@gmail.com");
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Password reset and recovery states
  const [authView, setAuthView] = useState<"signin" | "request_reset">("signin");
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("moroccosecretsmarrakech@gmail.com");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // In-dashboard change password
  const [dashNewPassword, setDashNewPassword] = useState("");
  const [dashConfirmPassword, setDashConfirmPassword] = useState("");
  const [dashShowPassword, setDashShowPassword] = useState(false);
  const [dashPasswordSuccess, setDashPasswordSuccess] = useState("");
  const [dashPasswordError, setDashPasswordError] = useState("");

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingStatusFilter, setBookingStatusFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [bookingSearchQuery, setBookingSearchQuery] = useState("");
  const [bookingSortMode, setBookingSortMode] = useState<"created_desc" | "date_desc" | "date_asc">("created_desc");
  const [experiences, setExperiences] = useState<Tables<"experiences">[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);

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

  const refresh = useCallback(async () => {
    setBusy(true);
    setError("");
    const [bookingResult, experienceResult, availabilityResult, settingsResult] = await Promise.all(
      [
        supabase.from("bookings").select("*").order("created_at", { ascending: false }),
        supabase.from("experiences").select("*").order("id"),
        supabase.from("availability").select("*").order("date", { ascending: true }),
        supabase.from("site_settings").select("*").order("setting_key"),
      ],
    );

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


  // Listen for Supabase password recovery events and hash fragments
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecoveryMode(true);
        setError("");
        setSuccessMessage("");
      }
    });

    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const search = window.location.search || "";
      if (hash.includes("type=recovery") || search.includes("type=recovery")) {
        setIsRecoveryMode(true);
      }
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    void verifyAdmin();
  }, [verifyAdmin]);

  useEffect(() => {
    if (authorized) void refresh();
  }, [authorized, refresh]);

  // Realtime subscription and window focus listener so new bookings appear instantly
  useEffect(() => {
    if (!authorized) return;

    const channel = supabase
      .channel("admin-bookings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          void refresh();
        },
      )
      .subscribe();

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      void supabase.removeChannel(channel);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [authorized, refresh]);

  const pendingCount = useMemo(() => bookings.filter((b) => b.status === "pending").length, [bookings]);
  const confirmedCount = useMemo(() => bookings.filter((b) => b.status === "confirmed").length, [bookings]);
  const cancelledCount = useMemo(() => bookings.filter((b) => b.status === "cancelled").length, [bookings]);

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (bookingStatusFilter !== "all") {
      result = result.filter((b) => b.status === bookingStatusFilter);
    }

    if (bookingSearchQuery.trim()) {
      const q = bookingSearchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.name?.toLowerCase().includes(q) ||
          b.email?.toLowerCase().includes(q) ||
          b.phone?.toLowerCase().includes(q) ||
          b.date?.includes(q),
      );
    }

    result.sort((a, b) => {
      if (bookingSortMode === "created_desc") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (bookingSortMode === "date_asc") {
        return a.date.localeCompare(b.date);
      }
      return b.date.localeCompare(a.date);
    });

    return result;
  }, [bookings, bookingStatusFilter, bookingSearchQuery, bookingSortMode]);

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


  async function handleRequestReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccessMessage("");
    const targetEmail = (resetEmail || email || "moroccosecretsmarrakech@gmail.com").trim();
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/admin` : undefined;
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: redirectUrl,
    });
    if (resetErr) {
      setError(resetErr.message);
    } else {
      setSuccessMessage(t.resetLinkSent);
    }
    setBusy(false);
  }

  async function handleSetNewPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    if (newPassword.length < 6) {
      setError(t.passwordMinLength);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }
    setBusy(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
    if (updateErr) {
      setError(updateErr.message);
      setBusy(false);
      return;
    }

    setSuccessMessage(t.passwordUpdated);
    setIsRecoveryMode(false);
    setNewPassword("");
    setConfirmPassword("");
    if (typeof window !== "undefined" && window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    await verifyAdmin();
    setBusy(false);
  }

  async function handleDashboardChangePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDashPasswordError("");
    setDashPasswordSuccess("");
    if (dashNewPassword.length < 6) {
      setDashPasswordError(t.passwordMinLength);
      return;
    }
    if (dashNewPassword !== dashConfirmPassword) {
      setDashPasswordError(t.passwordsDoNotMatch);
      return;
    }
    setBusy(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password: dashNewPassword });
    if (updateErr) {
      setDashPasswordError(updateErr.message);
    } else {
      setDashPasswordSuccess(t.passwordUpdated);
      setDashNewPassword("");
      setDashConfirmPassword("");
    }
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

  async function deleteBooking(booking: Booking) {
    if (!window.confirm(`Delete booking for ${booking.name}?`)) return;
    setError("");
    const { error: delError } = await supabase.from("bookings").delete().eq("id", booking.id);
    if (delError) setError(`Could not delete booking: ${delError.message}`);
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
      "start_time",
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
    const listToExport = filteredBookings.length > 0 ? filteredBookings : bookings;
    const csv = [
      columns.join(","),
      ...listToExport.map((b) => columns.map((col) => quote(b[col])).join(",")),
    ].join("\r\n");
    const blobUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = `moroccan-secrets-bookings-${today}.csv`;
    anchor.click();
    URL.revokeObjectURL(blobUrl);
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

  // 1. Password Recovery Screen (when owner clicks link in email)
  if (isRecoveryMode) {
    return (
      <main className="mx-auto max-w-sm px-4 py-16" dir={adminLang === "ar" ? "rtl" : "ltr"}>
        <div className="flex justify-center mb-4">
          <div className="flex rounded-lg border bg-muted p-1 text-xs">
            {(["en", "fr", "ar"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setAdminLang(l)}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  adminLang === l ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <h1 className="font-display text-3xl text-primary text-center">{t.setNewPasswordTitle}</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {t.setNewPasswordDesc}
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {successMessage && (
          <p role="status" className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        )}

        <form onSubmit={handleSetNewPassword} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">
            {t.newPasswordLabel}
            <input
              className={`${inputClass} mt-1`}
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            {t.confirmPasswordLabel}
            <input
              className={`${inputClass} mt-1`}
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </label>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-new-pass"
              checked={showNewPassword}
              onChange={(e) => setShowNewPassword(e.target.checked)}
              className="rounded border-input text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="show-new-pass" className="text-xs text-muted-foreground cursor-pointer">
              {t.showPassword}
            </label>
          </div>

          <Button type="submit" disabled={busy} className="w-full min-h-12 text-base font-semibold cursor-pointer">
            {busy ? t.saving : t.savePasswordBtn}
          </Button>
        </form>
      </main>
    );
  }

  // 2. Sign In or Request Password Reset Screen
  if (!authorized) {
    return (
      <main className="mx-auto max-w-sm px-4 py-16" dir={adminLang === "ar" ? "rtl" : "ltr"}>
        <div className="flex justify-center mb-4">
          <div className="flex rounded-lg border bg-muted p-1 text-xs">
            {(["en", "fr", "ar"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setAdminLang(l)}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                  adminLang === l ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <h1 className="font-display text-3xl text-primary text-center">
          {authView === "signin" ? t.title : t.setNewPasswordTitle}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {authView === "signin" ? t.subtitle : t.resetEmailDesc}
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {successMessage && (
          <p role="status" className="mt-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-700">
            {successMessage}
          </p>
        )}

        {authView === "signin" ? (
          <form onSubmit={signIn} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              {t.email}
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
              {adminLang === "fr" ? "Mot de passe" : adminLang === "ar" ? "كلمة المرور" : "Password"}
              <input
                className={`${inputClass} mt-1`}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-pass"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="show-pass" className="text-xs text-muted-foreground cursor-pointer">
                  {t.showPassword}
                </label>
              </div>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccessMessage("");
                  setAuthView("request_reset");
                }}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                {t.forgotPassword}
              </button>
            </div>

            <Button type="submit" disabled={busy} className="w-full min-h-12 text-base font-semibold cursor-pointer">
              {busy ? "…" : (adminLang === "fr" ? "Se connecter" : adminLang === "ar" ? "تسجيل الدخول" : "Sign In")}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleRequestReset} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              {t.email}
              <input
                className={`${inputClass} mt-1`}
                type="email"
                autoComplete="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </label>

            <Button type="submit" disabled={busy} className="w-full min-h-12 text-base font-semibold cursor-pointer">
              {busy ? (adminLang === "fr" ? "Envoi…" : adminLang === "ar" ? "جارٍ الإرسال…" : "Sending…") : t.sendResetLink}
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setSuccessMessage("");
                  setAuthView("signin");
                }}
                className="text-xs text-primary hover:underline font-medium cursor-pointer"
              >
                {t.backToSignIn}
              </button>
            </div>
          </form>
        )}
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
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-bold text-foreground">{t.bookings}</h2>
                {pendingCount > 0 && (
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 text-xs font-black animate-pulse">
                    {pendingCount} {t.pending}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {bookings.length} {t.bookings.toLowerCase()}
              </p>
            </div>
            <Button variant="outline" onClick={exportBookings} className="min-h-12 px-5 font-bold">
              {t.exportCsv}
            </Button>
          </div>

          {/* Status Filters + Search + Sort Bar */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-muted/70 border">
              {(
                [
                  ["all", `${t.all} (${bookings.length})`],
                  ["pending", `${t.pending} (${pendingCount})`],
                  ["confirmed", `${t.confirmed} (${confirmedCount})`],
                  ["cancelled", `${t.cancelled} (${cancelledCount})`],
                ] as const
              ).map(([statusKey, label]) => (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setBookingStatusFilter(statusKey)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition active:scale-95 ${
                    bookingStatusFilter === statusKey
                      ? "bg-card text-foreground shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search and Sort Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="search"
                  value={bookingSearchQuery}
                  onChange={(e) => setBookingSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-input bg-card text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-9"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={bookingSortMode}
                  onChange={(e) =>
                    setBookingSortMode(e.target.value as "created_desc" | "date_desc" | "date_asc")
                  }
                  className="text-xs py-1.5 px-2.5 rounded-xl border border-input bg-card text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-9 font-medium"
                >
                  <option value="created_desc">{t.sortNewest}</option>
                  <option value="date_desc">{t.sortDateDesc}</option>
                  <option value="date_asc">{t.sortDateAsc}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {filteredBookings.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">{t.noBookings}</p>
            ) : (
              filteredBookings.map((booking) => {
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

                const clientWhatsapp = formatClientWhatsappUrl({
                  phone: booking.phone,
                  name: booking.name,
                  experienceTitle: titleText,
                  date: booking.date,
                  lang: booking.language || adminLang,
                });

                const bookingTime = booking.start_time
                  ? booking.start_time.slice(0, 5)
                  : expTitle?.start_time
                    ? expTitle.start_time.slice(0, 5)
                    : booking.experience_id === "family-lunch-marrakech"
                      ? "14:30"
                      : "19:00";

                return (
                  <article
                    key={booking.id}
                    className="w-full rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-foreground">{booking.name}</h3>
                          {isPending && (
                            <span className="rounded-full bg-amber-500 text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider animate-pulse">
                              {t.newRequestBadge}
                            </span>
                          )}
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
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>
                              {t.bookedAt}:{" "}
                              {new Date(booking.created_at).toLocaleString(
                                adminLang === "fr"
                                  ? "fr-FR"
                                  : adminLang === "ar"
                                    ? "ar-MA"
                                    : "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground break-all">
                          {booking.phone && (
                            <a
                              href={`tel:${booking.phone}`}
                              className="font-medium text-foreground hover:underline"
                            >
                              {booking.phone}
                            </a>
                          )}
                          {clientWhatsapp && (
                            <a
                              href={clientWhatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[#25D366]/15 text-[#128C7E] dark:text-[#25D366] hover:bg-[#25D366]/25 transition"
                              title="Open WhatsApp chat with client"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                          <span>·</span>
                          <a
                            href={`mailto:${booking.email}`}
                            className="hover:text-foreground hover:underline"
                          >
                            {booking.email}
                          </a>
                        </div>
                      </div>

                      {/* Action buttons: WhatsApp + Confirm & Decline Buttons */}
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {clientWhatsapp && (
                          <a
                            href={clientWhatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none min-h-12 px-4 rounded-xl font-bold bg-[#25D366] hover:bg-[#20ba59] text-white inline-flex items-center justify-center gap-2 shadow-xs transition active:scale-95 text-sm"
                            title="Open WhatsApp chat with client"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>{t.contactWhatsapp}</span>
                          </a>
                        )}
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
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void deleteBooking(booking)}
                          className="flex-1 sm:flex-none min-h-12 px-4 font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-800"
                        >
                          {t.delete}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 sm:grid-cols-4 lg:grid-cols-5 text-sm">
                      <div>
                        <span className="block text-xs font-semibold text-muted-foreground">
                          {t.date}
                        </span>
                        <span className="font-medium text-foreground">{booking.date}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-muted-foreground">
                          {t.time}
                        </span>
                        <span className="font-medium text-foreground">{bookingTime}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-muted-foreground">
                          {t.guests}
                        </span>
                        <span className="font-medium text-foreground">
                          {booking.guests} ({booking.adults} ad, {booking.children} ch)
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1 lg:col-span-2">
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

                    {/* Guest message (if any) */}
                    {booking.message && (
                      <div className="mt-2.5 rounded-xl border border-border/70 bg-muted/20 p-3 text-sm">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Message
                        </span>
                        <p className="mt-1 text-foreground whitespace-pre-wrap">
                          {booking.message}
                        </p>
                      </div>
                    )}
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
          <AdminAvailabilityManager
            adminLang={adminLang}
            experiences={experiences}
            availability={availability}
            bookings={bookings}
            currency={settingCurrency}
            onRefresh={refresh}
            onError={(msg) => setError(msg)}
            onSuccess={(msg) => setSuccessMessage(msg)}
          />
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
            SECTION 4: SETTINGS
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

          {/* Change Admin Password Card */}
          <div className="mt-10 max-w-xl rounded-2xl border border-stone-200 bg-card p-6 shadow-xs">
            <h3 className="text-lg font-bold text-foreground mb-1">{t.changePasswordTitle}</h3>
            <p className="text-xs text-muted-foreground mb-4">{t.changePasswordDesc}</p>

            {dashPasswordError && (
              <p role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {dashPasswordError}
              </p>
            )}
            {dashPasswordSuccess && (
              <p role="status" className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-700">
                {dashPasswordSuccess}
              </p>
            )}

            <form onSubmit={handleDashboardChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  {t.newPasswordLabel}
                </label>
                <input
                  type={dashShowPassword ? "text" : "password"}
                  className={inputClass}
                  required
                  minLength={6}
                  value={dashNewPassword}
                  onChange={(e) => setDashNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  {t.confirmPasswordLabel}
                </label>
                <input
                  type={dashShowPassword ? "text" : "password"}
                  className={inputClass}
                  required
                  minLength={6}
                  value={dashConfirmPassword}
                  onChange={(e) => setDashConfirmPassword(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="show-dash-pass"
                  checked={dashShowPassword}
                  onChange={(e) => setDashShowPassword(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="show-dash-pass" className="text-xs text-muted-foreground cursor-pointer">
                  {t.showPassword}
                </label>
              </div>

              <Button
                type="submit"
                disabled={busy}
                variant="outline"
                className="w-full min-h-11 font-semibold cursor-pointer"
              >
                {t.changePasswordBtn}
              </Button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
