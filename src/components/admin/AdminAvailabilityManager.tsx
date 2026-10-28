import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Info,
  Layers,
  Mail,
  Paintbrush,
  Phone,
  Sparkles,
  Users,
  Utensils,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import {
  calculateMonthStats,
  filterDatesByDayType,
  formatISODate,
  getCalendarSlotState,
  getDatesInMonth,
  getDatesInRange,
  toLocalDateString,
  type CalendarSlotState,
} from "@/lib/admin-calendar";
import { updateAdminAvailabilityBatch, updateAdminAvailabilitySlot } from "@/lib/admin.functions";

type Booking = Tables<"bookings">;
type Availability = Tables<"availability">;
type Experience = Tables<"experiences">;
type AdminLang = "en" | "fr" | "ar";

interface AdminAvailabilityManagerProps {
  adminLang: AdminLang;
  experiences: Experience[];
  availability: Availability[];
  bookings: Booking[];
  currency?: string;
  onRefresh: () => Promise<void>;
  onError: (msg: string) => void;
  onSuccess: (msg: string) => void;
}

const AVAILABILITY_I18N = {
  en: {
    title: "Availability calendar",
    subtitle:
      "Inspect guest reservations, quickly paint days, or apply smart bulk updates to your schedule.",
    available: "Available",
    fullyBooked: "Fully booked",
    closed: "Closed",
    spotsLeft: "spots left",
    spotsBooked: "spots booked",
    allSpotsOpen: "All spots available",
    capacity: "Capacity per day",
    defaultCapacity: "Default daily capacity",
    chooseExperience: "Choose experience",
    allExperiences: "Apply to all experiences",
    syncAllNotice: "Will apply across all dining experiences",
    monthNavigation: "Month navigation",
    today: "Today",
    goToToday: "Today",
    statsAvailable: "Available days",
    statsBooked: "Fully booked",
    statsClosed: "Closed days",
    statsGuests: "Booked guests",
    statsTotalBookings: "Total bookings",
    modeInspect: "Inspect & Bookings",
    modePaint: "Quick Paintbrush",
    modeBulk: "Bulk & Presets",
    modeInspectDesc: "Tap any day to view guest details, adjust capacity, or change status.",
    modePaintDesc: "Tap days on the calendar to instantly apply the chosen status.",
    modeBulkDesc: "Quickly set whole months, weekdays, weekends, or custom date ranges.",
    brushActive: "Paintbrush Active",
    brushNotice: "Click any day on the calendar to instantly set it to",
    chooseStatus: "Target status",
    quickPresets: "Quick Presets",
    applyToMonth: "All days in this month",
    applyToUpcoming: "From today onwards",
    applyToWeekdays: "Weekdays (Mon–Fri)",
    applyToWeekends: "Weekends (Sat–Sun)",
    customRange: "Custom date range",
    fromDate: "From",
    toDate: "To",
    applyRange: "Apply to range",
    multiSelectActive: "Multi-select active",
    daysSelected: "days selected",
    selectAllMonth: "Select all in month",
    clearSelection: "Clear selection",
    applyToSelected: "Apply to selected",
    confirmBulkTitle: "Confirm bulk update",
    confirmBulkDesc: "Are you sure you want to update {count} day(s) to '{status}'?",
    confirm: "Confirm & Apply",
    cancel: "Cancel",
    applying: "Applying…",
    saving: "Saving…",
    dayDetails: "Day details & bookings",
    editCapacity: "Capacity for this day",
    saveCapacity: "Save capacity",
    guestBookings: "Guest bookings",
    noBookingsForDay: "No guest bookings for this date yet.",
    bookingConfirmed: "Confirmed",
    bookingPending: "Pending",
    bookingCancelled: "Cancelled",
    guestsCount: "guests",
    adults: "adults",
    children: "children",
    mealChoice: "Meal choice",
    dietary: "Dietary & allergies",
    message: "Message",
    phone: "Phone",
    email: "Email",
    close: "Close",
    updateSuccess: "Availability updated successfully",
    updateError: "Could not update availability",
    legend: "Legend",
    pastDay: "Past date",
    resetAllAvailable: "Initialize all year as Available",
    resetAllConfirmTitle: "Initialize all dates as Available",
    resetAllConfirmDesc:
      "This will mark all dates across the year as Available. You can then easily choose which specific days are booked or closed.",
  },
  fr: {
    title: "Calendrier des disponibilités",
    subtitle:
      "Consultez les réservations, ajustez rapidement un jour ou appliquez des modifications groupées.",
    available: "Disponible",
    fullyBooked: "Complet",
    closed: "Fermé",
    spotsLeft: "places restantes",
    spotsBooked: "places réservées",
    allSpotsOpen: "Toutes les places sont libres",
    capacity: "Capacité par jour",
    defaultCapacity: "Capacité quotidienne par défaut",
    chooseExperience: "Choisir l'expérience",
    allExperiences: "Appliquer à toutes les expériences",
    syncAllNotice: "S'appliquera à l'ensemble des expériences",
    monthNavigation: "Navigation mensuelle",
    today: "Aujourd'hui",
    goToToday: "Aujourd'hui",
    statsAvailable: "Jours disponibles",
    statsBooked: "Jours complets",
    statsClosed: "Jours fermés",
    statsGuests: "Clients réservés",
    statsTotalBookings: "Total réservations",
    modeInspect: "Détails & Réservations",
    modePaint: "Pinceau rapide",
    modeBulk: "Actions groupées",
    modeInspectDesc: "Touchez un jour pour consulter les réservations et ajuster la capacité.",
    modePaintDesc: "Touchez les jours pour leur appliquer instantanément le statut choisi.",
    modeBulkDesc: "Définissez facilement tout le mois, les jours ouvrés ou les week-ends.",
    brushActive: "Pinceau actif",
    brushNotice: "Cliquez sur n'importe quel jour pour lui appliquer le statut",
    chooseStatus: "Statut cible",
    quickPresets: "Préréglages rapides",
    applyToMonth: "Tous les jours du mois",
    applyToUpcoming: "À partir d'aujourd'hui",
    applyToWeekdays: "Jours de semaine (Lun–Ven)",
    applyToWeekends: "Week-ends (Sam–Dim)",
    customRange: "Plage de dates personnalisée",
    fromDate: "Du",
    toDate: "Au",
    applyRange: "Appliquer à la plage",
    multiSelectActive: "Sélection multiple active",
    daysSelected: "jours sélectionnés",
    selectAllMonth: "Tout sélectionner ce mois",
    clearSelection: "Effacer la sélection",
    applyToSelected: "Appliquer aux jours sélectionnés",
    confirmBulkTitle: "Confirmer la modification groupée",
    confirmBulkDesc: "Voulez-vous vraiment passer {count} jour(s) au statut « {status} » ?",
    confirm: "Confirmer et appliquer",
    cancel: "Annuler",
    applying: "Application en cours…",
    saving: "Enregistrement…",
    dayDetails: "Détails de la journée & réservations",
    editCapacity: "Capacité pour ce jour",
    saveCapacity: "Enregistrer la capacité",
    guestBookings: "Réservations prévues",
    noBookingsForDay: "Aucune réservation prévue pour cette date.",
    bookingConfirmed: "Confirmée",
    bookingPending: "En attente",
    bookingCancelled: "Annulée",
    guestsCount: "personnes",
    adults: "adultes",
    children: "enfants",
    mealChoice: "Choix du menu",
    dietary: "Régimes & allergies",
    message: "Message",
    phone: "Téléphone",
    email: "E-mail",
    close: "Fermer",
    updateSuccess: "Disponibilité mise à jour avec succès",
    updateError: "Impossible de mettre à jour les disponibilités",
    legend: "Légende",
    pastDay: "Date passée",
    resetAllAvailable: "Initialiser toute l'année à Disponible",
    resetAllConfirmTitle: "Initialiser toutes les dates à Disponible",
    resetAllConfirmDesc:
      "Cela définira toutes les dates de l'année à Disponible. Vous pourrez ensuite facilement choisir les jours complets ou fermés.",
  },
  ar: {
    title: "تقويم المواعيد المتاحة",
    subtitle:
      "اطلع على حجوزات الضيوف، عدّل الأيام بنقرة واحدة، أو طبق تحديثات جماعية على جدولك بكل سهولة.",
    available: "متاح",
    fullyBooked: "محجوز بالكامل",
    closed: "مغلق",
    spotsLeft: "أماكن متبقية",
    spotsBooked: "أماكن محجوزة",
    allSpotsOpen: "جميع الأماكن شاغرة",
    capacity: "السعة اليومية",
    defaultCapacity: "السعة اليومية الافتراضية",
    chooseExperience: "اختر التجربة",
    allExperiences: "تطبيق على جميع التجارب",
    syncAllNotice: "سيتم تطبيق التحديث على جميع التجارب",
    monthNavigation: "التنقل بين الأشهر",
    today: "اليوم",
    goToToday: "اليوم",
    statsAvailable: "أيام متاحة",
    statsBooked: "أيام ممتلئة",
    statsClosed: "أيام مغلقة",
    statsGuests: "إجمالي الضيوف",
    statsTotalBookings: "إجمالي الحجوزات",
    modeInspect: "التفاصيل والحجوزات",
    modePaint: "التلوين السريع",
    modeBulk: "تعديل جماعي",
    modeInspectDesc: "انقر على أي يوم للاطلاع على تفاصيل الضيوف وتعديل السعة أو الحالة.",
    modePaintDesc: "انقر على الأيام في التقويم لتطبيق الحالة المختارة فوراً.",
    modeBulkDesc: "تحديث الشهر كاملاً، أو أيام الأسبوع، أو عطلات نهاية الأسبوع دفعة واحدة.",
    brushActive: "وضع التلوين نشط",
    brushNotice: "انقر على أي يوم في التقويم لتعيينه مباشرة كـ",
    chooseStatus: "الحالة المراد تطبيقها",
    quickPresets: "إجراءات سريعة",
    applyToMonth: "جميع أيام هذا الشهر",
    applyToUpcoming: "ابتداءً من اليوم",
    applyToWeekdays: "أيام الأسبوع (الإثنين–الجمعة)",
    applyToWeekends: "عطلة نهاية الأسبوع (السبت–الأحد)",
    customRange: "نطاق تواريخ مخصص",
    fromDate: "من",
    toDate: "إلى",
    applyRange: "تطبيق على النطاق",
    multiSelectActive: "التحديد المتعدد نشط",
    daysSelected: "أيام محددة",
    selectAllMonth: "تحديد كل أيام الشهر",
    clearSelection: "إلغاء التحديد",
    applyToSelected: "تطبيق على المحدد",
    confirmBulkTitle: "تأكيد التعديل الجماعي",
    confirmBulkDesc: "هل أنت متأكد من تغيير {count} يوم/أيام إلى الحالة «{status}»؟",
    confirm: "تأكيد وتطبيق",
    cancel: "إلغاء",
    applying: "جارٍ التطبيق…",
    saving: "جارٍ الحفظ…",
    dayDetails: "تفاصيل اليوم والحجوزات",
    editCapacity: "السعة المخصصة لهذا اليوم",
    saveCapacity: "حفظ السعة",
    guestBookings: "حجوزات الضيوف",
    noBookingsForDay: "لا توجد حجوزات مجدولة في هذا التاريخ بعد.",
    bookingConfirmed: "مؤكد",
    bookingPending: "قيد الانتظار",
    bookingCancelled: "ملغى",
    guestsCount: "ضيوف",
    adults: "بالغين",
    children: "أطفال",
    mealChoice: "اختيار الوجبة",
    dietary: "الحساسية والنظام الغذائي",
    message: "رسالة الضيف",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    close: "إغلاق",
    updateSuccess: "تم تحديث التوفر بنجاح",
    updateError: "تعذر تحديث التوفر",
    legend: "دليل الألوان",
    pastDay: "تاريخ سابق",
    resetAllAvailable: "تهيئة كامل السنة كـ «متاح»",
    resetAllConfirmTitle: "تهيئة جميع التواريخ كـ «متاح»",
    resetAllConfirmDesc:
      "سيتم ضبط جميع مواعيد السنة كـ «متاح». يمكنك بعدها اختيار وتحديد الأيام المحجوزة أو المغلقة بكل سهولة.",
  },
} as const;

export function AdminAvailabilityManager({
  adminLang,
  experiences,
  availability,
  bookings,
  currency = "MAD",
  onRefresh,
  onError,
  onSuccess,
}: AdminAvailabilityManagerProps) {
  const t = AVAILABILITY_I18N[adminLang];

  // Core state
  const [selectedExpId, setSelectedExpId] = useState<string>(
    () => experiences[0]?.id || "",
  );
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [activeMode, setActiveMode] = useState<"inspect" | "paint" | "bulk">("inspect");
  const [paintBrush, setPaintBrush] = useState<"available" | "booked" | "closed">("available");
  const [bulkStatus, setBulkStatus] = useState<"available" | "booked" | "closed">("available");
  const [applyToAllExps, setApplyToAllExps] = useState(false);

  // Range and multi-select
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  // Day inspector
  const [inspectedDate, setInspectedDate] = useState<string | null>(null);

  // Default capacity for selected experience
  const [defaultCapacity, setDefaultCapacity] = useState<string>("25");

  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Confirmation modal state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: async () => {},
  });

  // Keep selected experience synced
  useEffect(() => {
    if (!selectedExpId && experiences.length > 0) {
      setSelectedExpId(experiences[0]!.id);
    }
  }, [experiences, selectedExpId]);

  // Sync default capacity when experience changes
  useEffect(() => {
    if (!selectedExpId || experiences.length === 0) return;
    const exp = experiences.find((e) => e.id === selectedExpId);
    if (exp?.max_guests) {
      setDefaultCapacity(String(exp.max_guests));
    }
  }, [selectedExpId, experiences]);


  // Compute calendar dates (42-day grid)
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

  // Month dates (1..last day of month)
  const monthDates = useMemo(() => {
    return getDatesInMonth(calendarMonth.getFullYear(), calendarMonth.getMonth());
  }, [calendarMonth]);

  // Monthly stats
  const monthStats = useMemo(() => {
    return calculateMonthStats({
      monthDates,
      experienceId: selectedExpId,
      availability,
      bookings,
    });
  }, [monthDates, selectedExpId, availability, bookings]);

  // Helpers for experience title
  const getExperienceTitle = useCallback(
    (exp: Experience | undefined) => {
      if (!exp) return "";
      if (typeof exp.title === "object" && exp.title !== null) {
        const localized = exp.title as Record<string, string>;
        return localized[adminLang] || localized["en"] || exp.id;
      }
      return exp.id;
    },
    [adminLang],
  );

  const activeExp = useMemo(() => {
    return experiences.find((e) => e.id === selectedExpId);
  }, [experiences, selectedExpId]);

  const todayStr = useMemo(() => formatISODate(new Date()), []);

  // Update single day slot directly
  const updateSingleSlot = useCallback(
    async (date: string, status: "available" | "booked" | "closed", capacityOverride?: number) => {
      if (!selectedExpId && !applyToAllExps) {
        onError("Please select an experience.");
        return;
      }

      setIsUpdating(true);
      setStatusMessage("");
      const capacity = capacityOverride ?? (Number(defaultCapacity) || 25);

      try {
        const { data: sessionData } = await supabase.auth.getSession();

        if (applyToAllExps) {
          await updateAdminAvailabilityBatch({
            data: {
              accessToken: sessionData.session?.access_token,
              dates: [date],
              experienceIds: experiences.map((e) => e.id),
              capacity,
              status,
            },
          });
        } else {
          await updateAdminAvailabilitySlot({
            data: {
              accessToken: sessionData.session?.access_token,
              date,
              experienceId: selectedExpId,
              capacity,
              status,
            },
          });
        }

        const statusLabel =
          status === "booked" ? t.fullyBooked : status === "closed" ? t.closed : t.available;
        const msg = `${date}: ${statusLabel}`;
        setStatusMessage(msg);
        onSuccess(msg);
        await onRefresh();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        onError(`${t.updateError}: ${msg}`);
      } finally {
        setIsUpdating(false);
      }
    },
    [selectedExpId, applyToAllExps, defaultCapacity, experiences, t, onSuccess, onRefresh, onError],
  );

  // Apply bulk update to list of dates
  const executeBatchUpdate = useCallback(
    async (dates: string[], targetStatus: "available" | "booked" | "closed") => {
      if (dates.length === 0) return;
      setIsUpdating(true);
      setStatusMessage("");

      const targetExps = applyToAllExps ? experiences.map((e) => e.id) : [selectedExpId];
      const capacity = Number(defaultCapacity) || 25;

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        await updateAdminAvailabilityBatch({
          data: {
            accessToken: sessionData.session?.access_token,
            dates,
            experienceIds: targetExps,
            capacity,
            status: targetStatus,
          },
        });

        const statusLabel =
          targetStatus === "booked"
            ? t.fullyBooked
            : targetStatus === "closed"
              ? t.closed
              : t.available;
        const successNotice = `${t.updateSuccess} (${dates.length} ${t.daysSelected} → ${statusLabel})`;
        setStatusMessage(successNotice);
        onSuccess(successNotice);
        setSelectedDates(new Set());
        await onRefresh();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        onError(`${t.updateError}: ${msg}`);
      } finally {
        setIsUpdating(false);
      }
    },
    [applyToAllExps, experiences, selectedExpId, defaultCapacity, t, onSuccess, onRefresh, onError],
  );

  // Prompt confirmation dialog before applying bulk changes
  const promptBulkConfirm = useCallback(
    (dates: string[], targetStatus: "available" | "booked" | "closed") => {
      if (dates.length === 0) return;

      const statusLabel =
        targetStatus === "booked" ? t.fullyBooked : targetStatus === "closed" ? t.closed : t.available;
      const message = t.confirmBulkDesc
        .replace("{count}", String(dates.length))
        .replace("{status}", statusLabel);

      setConfirmDialog({
        open: true,
        title: t.confirmBulkTitle,
        message,
        onConfirm: async () => {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
          await executeBatchUpdate(dates, targetStatus);
        },
      });
    },
    [t, executeBatchUpdate],
  );

  // Day click handler based on active mode
  const handleDayClick = useCallback(
    async (dateVal: string) => {
      if (activeMode === "inspect") {
        setInspectedDate(dateVal);
      } else if (activeMode === "paint") {
        await updateSingleSlot(dateVal, paintBrush);
      } else if (activeMode === "bulk") {
        setSelectedDates((prev) => {
          const next = new Set(prev);
          if (next.has(dateVal)) next.delete(dateVal);
          else next.add(dateVal);
          return next;
        });
      }
    },
    [activeMode, paintBrush, updateSingleSlot],
  );

  // Month navigation helpers
  const prevMonth = () => {
    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  };

  const jumpToToday = () => {
    const now = new Date();
    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setInspectedDate(todayStr);
  };

  // Inspected day data calculations
  const inspectedSlot = useMemo(() => {
    if (!inspectedDate) return null;
    return availability.find(
      (s) => s.experience_id === selectedExpId && s.date === inspectedDate,
    );
  }, [inspectedDate, selectedExpId, availability]);

  const inspectedDayBookings = useMemo(() => {
    if (!inspectedDate) return [];
    return bookings.filter(
      (b) =>
        b.experience_id === selectedExpId &&
        b.date === inspectedDate &&
        b.status !== "cancelled",
    );
  }, [inspectedDate, selectedExpId, bookings]);

  const inspectedBookedGuests = useMemo(() => {
    return inspectedDayBookings.reduce(
      (acc, b) => acc + (b.adults || 0) + (b.children || 0),
      0,
    );
  }, [inspectedDayBookings]);

  const inspectedCapacityNum = useMemo(() => {
    return inspectedSlot?.capacity ?? (Number(defaultCapacity) || 25);
  }, [inspectedSlot, defaultCapacity]);

  const inspectedState = useMemo<CalendarSlotState>(() => {
    return getCalendarSlotState(
      inspectedSlot ?? null,
      Math.max(inspectedSlot?.booked_count ?? 0, inspectedBookedGuests),
    );
  }, [inspectedSlot, inspectedBookedGuests]);

  const inspectedFormattedDate = useMemo(() => {
    if (!inspectedDate) return "";
    const [y, m, d] = inspectedDate.split("-").map(Number);
    const dateObj = new Date(y!, m! - 1, d!);
    return dateObj.toLocaleDateString(adminLang === "ar" ? "ar-MA" : adminLang, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [inspectedDate, adminLang]);

  return (
    <div className="space-y-6">
      {/* ====================================================================
          HEADER: Title, Subtitle, and Legend
      ==================================================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <h2 className="font-display text-2xl sm:text-3xl text-foreground font-semibold">
              {t.title}
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{t.subtitle}</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold self-start sm:self-auto bg-muted/40 p-1.5 rounded-xl border border-border">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>{t.available}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>{t.fullyBooked}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700">
            <span className="h-2.5 w-2.5 rounded-full bg-stone-500" />
            <span>{t.closed}</span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          TOP CONTROLS BAR: Experience + Month Picker + Default Capacity
      ==================================================================== */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12 items-end bg-card p-4 rounded-2xl border border-border shadow-xs">
        {/* Experience Selector */}
        <div className="lg:col-span-5">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            {t.chooseExperience}
          </label>
          <div className="relative">
            <select
              value={selectedExpId}
              onChange={(e) => setSelectedExpId(e.target.value)}
              className="w-full min-h-12 rounded-xl border border-input bg-background px-3.5 py-2 text-sm font-semibold text-foreground shadow-xs focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {experiences.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {getExperienceTitle(exp)} (Max: {exp.max_guests ?? 25})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="lg:col-span-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            {t.monthNavigation}
          </label>
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={prevMonth}
              className="h-12 w-12 rounded-xl text-foreground font-bold hover:bg-muted"
              title="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex-1 h-12 rounded-xl border border-border bg-background flex items-center justify-center px-3 font-display text-base sm:text-lg font-bold text-foreground">
              {calendarMonth.toLocaleDateString(adminLang === "ar" ? "ar-MA" : adminLang, {
                month: "long",
                year: "numeric",
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="h-12 w-12 rounded-xl text-foreground font-bold hover:bg-muted"
              title="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={jumpToToday}
              className="h-12 px-3 rounded-xl text-xs font-bold shrink-0"
              title="Jump to today"
            >
              {t.goToToday}
            </Button>
          </div>
        </div>

        {/* Default Capacity */}
        <div className="lg:col-span-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            {t.defaultCapacity}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="100"
              value={defaultCapacity}
              onChange={(e) => setDefaultCapacity(e.target.value)}
              className="h-12 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              {t.guestsCount}
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================================
          MONTHLY INSIGHTS BAR: 4 Stats Cards
      ==================================================================== */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {/* Available */}
        <div className="flex items-center gap-3 rounded-xl border border-emerald-300 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/20 p-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
              {t.statsAvailable}
            </span>
            <div className="text-xl font-extrabold text-emerald-950 dark:text-emerald-100">
              {monthStats.availableDays}
            </div>
          </div>
        </div>

        {/* Fully Booked */}
        <div className="flex items-center gap-3 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/20 p-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              {t.statsBooked}
            </span>
            <div className="text-xl font-extrabold text-amber-950 dark:text-amber-100">
              {monthStats.fullyBookedDays}
            </div>
          </div>
        </div>

        {/* Closed */}
        <div className="flex items-center gap-3 rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-900/40 p-3">
          <div className="h-10 w-10 rounded-lg bg-stone-400/20 text-stone-700 dark:text-stone-300 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              {t.statsClosed}
            </span>
            <div className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
              {monthStats.closedDays}
            </div>
          </div>
        </div>

        {/* Total Booked Guests */}
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              {t.statsGuests}
            </span>
            <div className="text-xl font-extrabold text-primary">
              {monthStats.totalGuestsBooked}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({monthStats.totalBookings})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          MODE SWITCHER (Tabs: Inspect, Paintbrush, Bulk)
      ==================================================================== */}
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3.5">
          {/* Segmented Mode Selector */}
          <div className="flex p-1 rounded-xl bg-muted/70 border border-border">
            <button
              type="button"
              onClick={() => {
                setActiveMode("inspect");
                setSelectedDates(new Set());
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                activeMode === "inspect"
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-4 w-4" />
              <span>{t.modeInspect}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode("paint");
                setSelectedDates(new Set());
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                activeMode === "paint"
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Paintbrush className="h-4 w-4" />
              <span>{t.modePaint}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode("bulk");
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                activeMode === "bulk"
                  ? "bg-background text-foreground shadow-xs ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>{t.modeBulk}</span>
            </button>
          </div>

          {/* Sync All Experiences Checkbox */}
          {experiences.length > 1 && (
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-muted-foreground hover:text-foreground select-none">
              <input
                type="checkbox"
                checked={applyToAllExps}
                onChange={(e) => setApplyToAllExps(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
              />
              <span>{t.allExperiences}</span>
            </label>
          )}
        </div>

        {/* ------------------------------------------------------------------
            MODE CONTENT: Inspect Mode Note
        ------------------------------------------------------------------ */}
        {activeMode === "inspect" && (
          <div className="flex items-center gap-2.5 rounded-xl bg-accent/10 border border-accent/20 p-3 text-xs sm:text-sm text-foreground">
            <Info className="h-4 w-4 text-accent shrink-0" />
            <p className="leading-relaxed">
              <span className="font-bold">{t.modeInspect}:</span> {t.modeInspectDesc}
            </p>
          </div>
        )}

        {/* ------------------------------------------------------------------
            MODE CONTENT: Quick Paintbrush Toolbar
        ------------------------------------------------------------------ */}
        {activeMode === "paint" && (
          <div className="space-y-3 rounded-xl bg-muted/40 p-3.5 border border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <Paintbrush className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-foreground">
                  {t.brushActive}:
                </span>
                <span className="text-xs text-muted-foreground hidden md:inline">
                  {t.brushNotice}{" "}
                  <strong className="text-foreground">
                    {paintBrush === "booked"
                      ? t.fullyBooked
                      : paintBrush === "closed"
                        ? t.closed
                        : t.available}
                  </strong>
                </span>
              </div>

              {/* 3 Brush choices */}
              <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPaintBrush("available")}
                  className={`min-h-10 px-3 py-1.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                    paintBrush === "available"
                      ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shrink-0" />
                  <span>{t.available}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaintBrush("booked")}
                  className={`min-h-10 px-3 py-1.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                    paintBrush === "booked"
                      ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300 shrink-0" />
                  <span>{t.fullyBooked}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaintBrush("closed")}
                  className={`min-h-10 px-3 py-1.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                    paintBrush === "closed"
                      ? "bg-stone-700 text-white border-stone-800 shadow-xs"
                      : "bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-stone-300 shrink-0" />
                  <span>{t.closed}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------
            MODE CONTENT: Bulk & Presets Panel
        ------------------------------------------------------------------ */}
        {activeMode === "bulk" && (
          <div className="space-y-4 rounded-xl bg-muted/30 p-3.5 border border-border">
            {/* Step 1: Choose Target Status */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                1. {t.chooseStatus}
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setBulkStatus("available")}
                  className={`min-h-11 rounded-xl border p-2 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition ${
                    bulkStatus === "available"
                      ? "border-emerald-600 bg-emerald-100 text-emerald-950 ring-2 ring-emerald-500 shadow-xs"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
                  <span>{t.available}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkStatus("booked")}
                  className={`min-h-11 rounded-xl border p-2 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition ${
                    bulkStatus === "booked"
                      ? "border-amber-600 bg-amber-100 text-amber-950 ring-2 ring-amber-500 shadow-xs"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full bg-amber-500 shrink-0" />
                  <span>{t.fullyBooked}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkStatus("closed")}
                  className={`min-h-11 rounded-xl border p-2 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition ${
                    bulkStatus === "closed"
                      ? "border-stone-500 bg-stone-300 text-stone-900 ring-2 ring-stone-400 shadow-xs"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full bg-stone-500 shrink-0" />
                  <span>{t.closed}</span>
                </button>
              </div>
            </div>

            {/* Step 2: Quick Presets */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                2. {t.quickPresets}
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => promptBulkConfirm(monthDates, bulkStatus)}
                  className="min-h-10 text-xs sm:text-sm font-bold border-primary/30 text-primary hover:bg-primary/10"
                >
                  📅 {t.applyToMonth}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => {
                    const upcoming = filterDatesByDayType(monthDates, "upcoming", todayStr);
                    promptBulkConfirm(upcoming, bulkStatus);
                  }}
                  className="min-h-10 text-xs sm:text-sm font-semibold"
                >
                  ⏳ {t.applyToUpcoming}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => {
                    const weekdays = filterDatesByDayType(monthDates, "weekdays");
                    promptBulkConfirm(weekdays, bulkStatus);
                  }}
                  className="min-h-10 text-xs sm:text-sm font-semibold"
                >
                  💼 {t.applyToWeekdays}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => {
                    const weekends = filterDatesByDayType(monthDates, "weekends");
                    promptBulkConfirm(weekends, bulkStatus);
                  }}
                  className="min-h-10 text-xs sm:text-sm font-semibold"
                >
                  🌴 {t.applyToWeekends}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => {
                    const startYear = calendarMonth.getFullYear();
                    const dates: string[] = [];
                    for (let m = 0; m < 12; m++) {
                      dates.push(...getDatesInMonth(startYear, m));
                    }
                    setConfirmDialog({
                      open: true,
                      title: t.resetAllConfirmTitle,
                      message: t.resetAllConfirmDesc,
                      onConfirm: async () => {
                        setConfirmDialog((prev) => ({ ...prev, open: false }));
                        await executeBatchUpdate(dates, "available");
                      },
                    });
                  }}
                  className="min-h-10 text-xs sm:text-sm font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100/90"
                >
                  ✨ {t.resetAllAvailable}
                </Button>
              </div>
            </div>

            {/* Step 3: Custom Date Range */}
            <div className="border-t pt-3 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-muted-foreground">{t.customRange}:</span>
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground min-h-9"
                  placeholder={t.fromDate}
                />
                <span className="text-muted-foreground">→</span>
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground min-h-9"
                  placeholder={t.toDate}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!rangeStart || !rangeEnd || isUpdating}
                  onClick={() => {
                    const rangeDates = getDatesInRange(rangeStart, rangeEnd);
                    promptBulkConfirm(rangeDates, bulkStatus);
                  }}
                  className="min-h-9 font-bold"
                >
                  {t.applyRange}
                </Button>
              </div>
            </div>

            {/* Step 4: Multi-select Action Bar (shows when dates are checked) */}
            {selectedDates.size > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-accent/15 border border-accent/30 p-3 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">
                    {selectedDates.size} {t.daysSelected}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDates(new Set(monthDates))}
                    className="h-8 text-xs font-semibold"
                  >
                    {t.selectAllMonth}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDates(new Set())}
                    className="h-8 text-xs font-semibold text-muted-foreground"
                  >
                    {t.clearSelection}
                  </Button>
                </div>

                <Button
                  type="button"
                  size="sm"
                  disabled={selectedDates.size === 0 || isUpdating}
                  onClick={() => promptBulkConfirm(Array.from(selectedDates), bulkStatus)}
                  className="h-9 px-4 font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {t.applyToSelected} ({selectedDates.size})
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status feedback message */}
      {statusMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200"
        >
          {statusMessage}
        </div>
      )}

      {/* ====================================================================
          CALENDAR GRID
      ==================================================================== */}
      <div className="w-full select-none">
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="py-1">
              {new Date(2024, 0, 7 + i).toLocaleDateString(
                adminLang === "ar" ? "ar-MA" : adminLang,
                { weekday: "short" },
              )}
            </div>
          ))}
        </div>

        {/* 42 Date tiles */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDates.map((date) => {
            const dateVal = toLocalDateString(date);
            const slot = availability.find(
              (s) => s.experience_id === selectedExpId && s.date === dateVal,
            );
            const dayBookings = bookings.filter(
              (b) =>
                b.experience_id === selectedExpId &&
                b.date === dateVal &&
                b.status !== "cancelled",
            );
            const bookedGuests = dayBookings.reduce(
              (acc, b) => acc + (b.adults || 0) + (b.children || 0),
              0,
            );

            const activeGuests = Math.max(slot?.booked_count ?? 0, bookedGuests);
            const state = getCalendarSlotState(slot ?? null, activeGuests);
            const slotCapacity = slot?.capacity ?? (Number(defaultCapacity) || 25);
            const inMonth = date.getMonth() === calendarMonth.getMonth();
            const isToday = dateVal === todayStr;
            const isPast = dateVal < todayStr;
            const isSelected = selectedDates.has(dateVal);
            const isInspected = inspectedDate === dateVal;

            const isAvailable = state === "available";
            const isFull = state === "full";
            const isClosed = state === "closed";

            // Rich styling matching Moroccan Secrets palette
            const stateStyle = isAvailable
              ? "bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100/90"
              : isFull
                ? "bg-amber-50/80 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800 hover:bg-amber-100/90"
                : "bg-stone-100/80 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:bg-stone-200/90";

            const statusLabel = isAvailable ? t.available : isFull ? t.fullyBooked : t.closed;

            return (
              <button
                key={dateVal}
                type="button"
                onClick={() => void handleDayClick(dateVal)}
                disabled={isUpdating}
                aria-label={`${dateVal}, ${statusLabel}, ${activeGuests} of ${slotCapacity} spots.`}
                className={`relative w-full min-h-[62px] sm:min-h-[76px] rounded-xl sm:rounded-2xl border p-1 sm:p-2 flex flex-col items-center justify-between transition-all duration-150 cursor-pointer active:scale-95 ${stateStyle} ${
                  !inMonth ? "opacity-30" : ""
                } ${isPast && inMonth ? "opacity-75" : ""} ${
                  isInspected ? "ring-2 ring-primary ring-offset-2 scale-[1.02] shadow-sm z-10" : ""
                } ${isSelected ? "ring-2 ring-primary bg-primary/15 border-primary scale-[1.02]" : ""}`}
              >
                {/* Top Row: Date Number + Today Indicator + Multi-select check */}
                <div className="w-full flex items-center justify-between text-xs leading-none">
                  <span
                    className={`font-display font-extrabold text-sm sm:text-base ${
                      isToday
                        ? "text-primary underline decoration-2 decoration-accent font-black"
                        : ""
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  {isToday && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-accent bg-accent/20 px-1 py-0.5 rounded">
                      {t.today}
                    </span>
                  )}

                  {activeMode === "bulk" && (
                    <span
                      className={`h-4 w-4 rounded-md border text-[10px] flex items-center justify-center font-bold ${
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background/80 border-border text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  )}
                </div>

                {/* Bottom Row: Occupancy Badge */}
                <div className="w-full flex flex-col items-center gap-0.5">
                  <span className="text-[10px] sm:text-xs font-semibold leading-tight line-clamp-1">
                    {statusLabel}
                  </span>

                  {/* Spots indicator */}
                  <div className="text-[9px] sm:text-[10px] font-medium opacity-80 leading-none">
                    {activeGuests > 0 ? (
                      <span className="font-bold">👥 {activeGuests}/{slotCapacity}</span>
                    ) : isAvailable ? (
                      <span>{slotCapacity} open</span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ====================================================================
          DAY INSPECTOR SHEET / DRAWER (Slides over on inspect)
      ==================================================================== */}
      <Sheet
        open={Boolean(inspectedDate)}
        onOpenChange={(open) => !open && setInspectedDate(null)}
      >
        <SheetContent
          side={adminLang === "ar" ? "left" : "right"}
          className="w-full sm:max-w-md overflow-y-auto p-5 sm:p-6"
        >
          <SheetHeader className="border-b pb-4 text-start">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <SheetTitle className="font-display text-2xl font-bold text-foreground">
                {inspectedFormattedDate}
              </SheetTitle>
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              {getExperienceTitle(activeExp)}
            </SheetDescription>
          </SheetHeader>

          {inspectedDate && (
            <div className="mt-5 space-y-6">
              {/* 1. Quick Status Switcher */}
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {t.chooseStatus}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => void updateSingleSlot(inspectedDate, "available")}
                    className={`min-h-11 rounded-xl border p-2 flex items-center justify-center gap-1.5 font-bold text-xs transition ${
                      inspectedState === "available"
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shrink-0" />
                    <span>{t.available}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => void updateSingleSlot(inspectedDate, "booked")}
                    className={`min-h-11 rounded-xl border p-2 flex items-center justify-center gap-1.5 font-bold text-xs transition ${
                      inspectedState === "full"
                        ? "border-amber-600 bg-amber-600 text-white shadow-xs"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300 shrink-0" />
                    <span>{t.fullyBooked}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => void updateSingleSlot(inspectedDate, "closed")}
                    className={`min-h-11 rounded-xl border p-2 flex items-center justify-center gap-1.5 font-bold text-xs transition ${
                      inspectedState === "closed"
                        ? "border-stone-700 bg-stone-700 text-white shadow-xs"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-stone-300 shrink-0" />
                    <span>{t.closed}</span>
                  </button>
                </div>
              </div>


              {/* 3. Bookings list for this day */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span>{t.guestBookings} ({inspectedDayBookings.length})</span>
                  </h3>
                </div>

                {inspectedDayBookings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40 text-muted-foreground" />
                    <p>{t.noBookingsForDay}</p>
                    <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                      {inspectedCapacityNum - inspectedBookedGuests} {t.spotsLeft}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inspectedDayBookings.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-xl border border-border bg-card p-3.5 shadow-2xs space-y-2.5 text-xs sm:text-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-foreground">{b.name}</h4>
                            <span className="text-xs text-muted-foreground">
                              {b.adults} {t.adults}
                              {b.children > 0 ? `, ${b.children} ${t.children}` : ""}
                            </span>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              b.status === "confirmed"
                                ? "bg-emerald-100 text-emerald-950 dark:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-400"
                                : "bg-amber-100 text-amber-950 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-400"
                            }`}
                          >
                            {b.status === "confirmed" ? t.bookingConfirmed : t.bookingPending}
                          </span>
                        </div>

                        {/* Contact details */}
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1 border-t">
                          {b.phone && (
                            <a
                              href={`tel:${b.phone}`}
                              className="flex items-center gap-1 hover:text-foreground hover:underline"
                            >
                              <Phone className="h-3 w-3" />
                              <span>{b.phone}</span>
                            </a>
                          )}
                          {b.email && (
                            <a
                              href={`mailto:${b.email}`}
                              className="flex items-center gap-1 hover:text-foreground hover:underline"
                            >
                              <Mail className="h-3 w-3" />
                              <span>{b.email}</span>
                            </a>
                          )}
                        </div>

                        {/* Meal choice & dietary */}
                        {(b.meal_choice || b.dietary_needs) && (
                          <div className="rounded-lg bg-muted/40 p-2 text-xs space-y-1">
                            {b.meal_choice && (
                              <div className="flex items-center gap-1.5 font-medium text-foreground">
                                <Utensils className="h-3 w-3 text-accent shrink-0" />
                                <span>{b.meal_choice}</span>
                              </div>
                            )}
                            {b.dietary_needs && (
                              <p className="text-muted-foreground">
                                <strong>{t.dietary}:</strong> {b.dietary_needs}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Message */}
                        {b.message && (
                          <p className="text-xs text-muted-foreground italic bg-muted/20 p-2 rounded-lg">
                            &ldquo;{b.message}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* ====================================================================
          CONFIRMATION DIALOG (For bulk updates)
      ==================================================================== */}
      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-primary font-bold">
              {confirmDialog.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-2">
              {confirmDialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
              disabled={isUpdating}
            >
              {t.cancel}
            </Button>
            <Button
              type="button"
              onClick={() => void confirmDialog.onConfirm()}
              disabled={isUpdating}
              className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
            >
              {isUpdating ? t.applying : t.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
