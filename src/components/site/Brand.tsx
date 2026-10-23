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
    <div className={`flex items-center shrink-0 ${className}`}>
      <picture>
        <source
          srcSet="/brand/logo-full-light-180.webp 1x, /brand/logo-full-light-320.webp 2x"
          type="image/webp"
        />
        <img
          src="/brand/logo-full-light-180.png"
          srcSet="/brand/logo-full-light-180.png 1x, /brand/logo-full-light-320.png 2x"
          alt={BRAND_NAME}
          width={120}
          height={75}
          className="h-10 sm:h-12 w-auto object-contain"
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

/** Global SVG clip path definition for zellige-cut mask */
export function ZelligeClipDefs() {
  return (
    <svg width="0" height="0" className="sr-only" aria-hidden="true">
      <defs>
        <clipPath id="zellige-cut" clipPathUnits="objectBoundingBox">
          <polygon points="0.5 0, 0.6464 0.1464, 0.8536 0.1464, 0.8536 0.3536, 1 0.5, 0.8536 0.6464, 0.8536 0.8536, 0.6464 0.8536, 0.5 1, 0.3536 0.8536, 0.1464 0.8536, 0.1464 0.6464, 0 0.5, 0.1464 0.3536, 0.1464 0.1464, 0.3536 0.1464" />
        </clipPath>
      </defs>
    </svg>
  );
}

/** 8-pointed Moroccan star SVG matching exact zellige-cut geometry */
export function ZelligeStarSvg({
  className = "h-3.5 w-3.5",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <polygon points="12,0 15.51,3.51 20.49,3.51 20.49,8.49 24,12 20.49,15.51 20.49,20.49 15.51,20.49 12,24 8.49,20.49 3.51,20.49 3.51,15.51 0,12 3.51,8.49 3.51,3.51 8.49,3.51" />
    </svg>
  );
}

export function StarDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-gold/60 sm:w-28" />
      <ZelligeStarSvg className="h-4 w-4 text-gold" />
      <span className="h-px w-16 bg-gold/60 sm:w-28" />
    </div>
  );
}

/**
 * Decorative divider between sections using signature zellige-cut 8-pointed star
 * and thin hairlines.
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
  const goldColor = light ? "rgba(201, 162, 75, 0.7)" : "var(--gold)";
  const starColor = light ? "#FFFFFF" : "var(--gold)";
  return (
    <div
      className={`flex items-center gap-3.5 ${center ? "mx-auto justify-center" : ""} ${className}`}
      aria-hidden="true"
      style={{ width: "fit-content" }}
    >
      <span
        style={{
          display: "block",
          width: "3rem",
          height: "1px",
          background: goldColor,
        }}
      />
      <ZelligeStarSvg className="h-3 w-3 shrink-0" color={starColor} />
      <span
        style={{
          display: "block",
          width: "3rem",
          height: "1px",
          background: goldColor,
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

/** Large gold line-art zellige star ornament (seen in concept section and closing band) */
export function ZelligeLineArtStar({
  className = "w-32 h-32",
  stroke = "var(--gold)",
  opacity = 0.5,
}: {
  className?: string;
  stroke?: string;
  opacity?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke={stroke}
      strokeWidth="1.2"
      style={{ opacity }}
      aria-hidden="true"
    >
      <polygon points="50,5 63,22 85,15 78,37 95,50 78,63 85,85 63,78 50,95 37,78 15,85 22,63 5,50 22,37 15,15 37,22" />
      <rect x="25" y="25" width="50" height="50" transform="rotate(0 50 50)" />
      <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)" />
      <polygon points="50,32 68,50 50,68 32,50" />
      <circle cx="50" cy="50" r="6" />
    </svg>
  );
}

/** Delicate olive branch leaf illustration for hero note card */
export function OliveBranchSvg({ className = "w-8 h-8 text-accent" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 40C14 34 26 22 40 8" />
      <path
        d="M22 26C20 20 24 16 30 18C30 24 26 28 22 26Z"
        fill="currentColor"
        fillOpacity="0.15"
      />
      <path d="M30 18C28 12 32 8 38 10C38 16 34 20 30 18Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M14 34C12 28 16 24 22 26" />
      <circle cx="27" cy="22" r="2" fill="currentColor" />
      <circle cx="35" cy="14" r="2" fill="currentColor" />
    </svg>
  );
}

/** Line icon: Local families */
export function IconLocalFamilies({ className = "w-6 h-6 text-gold" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/** Line icon: Home-cooked dishes */
export function IconHomeCooked({ className = "w-6 h-6 text-gold" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4 15c0 3.3 2.7 6 6 6h4c3.3 0 6-2.7 6-6V13H4v2z" />
      <path d="M12 3v2" />
      <path d="M8 5c1 1.5 1 2.5 0 4" />
      <path d="M16 5c1 1.5 1 2.5 0 4" />
      <path d="M4 13h16" />
    </svg>
  );
}

/** Line icon: Small groups */
export function IconSmallGroups({ className = "w-6 h-6 text-gold" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="7" r="3" />
      <circle cx="5" cy="9" r="2.5" />
      <circle cx="19" cy="9" r="2.5" />
      <path d="M8.5 20a4 4 0 0 1 7 0" />
      <path d="M2 20a3.5 3.5 0 0 1 5-2.5" />
      <path d="M22 20a3.5 3.5 0 0 0-5-2.5" />
    </svg>
  );
}

/** Step 1 thin line icon: Calendar */
export function IconStepCalendar({ className = "w-7 h-7 text-gold" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="8" cy="14" r="1" fill="currentColor" />
      <circle cx="12" cy="14" r="1" fill="currentColor" />
      <circle cx="16" cy="14" r="1" fill="currentColor" />
      <circle cx="8" cy="18" r="1" fill="currentColor" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

/** Step 2 thin line icon: Hosts confirming */
export function IconStepConfirm({ className = "w-7 h-7 text-gold" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

/** Step 3 thin line icon: Cloche / Dining */
export function IconStepEnjoy({ className = "w-7 h-7 text-gold" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 4v3" />
      <path d="M4 18h16" />
      <path d="M4 18a8 8 0 0 1 16 0" />
      <circle cx="12" cy="4" r="1.5" />
    </svg>
  );
}
