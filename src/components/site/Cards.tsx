import { Link } from "@tanstack/react-router";
import { Clock, Users, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Experience, Family } from "@/lib/content";
import { PlaceholderTag } from "./Brand";

export function ExperienceRow({ e, reverse }: { e: Experience; reverse?: boolean }) {
  const { t, l } = useI18n();
  return (
    <article className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
      <div className="relative">
        <img src={e.image} alt={l(e.title)} loading="lazy" width={1200} height={900} className="arch aspect-[4/5] w-full object-cover" />
        <span className="absolute start-4 top-6"><PlaceholderTag /></span>
      </div>
      <div>
        <h3 className="text-4xl text-foreground">{l(e.title)}</h3>
        <p className="mt-3 text-lg text-muted-foreground">{l(e.blurb)}</p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-y border-border py-4 text-sm">
          <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-accent" aria-hidden /><dt className="sr-only">{t.exp.duration}</dt><dd>{l(e.duration)}</dd></div>
          <div className="flex items-center gap-2"><Users className="h-4 w-4 text-accent" aria-hidden /><dt>{t.exp.maxGuests}:</dt><dd>{e.maxGuests}</dd></div>
          <div className="flex items-baseline gap-1.5"><dt className="sr-only">Price</dt><dd className="font-display text-3xl text-primary">€{e.price}</dd><span className="text-muted-foreground">{t.exp.perPerson}</span> <PlaceholderTag /></div>
        </dl>
        <p className="eyebrow mt-6">{t.exp.included}</p>
        <ul className="mt-3 space-y-2">
          {e.included.map((i) => (
            <li key={i.en} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" aria-hidden />{l(i)}</li>
          ))}
        </ul>
        <Link to="/booking" search={{ experience: e.id }} className="btn btn-primary mt-8">{t.exp.book}</Link>
      </div>
    </article>
  );
}

export function FamilyCard({ f, compact }: { f: Family; compact?: boolean }) {
  const { t, l } = useI18n();
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative overflow-hidden">
        <img src={f.image} alt={l(f.name)} loading="lazy" width={1000} height={1200} className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${compact ? "aspect-[4/3]" : "aspect-[5/4]"}`} />
        <span className="absolute end-3 top-3"><PlaceholderTag /></span>
      </div>
      <div className="p-6">
        <p className="eyebrow">{l(f.area)}</p>
        <h3 className="mt-2 text-3xl">{l(f.name)}</h3>
        {!compact && <p className="mt-3 text-muted-foreground">{l(f.story)}</p>}
        <dl className="mt-4 space-y-1.5 text-sm">
          <div><dt className="inline font-semibold">{t.families.languages}: </dt><dd className="inline text-muted-foreground">{l(f.languages)}</dd></div>
          <div><dt className="inline font-semibold">{t.families.dish}: </dt><dd className="inline text-primary">{l(f.dish)}</dd></div>
        </dl>
      </div>
    </article>
  );
}
