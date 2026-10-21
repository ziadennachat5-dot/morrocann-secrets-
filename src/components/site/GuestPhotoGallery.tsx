import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { getPublicGuestPhotos } from "@/lib/guest-photos.functions";

type PublicGuestPhoto = Awaited<ReturnType<typeof getPublicGuestPhotos>>["photos"][number];

function getAlt(photo: PublicGuestPhoto, language: "en" | "fr" | "ar") {
  return photo.alt[language].trim() || photo.alt.en.trim();
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

  return (
    <div className="mt-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            aria-label={`${t.gallery.openPhoto}: ${getAlt(photo, lang)}`}
            onClick={() => setSelectedIndex(index)}
            className="group min-h-11 overflow-hidden rounded-xl border border-border bg-card text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <img
              src={photo.url}
              srcSet={photo.srcSet || undefined}
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 50vw"
              alt={getAlt(photo, lang)}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
          className="w-[calc(100vw-2rem)] max-w-5xl border-none bg-ink p-4 text-ink-foreground sm:p-8"
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
              <DialogTitle className="pe-8 font-sans text-sm text-ink-foreground/80">
                {t.gallery.photo} {selectedIndex + 1} / {photos.length}
              </DialogTitle>
              <DialogDescription className="sr-only">{t.gallery.navigationHint}</DialogDescription>
              <img
                src={selectedPhoto.url}
                srcSet={selectedPhoto.srcSet || undefined}
                sizes="(min-width: 1024px) 80vw, 92vw"
                alt={getAlt(selectedPhoto, lang)}
                className="mx-auto max-h-[70vh] max-w-full object-contain"
              />
              <p className="text-center text-sm text-ink-foreground/85">
                {getAlt(selectedPhoto, lang)}
              </p>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => movePhoto(-1)}
                  aria-label={t.gallery.previous}
                  className="btn btn-ghost min-h-11 border-ink-foreground/60 text-ink-foreground"
                >
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  {t.gallery.previous}
                </button>
                <button
                  type="button"
                  onClick={() => movePhoto(1)}
                  aria-label={t.gallery.next}
                  className="btn btn-ghost min-h-11 border-ink-foreground/60 text-ink-foreground"
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
