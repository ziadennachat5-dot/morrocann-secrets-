import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import { Check, Image as ImageIcon, Loader2, RefreshCw, Upload } from "lucide-react";

type GuestPhoto = Tables<"guest_photos">;
type AdminLang = "en" | "fr" | "ar";
type Rendition = { width: number; path: string };

export interface SitePhotoSlot {
  key: string;
  sourceFile: string;
  fallbackFile?: string;
  fallbackUrl: string;
  title: { en: string; fr: string; ar: string };
  section: { en: string; fr: string; ar: string };
  description: { en: string; fr: string; ar: string };
  badge: { en: string; fr: string; ar: string };
}

export const SITE_PHOTO_SLOTS: SitePhotoSlot[] = [
  {
    key: "story",
    sourceFile: "5.png",
    fallbackFile: "5.jpeg",
    fallbackUrl: "/5.png",
    badge: { en: "MAIN STORY", fr: "HISTOIRE PRINCIPALE", ar: "القصة الرئيسية" },
    title: {
      en: "Said Presenting Tajine (Main Story)",
      fr: "Saïd présentant le tajine (Histoire)",
      ar: "سعيد يقدم الطاجين (القصة الرئيسية)",
    },
    section: {
      en: "About Said & Family Section (large right image)",
      fr: "Section Histoire & Famille (grande image à droite)",
      ar: "قسم التعريف بسعيد وعائلته (الصورة الكبيرة على اليمين)",
    },
    description: {
      en: "The large portrait photo beside 'More than a meal' and 'Our table'.",
      fr: "La grande photo portrait à côté de 'Plus qu'un repas'.",
      ar: "الصورة الطولية الكبيرة بجانب نص التعريف بالتجربة.",
    },
  },
  {
    key: "hosts",
    sourceFile: "10.png",
    fallbackFile: "10.jpeg",
    fallbackUrl: "/10.png",
    badge: { en: "CARD 1", fr: "CARTE 1", ar: "البطاقة 1" },
    title: {
      en: "Meet Your Hosts",
      fr: "Rencontrez vos hôtes",
      ar: "تعرف على مضيفيك",
    },
    section: {
      en: "What to Expect — Card 1",
      fr: "À quoi vous attendre — Carte 1",
      ar: "ماذا ينتظرك — البطاقة الأولى",
    },
    description: {
      en: "Photo showing the warm family hosts welcoming travelers.",
      fr: "Photo de la famille accueillant les voyageurs.",
      ar: "صورة العائلة الدافئة ترحب بالضيوف.",
    },
  },
  {
    key: "tea",
    sourceFile: "7.jpeg",
    fallbackFile: "7.jpeg",
    fallbackUrl: "/7.jpeg",
    badge: { en: "CARD 2", fr: "CARTE 2", ar: "البطاقة 2" },
    title: {
      en: "Traditional Welcome & Mint Tea",
      fr: "Accueil traditionnel & Thé à la menthe",
      ar: "الاستقبال التقليدي والشاي المغربي",
    },
    section: {
      en: "What to Expect — Card 2",
      fr: "À quoi vous attendre — Carte 2",
      ar: "ماذا ينتظرك — البطاقة الثانية",
    },
    description: {
      en: "Photo of pouring Moroccan mint tea and traditional hand-washing.",
      fr: "Photo du thé à la menthe marocain et lave-mains traditionnel.",
      ar: "صورة صب الشاي المغربي بالنعناع وطقوس الضيافة.",
    },
  },
  {
    key: "recipes",
    sourceFile: "4.png",
    fallbackFile: "4.jpeg",
    fallbackUrl: "/4.png",
    badge: { en: "CARD 3 & RESERVATION", fr: "CARTE 3 & RÉSERVATION", ar: "البطاقة 3 والحجز" },
    title: {
      en: "Taste Family Recipes & Booking Arch",
      fr: "Savourez des recettes familiales (Tajine) & Arche",
      ar: "تذوق وصفات عائلية (الطاجين) وصورة الحجز",
    },
    section: {
      en: "What to Expect — Card 3 AND Reservation Section",
      fr: "Carte 3 de l'expérience ET section de réservation",
      ar: "البطاقة الثالثة وبانر قسم الحجز المقوس",
    },
    description: {
      en: "The delicious homemade Moroccan tajine dish photo.",
      fr: "La délicieuse photo de tajine marocain fait maison.",
      ar: "صورة طاجين مغربي منزلي شهي.",
    },
  },
  {
    key: "caftans",
    sourceFile: "2.jpeg",
    fallbackFile: "2.jpeg",
    fallbackUrl: "/2.jpeg",
    badge: { en: "CARD 4", fr: "CARTE 4", ar: "البطاقة 4" },
    title: {
      en: "Wear Traditional Moroccan Clothes",
      fr: "Portez les caftans traditionnels",
      ar: "ارتداء القفطان والزي التقليدي",
    },
    section: {
      en: "What to Expect — Card 4",
      fr: "À quoi vous attendre — Carte 4",
      ar: "ماذا ينتظرك — البطاقة الرابعة",
    },
    description: {
      en: "Photo of guests trying on authentic Moroccan caftans.",
      fr: "Photo d'invités essayant des caftans marocains brodés.",
      ar: "صورة الضيوف يرتدون القفاطين المغربية الأصيلة.",
    },
  },
  {
    key: "dinner",
    sourceFile: "8.jpeg",
    fallbackFile: "8.jpeg",
    fallbackUrl: "/8.jpeg",
    badge: { en: "CARD 5", fr: "CARTE 5", ar: "البطاقة 5" },
    title: {
      en: "Shared Family Dinner Table",
      fr: "Repas partagé en famille",
      ar: "عشاء عائلي مشترك حول المائدة",
    },
    section: {
      en: "What to Expect — Card 5",
      fr: "À quoi vous attendre — Carte 5",
      ar: "ماذا ينتظرك — البطاقة الخامسة",
    },
    description: {
      en: "Photo of guests and family sharing dinner together.",
      fr: "Photo des convives partageant le dîner autour de la table.",
      ar: "صورة تجمع الضيوف والعائلة حول مائدة الطعام.",
    },
  },
  {
    key: "traditions",
    sourceFile: "11.png",
    fallbackFile: "11.jpeg",
    fallbackUrl: "/11.png",
    badge: { en: "CARD 6", fr: "CARTE 6", ar: "البطاقة 6" },
    title: {
      en: "Discover Local Traditions",
      fr: "Découvrez les traditions locales",
      ar: "اكتشف التقاليد المحلية الأصيلة",
    },
    section: {
      en: "What to Expect — Card 6",
      fr: "À quoi vous attendre — Carte 6",
      ar: "ماذا ينتظرك — البطاقة السادسة",
    },
    description: {
      en: "Photo illustrating Moroccan riad hospitality and traditions.",
      fr: "Photo illustrant l'hospitalité et les coutumes marocaines.",
      ar: "صورة تجسد كرم الضيافة والتقاليد العريقة.",
    },
  },
  {
    key: "riad",
    sourceFile: "14.png",
    fallbackFile: "14.png",
    fallbackUrl: "/14.png",
    badge: { en: "CARD 7", fr: "CARTE 7", ar: "البطاقة 7" },
    title: {
      en: "Authentic Riad Setting",
      fr: "Cadre authentique du riad",
      ar: "أجواء الرياض التقليدي بالمدينة",
    },
    section: {
      en: "What to Expect — Card 7",
      fr: "À quoi vous attendre — Carte 7",
      ar: "ماذا ينتظرك — البطاقة السابعة",
    },
    description: {
      en: "Photo of the tranquil Medina courtyard with zellige tiles.",
      fr: "Photo du patio de la médina orné de zelliges.",
      ar: "صورة فناء الرياض التقليدي وزليج المدينة الهادئ.",
    },
  },
];

async function encodePhotoToWebp(file: File): Promise<{ width: number; blob: Blob }[]> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const widths = [
      ...new Set(
        [320, 640, 960, 1600].filter((width) => width <= bitmap.width).concat(bitmap.width),
      ),
    ].sort((a, b) => a - b);
    const results = await Promise.all(
      widths.map(
        (width) =>
          new Promise<{ width: number; blob: Blob }>((resolve, reject) => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = Math.round((bitmap.height * width) / bitmap.width);
            const context = canvas.getContext("2d");
            if (!context) {
              reject(new Error("Unable to create canvas context"));
              return;
            }
            context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(
              (blob) =>
                blob ? resolve({ width, blob }) : reject(new Error("Unable to encode photo")),
              "image/webp",
              0.88,
            );
          }),
      ),
    );
    bitmap.close();
    return results;
  } catch (err) {
    console.warn("createImageBitmap failed, falling back to direct file:", err);
    return [{ width: 1200, blob: file }];
  }
}

export function WebsitePhotoManager({
  adminLang = "en",
  photos,
  onRefresh,
  onError,
}: {
  adminLang?: AdminLang;
  photos: GuestPhoto[];
  onRefresh: () => Promise<void>;
  onError: (msg: string) => void;
}) {
  const [uploadingSlotKey, setUploadingSlotKey] = useState<string | null>(null);
  const [successSlotKey, setSuccessSlotKey] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetSlot, setTargetSlot] = useState<SitePhotoSlot | null>(null);

  // Fetch signed preview URLs for all photos that exist in Supabase storage
  useEffect(() => {
    let active = true;
    const pathsToSign: string[] = [];
    const pathToSourceMap = new Map<string, string>();

    for (const photo of photos) {
      if (photo.storage_path) {
        pathsToSign.push(photo.storage_path);
        if (photo.source_file) {
          pathToSourceMap.set(photo.storage_path, photo.source_file);
        }
      }
    }

    if (!pathsToSign.length) return;

    supabase.storage
      .from("guest-photos")
      .createSignedUrls(pathsToSign, 3600)
      .then(({ data, error }) => {
        if (!active || error || !data) return;
        const map: Record<string, string> = {};
        for (const item of data) {
          const signed = item.signedUrl || (item as unknown as { signedURL?: string }).signedURL;
          if (signed && item.path) {
            const sourceFile = pathToSourceMap.get(item.path);
            if (sourceFile) map[sourceFile] = signed;
            map[item.path] = signed;
          }
        }
        setSignedUrls((prev) => ({ ...prev, ...map }));
      })
      .catch((err) => {
        console.warn("Could not batch sign previews:", err);
      });

    return () => {
      active = false;
    };
  }, [photos]);

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !targetSlot) return;

    setUploadingSlotKey(targetSlot.key);
    setSuccessSlotKey(null);

    try {
      const uploadId = crypto.randomUUID();
      const encoded = await encodePhotoToWebp(file);
      const renditions: Rendition[] = [];

      for (const item of encoded) {
        const path = `uploads/site-photos/${targetSlot.sourceFile.replace(/\.[^.]+$/, "")}-${uploadId}-${item.width}.webp`;
        const { error: uploadErr } = await supabase.storage
          .from("guest-photos")
          .upload(path, item.blob, { contentType: "image/webp", upsert: true });

        if (uploadErr) {
          throw new Error(`Upload failed: ${uploadErr.message}`);
        }
        renditions.push({ width: item.width, path });
      }

      const largest = renditions.at(-1);
      if (!largest) throw new Error("No rendition created.");

      const renditionJson: Json[] = renditions.map(({ width, path }) => ({ width, path }));

      // Find if record exists for this source_file
      const existing = photos.find(
        (p) =>
          p.source_file === targetSlot.sourceFile ||
          (targetSlot.fallbackFile && p.source_file === targetSlot.fallbackFile),
      );

      const altPayload = {
        en: targetSlot.title.en,
        fr: targetSlot.title.fr,
        ar: targetSlot.title.ar,
      };

      if (existing) {
        const { error: updateErr } = await supabase
          .from("guest_photos")
          .update({
            storage_path: largest.path,
            renditions: renditionJson,
            alt: altPayload,
            guest_consent_confirmed: true,
          })
          .eq("id", existing.id);

        if (updateErr) throw new Error(`Could not update photo: ${updateErr.message}`);
      } else {
        const { error: insertErr } = await supabase.from("guest_photos").insert({
          source_file: targetSlot.sourceFile,
          storage_path: largest.path,
          renditions: renditionJson,
          alt: altPayload,
          sort_order: 0,
          guest_consent_confirmed: true,
        });

        if (insertErr) throw new Error(`Could not save photo: ${insertErr.message}`);
      }

      // Also update fallback file record if different (e.g. 5.jpeg when 5.png)
      if (targetSlot.fallbackFile && targetSlot.fallbackFile !== targetSlot.sourceFile) {
        const fallbackExisting = photos.find((p) => p.source_file === targetSlot.fallbackFile);
        if (fallbackExisting && fallbackExisting.id !== existing?.id) {
          await supabase
            .from("guest_photos")
            .update({
              storage_path: largest.path,
              renditions: renditionJson,
              guest_consent_confirmed: true,
            })
            .eq("id", fallbackExisting.id);
        }
      }

      setSuccessSlotKey(targetSlot.key);
      await onRefresh();
    } catch (err) {
      console.error("Photo change error:", err);
      onError(err instanceof Error ? err.message : "Failed to change photo.");
    } finally {
      setUploadingSlotKey(null);
      setTargetSlot(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function triggerUpload(slot: SitePhotoSlot) {
    setTargetSlot(slot);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  const i18n = {
    en: {
      title: "Modify Website Photos",
      desc: "Here are the photos displayed on your website. Click 'Change this photo' on any card to replace it with a new photo from your phone or computer. Changes appear live on the site immediately.",
      changeBtn: "Change this photo",
      uploading: "Uploading new photo…",
      updated: "✓ Photo updated on website!",
      location: "Location on site:",
    },
    fr: {
      title: "Modifier les photos du site",
      desc: "Voici les photos affichées sur votre site internet. Cliquez sur 'Remplacer cette photo' pour choisir une nouvelle image depuis votre téléphone ou ordinateur. Le changement apparaît immédiatement sur le site.",
      changeBtn: "Remplacer cette photo",
      uploading: "Envoi de la photo…",
      updated: "✓ Photo mise à jour sur le site !",
      location: "Emplacement sur le site :",
    },
    ar: {
      title: "تعديل صور الموقع",
      desc: "هذه هي الصور المعروضة حالياً على موقعك. اضغط على 'تغيير هذه الصورة' لاستبدال أي صورة بصورة جديدة من هاتفك أو حاسوبك. تظهر التغييرات على الفور في الموقع.",
      changeBtn: "تغيير هذه الصورة",
      uploading: "جارٍ رفع الصورة…",
      updated: "✓ تم تحديث الصورة على الموقع بنجاح!",
      location: "مكان الصورة في الموقع:",
    },
  }[adminLang];

  return (
    <div className="space-y-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/heic"
        className="hidden"
        onChange={handleFileSelected}
      />

      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-foreground">{i18n.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{i18n.desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {SITE_PHOTO_SLOTS.map((slot) => {
          const matchedPhoto =
            photos.find(
              (p) =>
                p.source_file === slot.sourceFile &&
                p.guest_consent_confirmed &&
                Boolean(p.storage_path),
            ) ??
            photos.find(
              (p) =>
                slot.fallbackFile &&
                p.source_file === slot.fallbackFile &&
                p.guest_consent_confirmed &&
                Boolean(p.storage_path),
            );

          const liveUrl =
            (matchedPhoto?.storage_path ? signedUrls[matchedPhoto.storage_path] : null) ||
            signedUrls[slot.sourceFile] ||
            slot.fallbackUrl;

          const isUploading = uploadingSlotKey === slot.key;
          const isSuccess = successSlotKey === slot.key;

          return (
            <article
              key={slot.key}
              className="rounded-2xl border border-stone-200 bg-card p-5 sm:p-6 shadow-xs flex flex-col justify-between transition hover:shadow-md"
            >
              <div>
                {/* Header Badge & Title */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-gold/15 text-primary border border-gold/30 mb-1.5">
                      {slot.badge[adminLang]}
                    </span>
                    <h3 className="text-lg font-bold text-foreground leading-snug">
                      {slot.title[adminLang]}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  <span className="font-semibold text-foreground/80">{i18n.location}</span>{" "}
                  {slot.section[adminLang]}
                </p>

                {/* Photo Preview Container */}
                <div
                  className={`relative w-full rounded-xl overflow-hidden border border-stone-200/80 bg-stone-100 mb-4 ${
                    slot.key === "story" ? "aspect-[16/10]" : "aspect-[16/10]"
                  }`}
                >
                  <img
                    src={liveUrl}
                    alt={slot.title[adminLang]}
                    className="w-full h-full object-cover transition duration-300"
                    loading="lazy"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <p className="text-sm font-semibold">{i18n.uploading}</p>
                    </div>
                  )}
                </div>

                {isSuccess && (
                  <div
                    role="status"
                    className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs font-bold text-emerald-800"
                  >
                    <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{i18n.updated}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  onClick={() => triggerUpload(slot)}
                  disabled={Boolean(uploadingSlotKey)}
                  className="w-full min-h-12 font-bold cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>{i18n.changeBtn}</span>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
