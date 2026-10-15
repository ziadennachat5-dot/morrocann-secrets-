import { useI18n } from "@/lib/i18n";

/** PLACEHOLDER LOGO — replace with the uploaded brand logo file. */
export function Logo({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Moroccan Secrets logo">
      <path d="M14 58V26a18 18 0 0 1 36 0v32" fill="none" className="stroke-accent" strokeWidth="3" />
      <path d="M20 50V28l12 14 12-14v22" fill="none" className="stroke-primary" strokeWidth="4.5" strokeLinejoin="round" />
      <g transform="translate(32 15)" className="fill-gold">
        <rect x="-4" y="-4" width="8" height="8" />
        <rect x="-4" y="-4" width="8" height="8" transform="rotate(45)" />
      </g>
    </svg>
  );
}

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

export function SectionHead({ eyebrow, title, sub, center = false }: { eyebrow: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-4xl text-foreground sm:text-5xl">{title}</h2>
      {sub && <p className="mt-4 text-lg text-muted-foreground">{sub}</p>}
    </div>
  );
}
