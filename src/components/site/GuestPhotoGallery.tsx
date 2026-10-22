import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { getPublicGuestPhotos } from "@/lib/guest-photos.functions";

type PublicGuestPhoto = Awaited<ReturnType<typeof getPublicGuestPhotos>>["photos"][number];

function getAlt(photo: PublicGuestPhoto, language: "en" | "fr" | "ar") {
  return photo.alt[language].trim() || photo.alt.en.trim();
}

/** Masonry-style: assign photos to columns */
function distributeToColumns<T>(items: T[], cols: number): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols]!.push(item));
  return columns;
}

export function GuestPhotoGallery({ photos }: { photos: PublicGuestPhoto[] }) {
  const { t, lang } = useI18n();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const selectedPhoto = selectedIndex === null ? null : photos[selectedIndex];

  function movePhoto(direction: -1 | 1) {
    setSelectedIndex((current) =>
      current === null ? null : (current + direction + photos.length) % photos.length,
    );
  }

  // Masonry: 2 columns on mobile, 3 on sm, 4 on lg
  const cols2 = distributeToColumns(photos, 2);
  const cols3 = distributeToColumns(photos, 3);
  const cols4 = distributeToColumns(photos, 4);

  return (
    <div>
      {/* Masonry grid — CSS column layout for natural staggering */}
      <div
        style={{
          columnCount: 2,
          columnGap: "12px",
        }}
        className="sm:hidden"
      >
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            aria-label={`${t.gallery.openPhoto}: ${getAlt(photo, lang)}`}
            onClick={() => setSelectedIndex(index)}
            className="group block w-full mb-3 overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderRadius: "20px", breakInside: "avoid" }}
          >
            <img
              src={photo.url}
              srcSet={photo.srcSet || undefined}
              sizes="50vw"
              alt={getAlt(photo, lang)}
              loading="lazy"
              className="w-full object-cover transition-transform duration-300 group-hover:scale-103"
              style={{ display: "block", borderRadius: "20px" }}
            />
          </button>
        ))}
      </div>

      {/* 3 columns — sm to lg */}
      <div style={{ columnCount: 3, columnGap: "12px" }} className="hidden sm:block lg:hidden">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            aria-label={`${t.gallery.openPhoto}: ${getAlt(photo, lang)}`}
            onClick={() => setSelectedIndex(index)}
            className="group block w-full mb-3 overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderRadius: "20px", breakInside: "avoid" }}
          >
            <img
              src={photo.url}
              srcSet={photo.srcSet || undefined}
              sizes="33vw"
              alt={getAlt(photo, lang)}
              loading="lazy"
              className="w-full object-cover transition-transform duration-300 group-hover:scale-103"
              style={{ display: "block", borderRadius: "20px" }}
            />
          </button>
        ))}
      </div>

      {/* 4 columns — lg+ */}
      <div style={{ columnCount: 4, columnGap: "12px" }} className="hidden lg:block">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            aria-label={`${t.gallery.openPhoto}: ${getAlt(photo, lang)}`}
            onClick={() => setSelectedIndex(index)}
            className="group block w-full mb-3 overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ borderRadius: "20px", breakInside: "avoid" }}
          >
            <img
              src={photo.url}
              srcSet={photo.srcSet || undefined}
              sizes="25vw"
              alt={getAlt(photo, lang)}
              loading="lazy"
              className="w-full object-cover transition-transform duration-300 group-hover:scale-103"
              style={{ display: "block", borderRadius: "20px" }}
            />
          </button>
        ))}
      </div>

      <Dialog
        open={selectedPhoto !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedIndex(null);
        }}
      >
        <DialogContent
          closeLabel={t.gallery.close}
          className="w-[calc(100vw-2rem)] max-w-5xl border-none bg-[#1c1010] p-4 text-white sm:p-8"
          style={{ borderRadius: "24px" }}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              movePhoto(1);
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              movePhoto(-1);
            }
          }}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const startX = touchStartX.current;
            const endX = event.changedTouches[0]?.clientX;
            touchStartX.current = null;
            if (startX === null || endX === undefined || Math.abs(endX - startX) < 40) return;
            movePhoto(endX < startX ? 1 : -1);
          }}
        >
          {selectedPhoto && selectedIndex !== null && (
            <>
              <DialogTitle className="pe-8 font-sans text-sm text-white/70">
                {t.gallery.photo} {selectedIndex + 1} / {photos.length}
              </DialogTitle>
              <DialogDescription className="sr-only">{t.gallery.navigationHint}</DialogDescription>
              <img
                src={selectedPhoto.url}
                srcSet={selectedPhoto.srcSet || undefined}
                sizes="(min-width: 1024px) 80vw, 92vw"
                alt={getAlt(selectedPhoto, lang)}
                className="mx-auto max-h-[70vh] max-w-full object-contain"
                style={{ borderRadius: "12px" }}
              />
              <div className="flex justify-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => movePhoto(-1)}
                  aria-label={t.gallery.previous}
                  className="btn btn-ghost border-white/40 text-white !h-11"
                  style={{ color: "#fff" }}
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  {t.gallery.previous}
                </button>
                <button
                  type="button"
                  onClick={() => movePhoto(1)}
                  aria-label={t.gallery.next}
                  className="btn btn-ghost border-white/40 text-white !h-11"
                  style={{ color: "#fff" }}
                >
                  {t.gallery.next}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
