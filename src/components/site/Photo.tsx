import { useI18n } from "@/lib/i18n";
import type { SitePhoto } from "@/lib/photos";

type PhotoProps = {
  photo: SitePhoto;
  alt?: string;
  className?: string;
  sizes: string;
  loading?: "eager" | "lazy";
  priority?: boolean;
};

export function Photo({
  photo,
  alt,
  className,
  sizes,
  loading = "lazy",
  priority = false,
}: PhotoProps) {
  const { l } = useI18n();
  const srcSet = (extension: "webp" | "jpg") =>
    photo.widths.map((width) => `/images/${photo.id}-${width}.${extension} ${width}w`).join(", ");

  return (
    <picture>
      <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
      <img
        src={`/images/${photo.id}-${Math.min(800, photo.width)}.jpg`}
        srcSet={srcSet("jpg")}
        sizes={sizes}
        alt={alt ?? l(photo.alt)}
        width={photo.width}
        height={photo.height}
        loading={priority ? "eager" : loading}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={className}
        style={{ objectPosition: photo.position }}
      />
    </picture>
  );
}
