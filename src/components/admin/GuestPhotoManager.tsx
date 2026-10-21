import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";

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

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold">Guest photos</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Photos stay private until you add alt text and confirm that the guest agreed to be shown.
      </p>
      <div className="mt-4 rounded-lg border p-4">
        <label className="block text-sm font-medium">
          Upload several photos
          <input
            className={`${inputClass} mt-2`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />
        </label>
        <Button
          className="mt-3 min-h-11"
          disabled={!files.length || busy}
          onClick={() => void uploadSelected()}
        >
          {busy ? "Working…" : `Upload ${files.length || ""} photo${files.length === 1 ? "" : "s"}`}
        </Button>
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
              className="rounded-xl border p-4"
            >
              {previews[photo.id] && (
                <img
                  src={previews[photo.id]}
                  alt=""
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                />
              )}
              <fieldset className="mt-3 space-y-2">
                <legend className="text-sm font-semibold">Accessible photo description</legend>
                {languages.map((language) => (
                  <label key={language} className="block text-sm">
                    {language.toUpperCase()}
                    <input
                      className={`${inputClass} mt-1`}
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
              <label className="mt-3 flex min-h-11 items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={photo.guest_consent_confirmed}
                  onChange={(event) => void setConsent(photo, event.target.checked, alt)}
                />
                Guest agreed to be shown
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === 0 || busy}
                  onClick={() => {
                    const previousPhoto = sortedPhotos[index - 1];
                    if (previousPhoto) void reorderPhotos(photo.id, previousPhoto.id);
                  }}
                >
                  Move earlier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={index === sortedPhotos.length - 1 || busy}
                  onClick={() => {
                    const nextPhoto = sortedPhotos[index + 1];
                    if (nextPhoto) void reorderPhotos(photo.id, nextPhoto.id);
                  }}
                >
                  Move later
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
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
