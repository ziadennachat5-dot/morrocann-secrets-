import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables, TablesInsert } from "@/integrations/supabase/types";
import type { Lang } from "@/lib/i18n";
import { dict } from "@/lib/translations";
import { readTranslation, translationPaths } from "@/lib/copy-utils";

type Booking = Tables<"bookings">;
type Availability = Tables<"availability">;
type Inquiry = Tables<"inquiries">;
type SiteSetting = Tables<"site_settings">;
type Review = Tables<"reviews">;
type AdminTab = "overview" | "bookings" | "calendar" | "content" | "inquiries" | "subscribers";
type LocalizedFields = { en: string; fr: string; ar: string };

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const tabs: { id: AdminTab; label: string }[] = [
  { id: "overview", label: "Dashboard" },
  { id: "bookings", label: "Bookings" },
  { id: "calendar", label: "Availability" },
  { id: "content", label: "Site content & settings" },
  { id: "inquiries", label: "Inquiries" },
  { id: "subscribers", label: "Newsletter subscribers" },
];

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex,nofollow" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<AdminTab>("overview");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [experiences, setExperiences] = useState<Tables<"experiences">[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [faqs, setFaqs] = useState<Tables<"faqs">[]>([]);
  const [posts, setPosts] = useState<Tables<"posts">[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [subscribers, setSubscribers] = useState<Tables<"subscribers">[]>([]);
  const [faqId, setFaqId] = useState("");
  const [faqCategory, setFaqCategory] = useState<LocalizedFields>({ en: "", fr: "", ar: "" });
  const [faqQuestion, setFaqQuestion] = useState<LocalizedFields>({ en: "", fr: "", ar: "" });
  const [faqAnswer, setFaqAnswer] = useState<LocalizedFields>({ en: "", fr: "", ar: "" });
  const [faqPublished, setFaqPublished] = useState(false);
  const [faqSortOrder, setFaqSortOrder] = useState("0");
  const [postSlug, setPostSlug] = useState("");
  const [postTitle, setPostTitle] = useState<LocalizedFields>({ en: "", fr: "", ar: "" });
  const [postSummary, setPostSummary] = useState<LocalizedFields>({ en: "", fr: "", ar: "" });
  const [postBody, setPostBody] = useState<LocalizedFields>({ en: "", fr: "", ar: "" });
  const [postDraftNote, setPostDraftNote] = useState("Draft — review before publishing.");
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [notes, setNotes] = useState<Tables<"booking_internal_notes">[]>([]);
  const [messages, setMessages] = useState<Tables<"booking_messages">[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [messageChannel, setMessageChannel] =
    useState<Tables<"booking_messages">["channel"]>("email");
  const [messageDirection, setMessageDirection] =
    useState<Tables<"booking_messages">["direction"]>("outbound");
  const [availabilityExperience, setAvailabilityExperience] = useState("");
  const [availabilityStart, setAvailabilityStart] = useState("");
  const [availabilityEnd, setAvailabilityEnd] = useState("");
  const [availabilityCapacity, setAvailabilityCapacity] = useState("8");
  const [availabilityStatus, setAvailabilityStatus] =
    useState<Tables<"availability">["status"]>("available");
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [settingKey, setSettingKey] = useState("");
  const [settingJson, setSettingJson] = useState('{\n  "en": "",\n  "fr": "",\n  "ar": ""\n}');
  const [settingPublic, setSettingPublic] = useState(true);
  const [copyPath, setCopyPath] = useState("");
  const [copyValues, setCopyValues] = useState({ en: "", fr: "", ar: "" });

  const refresh = useCallback(async () => {
    setBusy(true);
    setError("");
    const [
      bookingResult,
      experienceResult,
      availabilityResult,
      inquiryResult,
      settingsResult,
      faqResult,
      postResult,
      reviewResult,
      subscriberResult,
    ] = await Promise.all([
      supabase.from("bookings").select("*").order("date", { ascending: true }),
      supabase.from("experiences").select("*").order("id"),
      supabase.from("availability").select("*").order("date", { ascending: true }),
      supabase.from("inquiries").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*").order("setting_key"),
      supabase.from("faqs").select("*").order("sort_order"),
      supabase.from("posts").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("subscribers").select("*").order("created_at", { ascending: false }),
    ]);
    const failure =
      bookingResult.error ||
      experienceResult.error ||
      availabilityResult.error ||
      inquiryResult.error ||
      settingsResult.error ||
      faqResult.error ||
      postResult.error ||
      reviewResult.error ||
      subscriberResult.error;
    if (failure) {
      setError(`Could not load admin data: ${failure.message}`);
      setBusy(false);
      return;
    }
    setBookings(bookingResult.data ?? []);
    setExperiences(experienceResult.data ?? []);
    setAvailability(availabilityResult.data ?? []);
    setInquiries(inquiryResult.data ?? []);
    setSettings(settingsResult.data ?? []);
    setFaqs(faqResult.data ?? []);
    setPosts(postResult.data ?? []);
    setReviews(reviewResult.data ?? []);
    setSubscribers(subscriberResult.data ?? []);
    setSelectedBookingId((current) => current || bookingResult.data?.[0]?.id || "");
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
    if (adminError) {
      setError(`Unable to verify administrator access: ${adminError.message}`);
      setAuthorized(false);
    } else if (!data) {
      setError("This account is not an approved administrator.");
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

  useEffect(() => {
    if (!selectedBookingId || !authorized) {
      setNotes([]);
      setMessages([]);
      return;
    }
    let active = true;
    void Promise.all([
      supabase
        .from("booking_internal_notes")
        .select("*")
        .eq("booking_id", selectedBookingId)
        .order("created_at", { ascending: false }),
      supabase
        .from("booking_messages")
        .select("*")
        .eq("booking_id", selectedBookingId)
        .order("created_at", { ascending: false }),
    ]).then(([noteResult, messageResult]) => {
      if (!active) return;
      if (noteResult.error || messageResult.error) {
        setError(
          `Could not load booking history: ${noteResult.error?.message ?? messageResult.error?.message}`,
        );
        return;
      }
      setNotes(noteResult.data ?? []);
      setMessages(messageResult.data ?? []);
    });
    return () => {
      active = false;
    };
  }, [authorized, selectedBookingId]);

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === selectedBookingId) ?? null,
    [bookings, selectedBookingId],
  );
  const today = new Date().toISOString().slice(0, 10);
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const upcomingBookings = bookings.filter(
    (booking) => booking.date >= today && booking.date <= weekEnd && booking.status !== "cancelled",
  );
  const todaysBookings = bookings.filter(
    (booking) => booking.date === today && booking.status !== "cancelled",
  );
  const pendingBookings = bookings.filter((booking) => booking.status === "pending");
  const revenueEstimate = upcomingBookings.reduce(
    (total, booking) => total + Number(booking.total_price),
    0,
  );
  const experienceOptions = useMemo(
    () => experiences.map((experience) => experience.id),
    [experiences],
  );
  const copyPaths = useMemo(() => translationPaths(dict.en), []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
    } else {
      await verifyAdmin();
    }
    setBusy(false);
  }

  async function signOut() {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
    else setAuthorized(false);
  }

  async function saveBookingStatus(booking: Booking, status: Booking["status"]) {
    const { error: updateError } = await supabase.rpc("admin_set_booking_status", {
      p_booking_id: booking.id,
      p_status: status,
    });
    if (updateError) setError(`Could not update booking: ${updateError.message}`);
    else await refresh();
  }

  function exportBookings() {
    const columns: (keyof Booking)[] = [
      "id",
      "name",
      "email",
      "phone",
      "experience_id",
      "date",
      "guests",
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
      ...bookings.map((booking) => columns.map((column) => quote(booking[column])).join(",")),
    ].join("\r\n");
    const blobUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = `moroccan-secrets-bookings-${today}.csv`;
    anchor.click();
    URL.revokeObjectURL(blobUrl);
  }

  async function addBookingRecord(event: FormEvent<HTMLFormElement>, kind: "note" | "message") {
    event.preventDefault();
    if (!selectedBookingId) return;
    const isNote = kind === "note";
    const content = isNote ? noteDraft.trim() : messageDraft.trim();
    if (!content) return;
    const result = isNote
      ? await supabase
          .from("booking_internal_notes")
          .insert({ booking_id: selectedBookingId, note: content })
      : await supabase.from("booking_messages").insert({
          booking_id: selectedBookingId,
          channel: messageChannel,
          direction: messageDirection,
          message: content,
        });
    if (result.error) {
      setError(`Could not save booking history: ${result.error.message}`);
      return;
    }
    if (isNote) setNoteDraft("");
    else setMessageDraft("");
    const [noteResult, messageResult] = await Promise.all([
      supabase
        .from("booking_internal_notes")
        .select("*")
        .eq("booking_id", selectedBookingId)
        .order("created_at", { ascending: false }),
      supabase
        .from("booking_messages")
        .select("*")
        .eq("booking_id", selectedBookingId)
        .order("created_at", { ascending: false }),
    ]);
    if (noteResult.error || messageResult.error) {
      setError(
        `Saved, but could not refresh history: ${noteResult.error?.message ?? messageResult.error?.message}`,
      );
      return;
    }
    setNotes(noteResult.data ?? []);
    setMessages(messageResult.data ?? []);
  }

  async function saveAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!availabilityExperience || !availabilityStart) {
      setError("Choose an experience and a start date.");
      return;
    }
    const start = new Date(`${availabilityStart}T12:00:00`);
    const end = new Date(`${availabilityEnd || availabilityStart}T12:00:00`);
    const capacity = Number(availabilityCapacity);
    if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf()) || end < start) {
      setError("Choose a valid date range.");
      return;
    }
    if (!Number.isInteger(capacity) || capacity < 1) {
      setError("Capacity must be a positive whole number.");
      return;
    }
    if ((end.valueOf() - start.valueOf()) / 86400000 > 365) {
      setError("Availability edits are limited to 366 dates at a time.");
      return;
    }
    const rows: TablesInsert<"availability">[] = [];
    let offset = 0;
    for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1), offset += 1) {
      if (repeatWeekly && offset % 7 !== 0) continue;
      rows.push({
        date: date.toISOString().slice(0, 10),
        experience_id: availabilityExperience,
        capacity,
        status: availabilityStatus,
      });
    }
    const { error: saveError } = await supabase
      .from("availability")
      .upsert(rows, { onConflict: "date,experience_id" });
    if (saveError) setError(`Could not save availability: ${saveError.message}`);
    else await refresh();
  }

  async function saveSetting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!settingKey.trim() || settingKey.trim().length > 100) {
      setError("Setting keys must contain between 1 and 100 characters.");
      return;
    }
    let value: unknown;
    try {
      value = JSON.parse(settingJson);
    } catch {
      setError("Settings must be valid JSON.");
      return;
    }
    if (value === null || !isJson(value)) {
      setError("Settings value must be JSON.");
      return;
    }
    const { error: saveError } = await supabase.from("site_settings").upsert({
      setting_key: settingKey.trim(),
      value,
      is_public: settingPublic,
      updated_at: new Date().toISOString(),
    });
    if (saveError) setError(`Could not save setting: ${saveError.message}`);
    else await refresh();
  }

  async function saveCopyOverride(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!copyPath || !copyPaths.includes(copyPath)) {
      setError("Choose a supported page text.");
      return;
    }
    const { error: saveError } = await supabase.from("site_settings").upsert({
      setting_key: `copy.${copyPath}`,
      value: copyValues,
      is_public: true,
      updated_at: new Date().toISOString(),
    });
    if (saveError) setError(`Could not save translated page text: ${saveError.message}`);
    else await refresh();
  }

  function chooseCopyPath(path: string) {
    setCopyPath(path);
    const current = settings.find((setting) => setting.setting_key === `copy.${path}`)?.value;
    if (typeof current === "object" && current !== null && !Array.isArray(current)) {
      setCopyValues({
        en: typeof current["en"] === "string" ? current["en"] : "",
        fr: typeof current["fr"] === "string" ? current["fr"] : "",
        ar: typeof current["ar"] === "string" ? current["ar"] : "",
      });
      return;
    }
    setCopyValues({
      en: readTranslation(dict.en, path),
      fr: readTranslation(dict.fr, path),
      ar: readTranslation(dict.ar, path),
    });
  }

  async function updateInquiry(inquiry: Inquiry, status: Inquiry["status"]) {
    const { error: updateError } = await supabase
      .from("inquiries")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", inquiry.id);
    if (updateError) setError(`Could not update inquiry: ${updateError.message}`);
    else await refresh();
  }

  async function toggleFaq(faq: Tables<"faqs">) {
    const { error: updateError } = await supabase
      .from("faqs")
      .update({ is_published: !faq.is_published, updated_at: new Date().toISOString() })
      .eq("id", faq.id);
    if (updateError) setError(`Could not update FAQ: ${updateError.message}`);
    else await refresh();
  }

  function editFaq(faq: Tables<"faqs">) {
    setFaqId(faq.id);
    setFaqCategory(readLocalizedFields(faq.category));
    setFaqQuestion(readLocalizedFields(faq.question));
    setFaqAnswer(readLocalizedFields(faq.answer));
    setFaqPublished(faq.is_published);
    setFaqSortOrder(String(faq.sort_order));
  }

  function resetFaqForm() {
    setFaqId("");
    setFaqCategory({ en: "", fr: "", ar: "" });
    setFaqQuestion({ en: "", fr: "", ar: "" });
    setFaqAnswer({ en: "", fr: "", ar: "" });
    setFaqPublished(false);
    setFaqSortOrder(String(faqs.length));
  }

  async function saveFaq(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sortOrder = Number(faqSortOrder);
    if (!Number.isInteger(sortOrder)) {
      setError("FAQ sort order must be a whole number.");
      return;
    }
    const record = {
      category: faqCategory,
      question: faqQuestion,
      answer: faqAnswer,
      sort_order: sortOrder,
      is_published: faqPublished,
      updated_at: new Date().toISOString(),
    };
    const result = faqId
      ? await supabase.from("faqs").update(record).eq("id", faqId)
      : await supabase.from("faqs").insert(record);
    if (result.error) {
      setError(`Could not save FAQ: ${result.error.message}`);
      return;
    }
    resetFaqForm();
    await refresh();
  }

  async function togglePost(post: Tables<"posts">) {
    const published = post.status !== "published";
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        status: published ? "published" : "draft",
        published_at: published ? new Date().toISOString() : null,
      })
      .eq("slug", post.slug);
    if (updateError) setError(`Could not update article: ${updateError.message}`);
    else await refresh();
  }

  async function toggleReview(review: Review) {
    const { error: updateError } = await supabase
      .from("reviews")
      .update({ approved: !review.approved })
      .eq("id", review.id);
    if (updateError) setError(`Could not update review approval: ${updateError.message}`);
    else await refresh();
  }

  function editPost(post: Tables<"posts">) {
    setPostSlug(post.slug);
    setPostTitle(readLocalizedFields(post.title));
    setPostSummary(readLocalizedFields(post.summary));
    setPostBody(readLocalizedFields(post.body));
    setPostDraftNote(post.draft_note ?? "");
  }

  function resetPostForm() {
    setPostSlug("");
    setPostTitle({ en: "", fr: "", ar: "" });
    setPostSummary({ en: "", fr: "", ar: "" });
    setPostBody({ en: "", fr: "", ar: "" });
    setPostDraftNote("Draft — review before publishing.");
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(postSlug)) {
      setError("Article slugs must use lowercase letters, numbers, and single hyphens.");
      return;
    }
    const record = {
      slug: postSlug,
      title: postTitle,
      summary: postSummary,
      body: postBody,
      status: "draft" as const,
      draft_note: postDraftNote.trim() || "Draft — review before publishing.",
      published_at: null,
    };
    const existing = posts.some((post) => post.slug === postSlug);
    const result = existing
      ? await supabase
          .from("posts")
          .update({
            title: record.title,
            summary: record.summary,
            body: record.body,
            draft_note: record.draft_note,
            updated_at: new Date().toISOString(),
          })
          .eq("slug", postSlug)
      : await supabase.from("posts").insert(record);
    if (result.error) {
      setError(`Could not save article: ${result.error.message}`);
      return;
    }
    resetPostForm();
    await refresh();
  }

  if (!authReady) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16" aria-busy="true">
        Checking administrator access…
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-display text-4xl text-primary">Administrator sign in</h1>
        <p className="mt-2 text-muted-foreground">
          Access is restricted to approved administrator accounts.
        </p>
        {error && (
          <p role="alert" className="mt-4 rounded bg-destructive/10 p-3 text-sm">
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
              onChange={(event) => setEmail(event.target.value)}
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
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <Button type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Moroccan Secrets</p>
          <h1 className="font-display text-4xl text-primary">Admin</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void refresh()} disabled={busy}>
            Refresh
          </Button>
          <Button variant="outline" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-4 rounded bg-destructive/10 p-3 text-sm">
          {error}
        </p>
      )}
      <nav aria-label="Admin sections" className="mt-6 flex flex-wrap gap-2 border-b pb-3">
        {tabs.map((item) => (
          <Button
            key={item.id}
            variant={tab === item.id ? "default" : "outline"}
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? "page" : undefined}
          >
            {item.label}
          </Button>
        ))}
      </nav>

      {tab === "overview" && (
        <section className="mt-6">
          <h2 className="text-2xl font-semibold">Operations overview</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Today's bookings" value={todaysBookings.length} />
            <Metric label="Pending bookings" value={pendingBookings.length} />
            <Metric label="Next 7 days" value={upcomingBookings.length} />
            <Metric
              label="Next 7 days' revenue estimate"
              value={revenueEstimate.toLocaleString()}
            />
          </div>
          <h3 className="mt-8 text-xl font-semibold">Upcoming bookings</h3>
          <BookingTable
            bookings={upcomingBookings}
            onStatus={saveBookingStatus}
            onSelect={setSelectedBookingId}
            selectedId={selectedBookingId}
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Revenue estimate is based on saved booking totals and is not a cash-received report.
          </p>
        </section>
      )}

      {tab === "bookings" && (
        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">Bookings</h2>
            <Button variant="outline" onClick={exportBookings}>
              Export CSV
            </Button>
          </div>
          <BookingTable
            bookings={bookings}
            onStatus={saveBookingStatus}
            onSelect={setSelectedBookingId}
            selectedId={selectedBookingId}
          />
          {selectedBooking && (
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <section className="rounded-lg border p-4">
                <h3 className="font-semibold">Guest and booking</h3>
                <p className="mt-2 text-sm">
                  {selectedBooking.name} · {selectedBooking.email}
                </p>
                <p className="text-sm">
                  {selectedBooking.phone} · {selectedBooking.date} · {selectedBooking.guests} guests
                </p>
                <p className="text-sm">
                  Dietary needs: {selectedBooking.dietary_needs || "Not provided"}
                </p>
                <p className="text-sm">
                  Occasion: {selectedBooking.special_occasion || "Not provided"}
                </p>
                <p className="text-sm">
                  Private group: {selectedBooking.private_group ? "Yes" : "No"}
                </p>
              </section>
              <section className="rounded-lg border p-4">
                <h3 className="font-semibold">Internal notes</h3>
                <form
                  className="mt-3 space-y-2"
                  onSubmit={(event) => void addBookingRecord(event, "note")}
                >
                  <label className="sr-only" htmlFor="booking-note">
                    Add internal note
                  </label>
                  <textarea
                    id="booking-note"
                    className={inputClass}
                    maxLength={4000}
                    required
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                  />
                  <Button size="sm" type="submit">
                    Add note
                  </Button>
                </form>
                <ul className="mt-4 space-y-2 text-sm">
                  {notes.map((note) => (
                    <li key={note.id} className="border-t pt-2">
                      <time>{new Date(note.created_at).toLocaleString()}</time>
                      <p>{note.note}</p>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-lg border p-4">
                <h3 className="font-semibold">Guest message history</h3>
                <form
                  className="mt-3 space-y-2"
                  onSubmit={(event) => void addBookingRecord(event, "message")}
                >
                  <label className="block text-sm">
                    Channel
                    <select
                      className={`${inputClass} mt-1`}
                      value={messageChannel}
                      onChange={(event) =>
                        setMessageChannel(event.target.value as typeof messageChannel)
                      }
                    >
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="phone">Phone</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label className="block text-sm">
                    Direction
                    <select
                      className={`${inputClass} mt-1`}
                      value={messageDirection}
                      onChange={(event) =>
                        setMessageDirection(event.target.value as typeof messageDirection)
                      }
                    >
                      <option value="outbound">Sent</option>
                      <option value="inbound">Received</option>
                    </select>
                  </label>
                  <label className="sr-only" htmlFor="booking-message">
                    Log guest communication
                  </label>
                  <textarea
                    id="booking-message"
                    className={inputClass}
                    maxLength={4000}
                    required
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                  />
                  <Button size="sm" type="submit">
                    Log message
                  </Button>
                </form>
                <ul className="mt-4 space-y-2 text-sm">
                  {messages.map((message) => (
                    <li key={message.id} className="border-t pt-2">
                      <time>{new Date(message.created_at).toLocaleString()}</time>
                      <p>
                        {message.direction} · {message.channel}: {message.message}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          )}
        </section>
      )}

      {tab === "calendar" && (
        <section className="mt-6">
          <h2 className="text-2xl font-semibold">Availability calendar</h2>
          <form
            onSubmit={(event) => void saveAvailability(event)}
            className="mt-4 grid gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <label className="block text-sm">
              Experience
              <select
                className={`${inputClass} mt-1`}
                required
                value={availabilityExperience}
                onChange={(event) => setAvailabilityExperience(event.target.value)}
              >
                <option value="">Choose experience</option>
                {experienceOptions.map((id) => (
                  <option key={id} value={id}>
                    {localizedJson(experiences.find((experience) => experience.id === id)?.title)} ·{" "}
                    {id}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Start date
              <input
                className={`${inputClass} mt-1`}
                type="date"
                required
                value={availabilityStart}
                onChange={(event) => setAvailabilityStart(event.target.value)}
              />
            </label>
            <label className="block text-sm">
              End date (optional)
              <input
                className={`${inputClass} mt-1`}
                type="date"
                value={availabilityEnd}
                onChange={(event) => setAvailabilityEnd(event.target.value)}
              />
            </label>
            <label className="block text-sm">
              Capacity
              <input
                className={`${inputClass} mt-1`}
                type="number"
                min="1"
                max="500"
                required
                value={availabilityCapacity}
                onChange={(event) => setAvailabilityCapacity(event.target.value)}
              />
            </label>
            <label className="block text-sm">
              Date status
              <select
                className={`${inputClass} mt-1`}
                value={availabilityStatus}
                onChange={(event) =>
                  setAvailabilityStatus(event.target.value as typeof availabilityStatus)
                }
              >
                <option value="available">Open</option>
                <option value="closed">Blocked</option>
                <option value="booked">Booked</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={repeatWeekly}
                onChange={(event) => setRepeatWeekly(event.target.checked)}
              />
              Repeat weekly through selected range
            </label>
            <div className="sm:col-span-2 lg:col-span-3">
              <Button type="submit">Save dates</Button>
            </div>
          </form>
          <div className="mt-6 overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[600px] text-left text-sm">
              <caption className="p-3 text-left font-semibold">Scheduled capacity</caption>
              <thead>
                <tr className="border-y bg-muted/40">
                  <th className="p-3">Date</th>
                  <th className="p-3">Experience</th>
                  <th className="p-3">Capacity</th>
                  <th className="p-3">Booked</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {availability.map((slot) => (
                  <tr key={slot.id} className="border-b">
                    <td className="p-3">{slot.date}</td>
                    <td className="p-3">{slot.experience_id}</td>
                    <td className="p-3">{slot.capacity}</td>
                    <td className="p-3">{slot.booked_count}</td>
                    <td className="p-3">{slot.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "content" && (
        <section className="mt-6 grid gap-8 xl:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Edit site text (EN / FR / AR)</h2>
            <form
              onSubmit={(event) => void saveCopyOverride(event)}
              className="mt-4 space-y-3 rounded-lg border p-4"
            >
              <label className="block text-sm">
                Text key
                <select
                  className={`${inputClass} mt-1`}
                  required
                  value={copyPath}
                  onChange={(event) => chooseCopyPath(event.target.value)}
                >
                  <option value="">Choose text</option>
                  {copyPaths.map((path) => (
                    <option key={path} value={path}>
                      {path}
                    </option>
                  ))}
                </select>
              </label>
              {(["en", "fr", "ar"] as const).map((language) => (
                <label key={language} className="block text-sm">
                  {language.toUpperCase()}
                  <textarea
                    dir={language === "ar" ? "rtl" : "ltr"}
                    className={`${inputClass} mt-1`}
                    rows={3}
                    maxLength={5000}
                    value={copyValues[language]}
                    onChange={(event) =>
                      setCopyValues((current) => ({ ...current, [language]: event.target.value }))
                    }
                  />
                </label>
              ))}
              <Button type="submit">Save translated text</Button>
            </form>
            <div className="mt-8 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold">FAQ content and publishing</h3>
              <Button size="sm" variant="outline" onClick={resetFaqForm}>
                New FAQ
              </Button>
            </div>
            <ul className="mt-3 space-y-2">
              {faqs.map((faq) => (
                <li
                  key={faq.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"
                >
                  <span>
                    {localizedJson(faq.question)}{" "}
                    <small className="text-muted-foreground">
                      ({faq.is_published ? "Published" : "Draft"})
                    </small>
                  </span>
                  <span className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => editFaq(faq)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void toggleFaq(faq)}>
                      {faq.is_published ? "Unpublish" : "Publish"}
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
            <form
              onSubmit={(event) => void saveFaq(event)}
              className="mt-4 space-y-3 rounded-lg border p-4"
            >
              <h4 className="font-semibold">{faqId ? "Edit FAQ" : "Create FAQ"}</h4>
              {(["category", "question", "answer"] as const).map((field) => {
                const values =
                  field === "category"
                    ? faqCategory
                    : field === "question"
                      ? faqQuestion
                      : faqAnswer;
                const update =
                  field === "category"
                    ? setFaqCategory
                    : field === "question"
                      ? setFaqQuestion
                      : setFaqAnswer;
                return (
                  <fieldset key={field} className="space-y-2">
                    <legend className="font-medium capitalize">{field}</legend>
                    {(["en", "fr", "ar"] as const).map((language) => (
                      <label key={language} className="block text-sm">
                        {language.toUpperCase()}
                        <textarea
                          dir={language === "ar" ? "rtl" : "ltr"}
                          className={`${inputClass} mt-1`}
                          rows={field === "answer" ? 3 : 1}
                          maxLength={field === "answer" ? 5000 : 500}
                          required
                          value={values[language]}
                          onChange={(event) =>
                            update((current) => ({ ...current, [language]: event.target.value }))
                          }
                        />
                      </label>
                    ))}
                  </fieldset>
                );
              })}
              <label className="block text-sm">
                Sort order
                <input
                  className={`${inputClass} mt-1`}
                  type="number"
                  step="1"
                  value={faqSortOrder}
                  onChange={(event) => setFaqSortOrder(event.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={faqPublished}
                  onChange={(event) => setFaqPublished(event.target.checked)}
                />
                Publish this FAQ
              </label>
              <div className="flex gap-2">
                <Button type="submit">Save FAQ</Button>
                {faqId && (
                  <Button type="button" variant="outline" onClick={resetFaqForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
            <div className="mt-8 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold">Blog articles</h3>
              <Button size="sm" variant="outline" onClick={resetPostForm}>
                New article
              </Button>
            </div>
            <ul className="mt-3 space-y-2">
              {posts.map((post) => (
                <li
                  key={post.slug}
                  className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"
                >
                  <span>
                    {localizedJson(post.title)}{" "}
                    <small className="text-muted-foreground">
                      ({post.status}
                      {post.status === "draft" ? ` — ${post.draft_note || "Draft"}` : ""})
                    </small>
                  </span>
                  <span className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => editPost(post)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void togglePost(post)}>
                      {post.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
            <form
              onSubmit={(event) => void savePost(event)}
              className="mt-4 space-y-3 rounded-lg border p-4"
            >
              <h4 className="font-semibold">
                {postSlug && posts.some((post) => post.slug === postSlug)
                  ? "Edit article"
                  : "Create draft article"}
              </h4>
              <label className="block text-sm">
                URL slug
                <input
                  className={`${inputClass} mt-1`}
                  pattern="[a-z0-9]+(-[a-z0-9]+)*"
                  required
                  disabled={posts.some((post) => post.slug === postSlug)}
                  value={postSlug}
                  onChange={(event) => setPostSlug(event.target.value)}
                />
              </label>
              {(["title", "summary", "body"] as const).map((field) => {
                const values =
                  field === "title" ? postTitle : field === "summary" ? postSummary : postBody;
                const update =
                  field === "title"
                    ? setPostTitle
                    : field === "summary"
                      ? setPostSummary
                      : setPostBody;
                return (
                  <fieldset key={field} className="space-y-2">
                    <legend className="font-medium capitalize">{field}</legend>
                    {(["en", "fr", "ar"] as const).map((language) => (
                      <label key={language} className="block text-sm">
                        {language.toUpperCase()}
                        <textarea
                          dir={language === "ar" ? "rtl" : "ltr"}
                          className={`${inputClass} mt-1`}
                          rows={field === "body" ? 6 : 2}
                          maxLength={field === "body" ? 30000 : 5000}
                          required
                          value={values[language]}
                          onChange={(event) =>
                            update((current) => ({ ...current, [language]: event.target.value }))
                          }
                        />
                      </label>
                    ))}
                  </fieldset>
                );
              })}
              <label className="block text-sm">
                Draft note
                <input
                  className={`${inputClass} mt-1`}
                  maxLength={500}
                  value={postDraftNote}
                  onChange={(event) => setPostDraftNote(event.target.value)}
                />
              </label>
              <div className="flex gap-2">
                <Button type="submit">Save draft</Button>
                {postSlug && (
                  <Button type="button" variant="outline" onClick={resetPostForm}>
                    Clear
                  </Button>
                )}
              </div>
            </form>
            <h3 className="mt-8 text-xl font-semibold">Guest review moderation</h3>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No guest reviews have been submitted.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {reviews.map((review) => (
                  <li key={review.id} className="rounded border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">
                          {review.author} · {review.rating}/5
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm">
                          {localizedJson(review.quote, review.language)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {review.origin || "Origin not provided"} · {review.language.toUpperCase()}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => void toggleReview(review)}>
                        {review.approved ? "Unapprove" : "Approve"}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Admin-managed settings</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Use JSON values. Public values are visible to visitors. Supported keys include
              booking.currency, booking.cancellation_policy, trust.included, trust.not_included,
              trust.arrival_time, trust.meeting_point, trust.dress, trust.alcohol_policy,
              trust.what_to_bring, trust.why_family_home, trust.safety_hygiene, contact.whatsapp,
              contact.email, and contact.instagram. Localized text uses an object with en, fr, and
              ar strings; included-item values use an object with en, fr, and ar arrays.
            </p>
            <form
              onSubmit={(event) => void saveSetting(event)}
              className="mt-4 space-y-3 rounded-lg border p-4"
            >
              <label className="block text-sm">
                Setting key
                <input
                  className={`${inputClass} mt-1`}
                  required
                  maxLength={100}
                  value={settingKey}
                  onChange={(event) => setSettingKey(event.target.value)}
                />
              </label>
              <label className="block text-sm">
                JSON value
                <textarea
                  className={`${inputClass} mt-1 font-mono`}
                  rows={8}
                  required
                  value={settingJson}
                  onChange={(event) => setSettingJson(event.target.value)}
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={settingPublic}
                  onChange={(event) => setSettingPublic(event.target.checked)}
                />
                Publish this setting to the public site
              </label>
              <Button type="submit">Save setting</Button>
            </form>
            <h3 className="mt-6 text-lg font-semibold">Current settings</h3>
            <ul className="mt-2 max-h-80 space-y-2 overflow-auto">
              {settings.map((setting) => (
                <li key={setting.setting_key} className="rounded border p-2 text-xs">
                  <strong>{setting.setting_key}</strong> ·{" "}
                  {setting.is_public ? "Public" : "Private"}
                  <Button
                    className="ms-2"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSettingKey(setting.setting_key);
                      setSettingJson(JSON.stringify(setting.value, null, 2));
                      setSettingPublic(setting.is_public);
                    }}
                  >
                    Edit
                  </Button>
                  <pre className="mt-1 whitespace-pre-wrap break-all">
                    {JSON.stringify(setting.value)}
                  </pre>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {tab === "inquiries" && (
        <section className="mt-6">
          <h2 className="text-2xl font-semibold">Inquiries inbox</h2>
          {inquiries.length === 0 ? (
            <p className="mt-4 text-muted-foreground">There are no inquiries yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {inquiries.map((inquiry) => (
                <li key={inquiry.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">
                        {inquiry.full_name} · {inquiry.kind.replaceAll("_", " ")}
                      </h3>
                      <p className="text-sm">
                        {inquiry.email} · {inquiry.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {inquiry.organization || ""} {inquiry.event_type || ""}{" "}
                        {inquiry.requested_date || ""}{" "}
                        {inquiry.guest_count ? `${inquiry.guest_count} guests` : ""}{" "}
                        {inquiry.quantity ? `quantity ${inquiry.quantity}` : ""}
                      </p>
                    </div>
                    <label className="text-sm">
                      Status
                      <select
                        className={`${inputClass} mt-1`}
                        value={inquiry.status}
                        onChange={(event) =>
                          void updateInquiry(inquiry, event.target.value as Inquiry["status"])
                        }
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </label>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm">{inquiry.message}</p>
                  <time className="mt-2 block text-xs text-muted-foreground">
                    {new Date(inquiry.created_at).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {tab === "subscribers" && (
        <section className="mt-6">
          <h2 className="text-2xl font-semibold">Newsletter subscribers</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Only confirmed addresses have opted in. Pending email requests are not subscribed.
          </p>
          {subscribers.length === 0 ? (
            <p className="mt-4 text-muted-foreground">
              No subscription requests have been received.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[620px] text-left text-sm">
                <caption className="sr-only">Newsletter subscription status</caption>
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="p-3">Email</th>
                    <th className="p-3">Language</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Opt-in date</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b">
                      <td className="p-3">{subscriber.email}</td>
                      <td className="p-3">{subscriber.language.toUpperCase()}</td>
                      <td className="p-3">{subscriber.status}</td>
                      <td className="p-3">{new Date(subscriber.consented_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <article className="rounded-lg border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-primary">{value}</p>
    </article>
  );
}

function BookingTable({
  bookings,
  onStatus,
  onSelect,
  selectedId,
}: {
  bookings: Booking[];
  onStatus: (booking: Booking, status: Booking["status"]) => void | Promise<void>;
  onSelect: (id: string) => void;
  selectedId: string;
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[760px] text-left text-sm">
        <caption className="sr-only">Guest bookings and status</caption>
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="p-3">Guest</th>
            <th className="p-3">Date</th>
            <th className="p-3">Experience</th>
            <th className="p-3">Guests</th>
            <th className="p-3">Total</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr
              key={booking.id}
              className={`border-b ${booking.id === selectedId ? "bg-muted/30" : ""}`}
            >
              <td className="p-3">
                <button
                  className="font-medium text-primary underline"
                  onClick={() => onSelect(booking.id)}
                >
                  {booking.name}
                </button>
                <span className="block text-xs text-muted-foreground">{booking.email}</span>
              </td>
              <td className="p-3">{booking.date}</td>
              <td className="p-3">{booking.experience_id}</td>
              <td className="p-3">{booking.guests}</td>
              <td className="p-3">{Number(booking.total_price).toLocaleString()}</td>
              <td className="p-3">
                <label className="sr-only" htmlFor={`status-${booking.id}`}>
                  Booking status for {booking.name}
                </label>
                <select
                  id={`status-${booking.id}`}
                  className={inputClass}
                  value={booking.status}
                  onChange={(event) =>
                    void onStatus(booking, event.target.value as Booking["status"])
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function localizedJson(value: unknown, language: Lang = "en"): string {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return "";
  const values = value as Record<string, unknown>;
  const selected = values[language];
  if (typeof selected === "string" && selected) return selected;
  return typeof values["en"] === "string" ? values["en"] : "";
}

function readLocalizedFields(value: unknown): LocalizedFields {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return { en: "", fr: "", ar: "" };
  }
  const values = value as Record<string, unknown>;
  return {
    en: typeof values["en"] === "string" ? values["en"] : "",
    fr: typeof values["fr"] === "string" ? values["fr"] : "",
    ar: typeof values["ar"] === "string" ? values["ar"] : "",
  };
}

function isJson(value: unknown): value is Json {
  if (value === null || typeof value === "string" || typeof value === "boolean") return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isJson);
  if (typeof value !== "object") return false;
  return Object.values(value).every(isJson);
}
