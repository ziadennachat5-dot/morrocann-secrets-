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

  const largePhoto = photos[0];
  const mediumPhotos = photos.slice(1, 3);
  const smallPhotos = photos.slice(3);

  return (
    <div>
      {/* Phones & Tablets (<1024px): Horizontal scroll-snap carousel */}
      <div
        className="lg:hidden flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-none"
        style={{ scrollPaddingLeft: "20px" }}
      >
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            aria-label={`${t.gallery.openPhoto}: ${getAlt(photo, lang)}`}
            onClick={() => setSelectedIndex(index)}
            className="group shrink-0 w-[78vw] max-w-[340px] snap-center overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-[28px] shadow-soft cursor-pointer"
            style={{ aspectRatio: "4/5" }}
          >
            <img
              src={photo.url}
              srcSet={photo.srcSet || undefined}
              sizes="(max-width: 640px) 80vw, 340px"
              alt={getAlt(photo, lang)}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] rounded-[28px] image-reveal"
            />
          </button>
        ))}
      </div>

      {/* Desktop (>=1024px): Asymmetric Editorial Collage (1 large, 2 medium, small below) */}
      <div className="hidden lg:flex flex-col gap-6">
        {/* Top row: 1 Large (7 cols) + 2 Medium stacked (5 cols) */}
        {largePhoto && (
          <div className="grid grid-cols-12 gap-6 items-stretch">
            {/* 1 Large Photo */}
            <div className={mediumPhotos.length > 0 ? "col-span-7" : "col-span-12"}>
              <button
                type="button"
                aria-label={`${t.gallery.openPhoto}: ${getAlt(largePhoto, lang)}`}
                onClick={() => setSelectedIndex(0)}
                className="group w-full h-full min-h-[540px] max-h-[580px] overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-[28px] shadow-soft cursor-pointer block relative"
              >
                <img
                  src={largePhoto.url}
                  srcSet={largePhoto.srcSet || undefined}
                  sizes="(min-width: 1024px) 58vw, 800px"
                  alt={getAlt(largePhoto, lang)}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] rounded-[28px] image-reveal"
                />
              </button>
            </div>

            {/* 2 Medium Photos stacked */}
            {mediumPhotos.length > 0 && (
              <div className="col-span-5 flex flex-col gap-6 justify-between">
                {mediumPhotos.map((photo, mIdx) => (
                  <button
                    key={photo.id}
                    type="button"
                    aria-label={`${t.gallery.openPhoto}: ${getAlt(photo, lang)}`}
                    onClick={() => setSelectedIndex(1 + mIdx)}
                    className="group w-full h-[258px] overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-[28px] shadow-soft cursor-pointer block relative"
                  >
                    <img
                      src={photo.url}
                      srcSet={photo.srcSet || undefined}
                      sizes="(min-width: 1024px) 42vw, 550px"
                      alt={getAlt(photo, lang)}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] rounded-[28px] image-reveal"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom row: Small Photos in a clean grid */}
        {smallPhotos.length > 0 && (
          <div
            className={`grid gap-6 ${smallPhotos.length === 1 ? "grid-cols-1" : smallPhotos.length === 2 ? "grid-cols-2" : smallPhotos.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}
          >
            {smallPhotos.map((photo, sIdx) => (
              <button
                key={photo.id}
                type="button"
                aria-label={`${t.gallery.openPhoto}: ${getAlt(photo, lang)}`}
                onClick={() => setSelectedIndex(3 + sIdx)}
                className="group w-full h-[240px] overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-[28px] shadow-soft cursor-pointer block relative"
              >
                <img
                  src={photo.url}
                  srcSet={photo.srcSet || undefined}
                  sizes="(min-width: 1024px) 25vw, 320px"
                  alt={getAlt(photo, lang)}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02] rounded-[28px] image-reveal"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={selectedPhoto !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedIndex(null);
        }}
      >
        <DialogContent
          closeLabel={t.gallery.close}
          className="w-[calc(100vw-2rem)] max-w-5xl border-none bg-[#1D1414] p-4 text-white sm:p-8"
          style={{ borderRadius: "28px" }}
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
