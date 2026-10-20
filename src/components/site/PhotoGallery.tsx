import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { galleryPhotos } from "@/lib/photos";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Photo } from "./Photo";
import { SectionHead } from "./Brand";

export function PhotoGallery() {
  const { t, l } = useI18n();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedPhoto = selectedIndex === null ? null : galleryPhotos[selectedIndex];

  return (
    <section aria-labelledby="photo-gallery-heading">
      <SectionHead
        id="photo-gallery-heading"
        eyebrow={t.gallery.eyebrow}
        title={t.gallery.title}
        sub={t.gallery.subtitle}
      />
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {galleryPhotos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            aria-label={`${t.gallery.openPhoto}: ${l(photo.alt)}`}
            onClick={() => setSelectedIndex(index)}
            className="group overflow-hidden rounded-xl border border-border bg-card text-start"
          >
            <Photo
              photo={photo}
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
            if (selectedIndex === null) return;
            if (event.key === "ArrowRight") {
              event.preventDefault();
              setSelectedIndex((selectedIndex + 1) % galleryPhotos.length);
            } else if (event.key === "ArrowLeft") {
              event.preventDefault();
              setSelectedIndex((selectedIndex - 1 + galleryPhotos.length) % galleryPhotos.length);
            }
          }}
        >
          {selectedPhoto && selectedIndex !== null && (
            <>
              <DialogTitle className="pe-8 font-sans text-sm text-ink-foreground/80">
                {t.gallery.photo} {selectedIndex + 1} / {galleryPhotos.length}
              </DialogTitle>
              <DialogDescription className="sr-only">{t.gallery.navigationHint}</DialogDescription>
              <Photo
                photo={selectedPhoto}
                sizes="(min-width: 1024px) 80vw, 92vw"
                className="mx-auto max-h-[70vh] max-w-full object-contain"
              />
              <p className="text-center text-sm text-ink-foreground/85">{l(selectedPhoto.alt)}</p>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndex(
                      (selectedIndex - 1 + galleryPhotos.length) % galleryPhotos.length,
                    )
                  }
                  aria-label={t.gallery.previous}
                  className="btn btn-ghost border-ink-foreground/60 text-ink-foreground"
                >
                  <ArrowLeft aria-hidden className="h-4 w-4" />
                  {t.gallery.previous}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIndex((selectedIndex + 1) % galleryPhotos.length)}
                  aria-label={t.gallery.next}
                  className="btn btn-ghost border-ink-foreground/60 text-ink-foreground"
                >
                  {t.gallery.next}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
