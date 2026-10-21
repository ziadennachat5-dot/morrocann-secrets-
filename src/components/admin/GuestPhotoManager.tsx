import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import { syncRootGuestPhotos } from "@/lib/guest-photos.functions";

type GuestPhoto = Tables<"guest_photos">;
type Language = "en" | "fr" | "ar";
type Rendition = { width: number; path: string };
type AltText = Record<Language, string>;
const languages: Language[] = ["en", "fr", "ar"];
const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function parseAlt(value: Json): AltText {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { en: "", fr: "", ar: "" };
  const fields = value as Record<string, Json | undefined>;
  return {
    en: typeof fields["en"] === "string" ? fields["en"] : "",
    fr: typeof fields["fr"] === "string" ? fields["fr"] : "",
    ar: typeof fields["ar"] === "string" ? fields["ar"] : "",
  };
}

function parseRenditions(value: Json): Rendition[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const fields = entry as Record<string, Json | undefined>;
    if (typeof fields["width"] !== "number" || typeof fields["path"] !== "string") return [];
    return [{ width: fields["width"], path: fields["path"] }];
  });
}

async function encodePhoto(file: File): Promise<{ width: number; blob: Blob }[]> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const widths = [
      ...new Set(
        [320, 640, 960, 1600].filter((width) => width <= bitmap.width).concat(bitmap.width),
      ),
    ].sort((a, b) => a - b);
    return await Promise.all(
      widths.map(
        (width) =>
          new Promise<{ width: number; blob: Blob }>((resolve, reject) => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = Math.round((bitmap.height * width) / bitmap.width);
            const context = canvas.getContext("2d");
            if (!context) {
              reject(new Error("Unable to prepare the photo for upload."));
              return;
            }
            context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
              (blob) =>
                blob ? resolve({ width, blob }) : reject(new Error("Unable to encode the photo.")),
              "image/webp",
              0.82,
            );
          }),
      ),
    );
  } finally {
    bitmap.close();
  }
}

export function GuestPhotoManager({
  photos,
  onRefresh,
  onError,
}: {
  photos: GuestPhoto[];
  onRefresh: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);
  const [altDrafts, setAltDrafts] = useState<Record<string, AltText>>({});
  const sortedPhotos = useMemo(
    () => [...photos].sort((a, b) => a.sort_order - b.sort_order),
    [photos],
  );

  useEffect(() => {
    setAltDrafts(Object.fromEntries(sortedPhotos.map((photo) => [photo.id, parseAlt(photo.alt)])));
  }, [sortedPhotos]);

  useEffect(() => {
    let active = true;
    void Promise.all(
      sortedPhotos.map(async (photo) => {
        const renditions = parseRenditions(photo.renditions);
        const path = renditions.at(-1)?.path || photo.storage_path;
        const { data, error } = await supabase.storage
          .from("guest-photos")
          .createSignedUrl(path, 3600);
        if (error) throw new Error(`Could not preview guest photo: ${error.message}`);
        return [photo.id, data.signedUrl] as const;
      }),
    )
      .then((entries) => {
        if (active) setPreviews(Object.fromEntries(entries));
      })
      .catch((error: unknown) => {
        console.error("Guest photo previews could not be loaded:", error);
        onError(error instanceof Error ? error.message : "Could not load guest photo previews.");
      });
    return () => {
      active = false;
    };
  }, [onError, sortedPhotos]);

  async function uploadSelected() {
    if (!files.length) return;
    setBusy(true);
    try {
      let nextSortOrder = sortedPhotos.length;
      for (const file of files) {
        const id = crypto.randomUUID();
        const encoded = await encodePhoto(file);
        const renditions: Rendition[] = [];
        try {
          for (const rendition of encoded) {
            const path = `uploads/${id}/${rendition.width}.webp`;
            const { error } = await supabase.storage
              .from("guest-photos")
              .upload(path, rendition.blob, { contentType: "image/webp", upsert: false });
            if (error) throw new Error(`Photo upload failed: ${error.message}`);
            renditions.push({ width: rendition.width, path });
          }
          const largest = renditions.at(-1);
          if (!largest) throw new Error("No photo renditions were created.");
          const renditionJson: Json[] = renditions.map(({ width, path }) => ({ width, path }));
          const { error } = await supabase.from("guest_photos").insert({
            storage_path: largest.path,
            renditions: renditionJson,
            alt: { en: "", fr: "", ar: "" },
            sort_order: nextSortOrder,
            guest_consent_confirmed: false,
          });
          if (error) throw new Error(`Photo details could not be saved: ${error.message}`);
          nextSortOrder += 1;
        } catch (error) {
          if (renditions.length) {
            const { error: cleanupError } = await supabase.storage
              .from("guest-photos")
              .remove(renditions.map(({ path }) => path));
            if (cleanupError) {
              console.error("Incomplete photo upload could not be cleaned up:", cleanupError);
            }
          }
          throw error;
        }
      }
      setFiles([]);
      await onRefresh();
    } catch (error) {
      console.error("Guest photo upload failed:", error);
      onError(error instanceof Error ? error.message : "Guest photo upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function saveAlt(photo: GuestPhoto, alt: AltText) {
    const { error } = await supabase.from("guest_photos").update({ alt }).eq("id", photo.id);
    if (error) onError(`Photo description could not be saved: ${error.message}`);
    else await onRefresh();
  }

  async function setConsent(photo: GuestPhoto, confirmed: boolean, alt: AltText) {
    if (confirmed && !alt.en.trim()) {
      onError("Add an English photo description before confirming guest consent.");
      return;
    }
    if (confirmed) {
      const { error: altError } = await supabase
        .from("guest_photos")
        .update({ alt })
        .eq("id", photo.id);
      if (altError) {
        onError(`Photo description could not be saved: ${altError.message}`);
        return;
      }
    }
    const { error } = await supabase
      .from("guest_photos")
      .update({ guest_consent_confirmed: confirmed })
      .eq("id", photo.id);
    if (error) onError(`Photo consent could not be saved: ${error.message}`);
    else await onRefresh();
  }

  async function reorderPhotos(sourceId: string, targetId: string) {
    const index = sortedPhotos.findIndex((photo) => photo.id === sourceId);
    const target = sortedPhotos.findIndex((photo) => photo.id === targetId);
    if (index < 0 || target < 0 || target === index) return;
    const reordered = [...sortedPhotos];
    const [photo] = reordered.splice(index, 1);
    if (!photo) return;
    reordered.splice(target, 0, photo);
    setBusy(true);
    try {
      for (const [sortOrder, photo] of reordered.entries()) {
        const { error } = await supabase
          .from("guest_photos")
          .update({ sort_order: sortOrder })
          .eq("id", photo.id);
        if (error) throw new Error(`Photo order could not be saved: ${error.message}`);
      }
      await onRefresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Photo order could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePhoto(photo: GuestPhoto) {
    if (!window.confirm("Delete this photo and all optimized copies?")) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("guest_photos").delete().eq("id", photo.id);
      if (error) throw new Error(`Photo details could not be deleted: ${error.message}`);
      const paths = [
        ...parseRenditions(photo.renditions).map(({ path }) => path),
        photo.storage_path,
      ];
      const { error: storageError } = await supabase.storage
        .from("guest-photos")
        .remove([...new Set(paths)]);
      if (storageError) {
        await onRefresh();
        throw new Error(
          `Photo record was removed, but its private files could not be deleted: ${storageError.message}`,
        );
      }
      await onRefresh();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Photo could not be deleted.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSyncFolder() {
    setSyncing(true);
    setSyncMessage("");
    try {
      const res = await syncRootGuestPhotos();
      setSyncMessage(
        res.addedCount > 0
          ? `Synced ${res.addedCount} new photo(s) from project folder.`
          : `All photos from folder (${res.totalSources}) are already in the manager.`,
      );
      await onRefresh();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Sync from project folder failed.");
    } finally {
      setSyncing(false);
    }
  }

  const approvedCount = sortedPhotos.filter((p) => p.guest_consent_confirmed).length;
  const pendingCount = sortedPhotos.length - approvedCount;

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Guest Photos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {sortedPhotos.length} total photos ·{" "}
            <span className="text-emerald-700 font-semibold">{approvedCount} visible publicly</span>{" "}
            · <span className="text-amber-800 font-semibold">{pendingCount} pending consent</span>
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="min-h-12 px-5 font-semibold"
          disabled={busy || syncing}
          onClick={() => void handleSyncFolder()}
        >
          {syncing ? "Scanning folder…" : "📁 Sync photos from folder"}
        </Button>
      </div>

      {syncMessage && (
        <p
          role="status"
          className="mt-3 rounded-lg bg-accent/15 p-3 text-sm font-medium text-accent"
        >
          {syncMessage}
        </p>
      )}

      <div className="mt-4 rounded-2xl border bg-card p-4 sm:p-5 shadow-sm">
        <label className="block text-sm font-semibold">
          Upload new photos (from phone / computer)
          <input
            className={`${inputClass} mt-2`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            className="min-h-12 px-6 font-semibold"
            disabled={!files.length || busy || syncing}
            onClick={() => void uploadSelected()}
          >
            {busy
              ? "Working…"
              : `Upload ${files.length || ""} photo${files.length === 1 ? "" : "s"}`}
          </Button>
        </div>
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedPhotos.map((photo, index) => {
          const alt = altDrafts[photo.id] ?? parseAlt(photo.alt);
          return (
            <li
              key={photo.id}
              draggable={!busy}
              onDragStart={() => setDraggedPhotoId(photo.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                if (draggedPhotoId) void reorderPhotos(draggedPhotoId, photo.id);
                setDraggedPhotoId(null);
              }}
              onDragEnd={() => setDraggedPhotoId(null)}
              className="rounded-2xl border bg-card p-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                {previews[photo.id] && (
                  <img
                    src={previews[photo.id]}
                    alt=""
                    className="aspect-[4/3] w-full rounded-xl object-cover border"
                  />
                )}
                {photo.source_file && (
                  <p className="mt-2 text-xs text-muted-foreground font-mono truncate">
                    {photo.source_file}
                  </p>
                )}

                <div className="mt-3 rounded-xl border p-3 bg-background">
                  <label className="flex items-center gap-3 text-sm font-semibold cursor-pointer min-h-11">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded accent-primary"
                      checked={photo.guest_consent_confirmed}
                      onChange={(event) => void setConsent(photo, event.target.checked, alt)}
                    />
                    <span>
                      {photo.guest_consent_confirmed ? (
                        <span className="text-emerald-700 font-bold">
                          ✓ Guest agreed to be shown
                        </span>
                      ) : (
                        <span className="text-amber-800 font-medium">Guest agreed to be shown</span>
                      )}
                    </span>
                  </label>
                  <p className="text-xs text-muted-foreground ps-8">
                    {photo.guest_consent_confirmed
                      ? "Visible on public website"
                      : "Hidden from public website"}
                  </p>
                </div>

                <details className="mt-3 rounded-lg border p-2">
                  <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
                    Accessible description (alt text)
                  </summary>
                  <fieldset className="mt-2 space-y-2">
                    {languages.map((language) => (
                      <label key={language} className="block text-xs">
                        {language.toUpperCase()}
                        <input
                          className={`${inputClass} mt-1 text-xs`}
                          dir={language === "ar" ? "rtl" : "ltr"}
                          maxLength={500}
                          value={alt[language]}
                          onChange={(event) =>
                            setAltDrafts((current) => ({
                              ...current,
                              [photo.id]: { ...alt, [language]: event.target.value },
                            }))
                          }
                          onBlur={(event) =>
                            void saveAlt(photo, { ...alt, [language]: event.currentTarget.value })
                          }
                        />
                      </label>
                    ))}
                  </fieldset>
                </details>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-11 flex-1"
                  disabled={index === 0 || busy}
                  onClick={() => {
                    const previousPhoto = sortedPhotos[index - 1];
                    if (previousPhoto) void reorderPhotos(photo.id, previousPhoto.id);
                  }}
                >
                  ← Move earlier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-11 flex-1"
                  disabled={index === sortedPhotos.length - 1 || busy}
                  onClick={() => {
                    const nextPhoto = sortedPhotos[index + 1];
                    if (nextPhoto) void reorderPhotos(photo.id, nextPhoto.id);
                  }}
                >
                  Move later →
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="min-h-11"
                  disabled={busy}
                  onClick={() => void deletePhoto(photo)}
                >
                  Delete
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
