import { BRAND_NAME } from "@/lib/brand";
import { useI18n } from "@/lib/i18n";

/** Header logo: full logo clearly displayed without cutoff */
export function HeaderLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center shrink-0 ${className}`}>
      <picture>
        <source
          srcSet="/brand/logo-full-120.webp 1x, /brand/logo-full-240.webp 2x"
          type="image/webp"
        />
        <img
          src="/brand/logo-full-120.png"
          srcSet="/brand/logo-full-120.png 1x, /brand/logo-full-240.png 2x"
          alt={BRAND_NAME}
          width={120}
          height={75}
          className="h-10 sm:h-12 w-auto object-contain"
        />
      </picture>
    </div>
  );
}

/** Light (inverted) header logo for dark backgrounds (hero state) */
export function HeaderLogoLight({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Small: light mark */}
      <picture className="sm:hidden">
        <source
          srcSet="/brand/logo-mark-88.webp 1x, /brand/logo-mark-176.webp 2x"
          type="image/webp"
        />
        <img
          src="/brand/logo-mark-88.png"
          srcSet="/brand/logo-mark-88.png 1x, /brand/logo-mark-176.png 2x"
          alt={BRAND_NAME}
          width={44}
          height={44}
          className="h-11 w-11 object-contain brightness-0 invert"
        />
      </picture>
      {/* Desktop: light full logo */}
      <picture className="hidden sm:block">
        <source
          srcSet="/brand/logo-full-light-180.webp 1x, /brand/logo-full-light-320.webp 2x"
          type="image/webp"
        />
        <img
          src="/brand/logo-full-light-180.png"
          srcSet="/brand/logo-full-light-180.png 1x, /brand/logo-full-light-320.png 2x"
          alt={BRAND_NAME}
          width={180}
          height={113}
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
        srcSet="/brand/logo-full-light-180.webp 1x, /brand/logo-full-light-320.webp 2x"
        type="image/webp"
      />
      <img
        src="/brand/logo-full-light-180.png"
        srcSet="/brand/logo-full-light-180.png 1x, /brand/logo-full-light-320.png 2x"
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
    <picture>
      <source
        srcSet="/brand/logo-mark-88.webp 1x, /brand/logo-mark-176.webp 2x"
        type="image/webp"
      />
      <img
        src="/brand/logo-mark-88.png"
        srcSet="/brand/logo-mark-88.png 1x, /brand/logo-mark-176.png 2x"
        alt={BRAND_NAME}
        width={44}
        height={44}
        className={`${className} object-contain`}
      />
    </picture>
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

/**
 * Thin gold hairline with a small red diamond in the centre.
 * Use directly under section H2 titles.
 * center=true → uses mx-auto to centre the whole ornament.
 */
export function OrnamentDivider({
  center = false,
  light = false,
  className = "",
}: {
  center?: boolean;
  light?: boolean;
  className?: string;
}) {
  const goldColor = light ? "rgba(201,162,75,0.7)" : "var(--gold)";
  const diamondColor = light ? "#fff" : "var(--primary)";
  return (
    <div
      className={`flex items-center gap-0 ${center ? "mx-auto" : ""} ${className}`}
      aria-hidden="true"
      style={{ width: "fit-content" }}
    >
      <span
        style={{
          display: "block",
          width: "3rem",
          height: "1.5px",
          background: goldColor,
          borderRadius: "9999px",
        }}
      />
      <span
        style={{
          display: "block",
          width: "8px",
          height: "8px",
          background: diamondColor,
          borderRadius: "1px",
          transform: "rotate(45deg)",
          margin: "0 6px",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          display: "block",
          width: "3rem",
          height: "1.5px",
          background: goldColor,
          borderRadius: "9999px",
        }}
      />
    </div>
  );
}

export function PlaceholderTag() {
  const { t } = useI18n();
  return <span className="placeholder-tag">{t.placeholder}</span>;
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  center = false,
  id,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  center?: boolean;
  id?: string;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-4xl text-foreground sm:text-5xl">
        {title}
      </h2>
      {sub && <p className="mt-4 text-lg text-muted-foreground">{sub}</p>}
    </div>
  );
}
