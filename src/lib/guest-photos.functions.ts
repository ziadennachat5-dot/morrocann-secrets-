import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const localizedAltSchema = z.object({
  en: z.string(),
  fr: z.string(),
  ar: z.string(),
});

const guestPhotoSchema = z.object({
  id: z.string().uuid(),
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

export const getPublicGuestPhotos = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin
    .from("guest_photos")
    .select("id,storage_path,renditions,alt,sort_order,guest_consent_confirmed")
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
