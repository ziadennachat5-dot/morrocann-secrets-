import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const localizedAltSchema = z.object({
  en: z.string(),
  fr: z.string(),
  ar: z.string(),
});

const guestPhotoSchema = z.object({
  id: z.string().uuid(),
  source_file: z.string().nullable().optional(),
  storage_path: z.string().min(1),
  renditions: z.array(z.object({ width: z.number().int().positive(), path: z.string().min(1) })),
  alt: localizedAltSchema,
  sort_order: z.number().int().nonnegative(),
  guest_consent_confirmed: z.boolean(),
});

export type GuestPhoto = z.infer<typeof guestPhotoSchema>;

export function filterPhotosWithConsent<T extends { guest_consent_confirmed: boolean }>(
  photos: T[],
): T[] {
  return photos.filter((photo) => photo.guest_consent_confirmed);
}

export function selectHeroAndGalleryPhotos<
  T extends {
    id: string;
    source_file?: string | null | undefined;
    guest_consent_confirmed: boolean;
    url: string;
    srcSet?: string | undefined;
    alt: { en: string; fr: string; ar: string };
  },
>(
  publicPhotos: T[],
  fallbackUrl: string,
): {
  heroGuestPhoto: T | undefined;
  heroImageUrl: string;
  heroImageSrcSet: string | undefined;
  isGuestHero: boolean;
  galleryPhotos: T[];
} {
  const heroGuestPhoto = publicPhotos.find(
    (photo) => photo.source_file === "6.jpeg" && photo.guest_consent_confirmed,
  );

  const heroImageUrl = heroGuestPhoto ? heroGuestPhoto.url : fallbackUrl;
  const heroImageSrcSet = heroGuestPhoto?.srcSet;
  const isGuestHero = Boolean(heroGuestPhoto);
  const galleryPhotos = heroGuestPhoto
    ? publicPhotos.filter((photo) => photo.id !== heroGuestPhoto.id)
    : publicPhotos;

  return {
    heroGuestPhoto,
    heroImageUrl,
    heroImageSrcSet,
    isGuestHero,
    galleryPhotos,
  };
}

export const getPublicGuestPhotos = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin
    .from("guest_photos")
    .select("id,source_file,storage_path,renditions,alt,sort_order,guest_consent_confirmed")
    .eq("guest_consent_confirmed", true)
    .order("sort_order", { ascending: true });
  if (result.error && ["42P01", "PGRST205"].includes(result.error.code ?? "")) {
    console.error("Guest photo migration is not applied; the public gallery is unavailable.");
    return { photos: [], unavailable: true };
  }
  if (result.error) throw new Error("Unable to load guest photos.");
  const photos = filterPhotosWithConsent(z.array(guestPhotoSchema).parse(result.data));
  const photosWithUrls = await Promise.all(
    photos.map(async (photo) => {
      const paths = photo.renditions.length
        ? photo.renditions
        : [{ width: 0, path: photo.storage_path }];
      const urls = await Promise.all(
        paths.map(async ({ width, path }) => {
          const { data, error } = await supabaseAdmin.storage
            .from("guest-photos")
            .createSignedUrl(path, 300);
          if (error || !data?.signedUrl) throw new Error("Unable to create a guest photo URL.");
          return { width, url: data.signedUrl };
        }),
      );
      return {
        ...photo,
        url: urls.at(-1)?.url ?? "",
        srcSet: urls
          .filter(({ width }) => width > 0)
          .map(({ width, url }) => `${url} ${width}w`)
          .join(", "),
      };
    }),
  );
  return { photos: photosWithUrls, unavailable: false };
});

export const syncRootGuestPhotos = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { readdir } = await import("node:fs/promises");
  const path = await import("node:path");
  const sharp = (await import("sharp")).default;

  const root = process.cwd();
  const allFiles = await readdir(root);
  const ignoredFiles = new Set([
    "RIAD.png",
    "apple-touch-icon.png",
    "favicon.ico",
    "favicon-32x32.png",
    "og-image.png",
  ]);
  const sources = allFiles
    .filter((filename) => /\.(jpe?g|png|webp)$/i.test(filename) && !ignoredFiles.has(filename))
    .sort((left, right) => {
      const leftNum = Number.parseInt(left, 10);
      const rightNum = Number.parseInt(right, 10);
      if (!Number.isNaN(leftNum) && !Number.isNaN(rightNum)) return leftNum - rightNum;
      return left.localeCompare(right);
    });

  let addedCount = 0;
  for (const sourceFile of sources) {
    const existing = await supabaseAdmin
      .from("guest_photos")
      .select("id")
      .eq("source_file", sourceFile)
      .maybeSingle();

    if (existing.data) continue;

    const inputPath = path.join(root, sourceFile);
    const metadata = await sharp(inputPath).metadata();
    if (!metadata.width) continue;

    const orientationSwapsAxes = [5, 6, 7, 8].includes(metadata.orientation ?? 0);
    const sourceWidth = orientationSwapsAxes ? metadata.height : metadata.width;
    if (!sourceWidth) continue;

    const widths = [
      ...new Set([320, 640, 960, 1200, 1600].filter((width) => width <= sourceWidth)),
    ];
    widths.push(sourceWidth);

    const safeBaseName = path.parse(sourceFile).name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const fileKey = `seed/${safeBaseName}`;
    const renditions: { width: number; path: string }[] = [];

    for (const width of [...new Set(widths)].sort((a, b) => a - b)) {
      const optimized = await sharp(inputPath)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toBuffer();
      const actualWidth = (await sharp(optimized).metadata()).width;
      if (!actualWidth) continue;

      const objectPath = `${fileKey}/${actualWidth}.webp`;
      const upload = await supabaseAdmin.storage
        .from("guest-photos")
        .upload(objectPath, optimized, { contentType: "image/webp", upsert: true });

      if (upload.error) continue;
      renditions.push({ width: actualWidth, path: objectPath });
    }

    const largest = renditions.at(-1);
    if (!largest) continue;

    const num = Number.parseInt(sourceFile, 10);
    const sortOrder = !Number.isNaN(num) ? num - 1 : 100 + addedCount;
    const insert = await supabaseAdmin.from("guest_photos").insert({
      source_file: sourceFile,
      storage_path: largest.path,
      renditions: renditions.map(({ width, path: itemPath }) => ({ width, path: itemPath })),
      alt: {
        en: `Moroccan dining photo (${path.parse(sourceFile).name})`,
        fr: `Photo de repas marocain (${path.parse(sourceFile).name})`,
        ar: `صورة عشاء مغربي (${path.parse(sourceFile).name})`,
      },
      sort_order: sortOrder,
      guest_consent_confirmed: false,
    });

    if (!insert.error) {
      addedCount += 1;
    }
  }

  return { addedCount, totalSources: sources.length };
});
