import { BRAND_NAME } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

/** Header logo: full logo on desktop, mark only on small screens */
export function HeaderLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Small screens: M mark only */}
      <picture className="sm:hidden">
        <source srcSet="/brand/logo-mark.png" type="image/png" />
        <img
          src="/brand/logo-mark.png"
          alt={BRAND_NAME}
          width={44}
          height={44}
          className="h-11 w-11 object-contain"
        />
      </picture>

      {/* Desktop / tablet screens: full logo with wordmark & RIAD */}
      <picture className="hidden sm:block">
        <source
          srcSet="/brand/logo-full.webp 1x, /brand/logo-full@2x.webp 2x"
          type="image/webp"
        />
        <source
          srcSet="/brand/logo-full.png 1x, /brand/logo-full@2x.png 2x"
          type="image/png"
        />
        <img
          src="/brand/logo-full.png"
          alt={BRAND_NAME}
          width={105}
          height={66}
          className="h-14 w-auto object-contain"
        />
      </picture>
    </div>
  );
}

/** Footer logo: light-on-dark version of full logo */
export function FooterLogo({ className = "" }: { className?: string }) {
  return (
    <picture className={className}>
      <source
        srcSet="/brand/logo-full-light.webp 1x, /brand/logo-full-light.webp 2x"
        type="image/webp"
      />
      <source
        srcSet="/brand/logo-full-light.png 1x, /brand/logo-full-light@2x.png 2x"
        type="image/png"
      />
      <img
        src="/brand/logo-full-light.png"
        alt={BRAND_NAME}
        width={180}
        height={113}
        className="h-24 w-auto object-contain"
      />
    </picture>
  );
}

/** Standalone M mark */
export function LogoMark({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <img
      src="/brand/logo-mark.png"
      alt={BRAND_NAME}
      width={44}
      height={44}
      className={`${className} object-contain`}
    />
  );
}

/** Generic Logo export for backwards compatibility */
export const Logo = HeaderLogo;

export function StarDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-gold/60 sm:w-28" />
      <svg viewBox="-12 -12 24 24" className="h-5 w-5 fill-none stroke-gold" strokeWidth="1.5">
        <rect x="-7" y="-7" width="14" height="14" />
        <rect x="-7" y="-7" width="14" height="14" transform="rotate(45)" />
      </svg>
      <span className="h-px w-16 bg-gold/60 sm:w-28" />
    </div>
  );
}

export function PlaceholderTag() {
  const { t } = useI18n();
  return <span className="placeholder-tag">{t.placeholder}</span>;
}

export function SectionHead({ eyebrow, title, sub, center = false, id }: { eyebrow: string; title: string; sub?: string; center?: boolean; id?: string }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-4xl text-foreground sm:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-lg text-muted-foreground">{sub}</p>}
    </div>
  );
}
