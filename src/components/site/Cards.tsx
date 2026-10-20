import { Link } from "@tanstack/react-router";
import { Check, Clock, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { PublishedExperience, PublishedFamily } from "@/lib/public-content.functions";

export function ExperienceRow({
  experience,
  currency,
  reverse,
}: {
  experience: PublishedExperience;
  currency: string | null;
  reverse?: boolean;
}) {
  const { t, lang } = useI18n();
  return (
    <article
      className={`grid items-center gap-8 md:grid-cols-2 md:gap-14 ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}
    >
      {experience.image_alt && (
        <img
          src={experience.image_url}
          alt={experience.image_alt[lang]}
          width={1200}
          height={1600}
          loading="lazy"
          className="arch aspect-[4/5] w-full object-cover"
        />
      )}
      <div>
        <h2 className="text-4xl text-foreground">{experience.title[lang]}</h2>
        <p className="mt-3 text-lg text-muted-foreground">{experience.blurb[lang]}</p>
        <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-y border-border py-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" aria-hidden />
            <dt className="sr-only">{t.exp.duration}</dt>
            <dd>{experience.duration[lang]}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-accent" aria-hidden />
            <dt>{t.exp.maxGuests}:</dt>
            <dd>{experience.max_guests}</dd>
          </div>
          {currency && (
            <div className="flex items-baseline gap-1.5">
              <dt className="sr-only">{t.booking.pricePerPerson}</dt>
              <dd className="font-display text-3xl text-primary">
                {new Intl.NumberFormat(lang, {
                  style: "currency",
                  currency,
                }).format(experience.price)}
              </dd>
              <span className="text-muted-foreground">{t.exp.perPerson}</span>
            </div>
          )}
        </dl>
        {experience.included.length > 0 && (
          <>
            <p className="eyebrow mt-6">{t.exp.included}</p>
            <ul className="mt-3 space-y-2">
              {experience.included.map((item, index) => (
                <li key={`${index}-${item.en}`} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" aria-hidden />
                  {item[lang]}
                </li>
              ))}
            </ul>
          </>
        )}
        <Link to="/booking" className="btn btn-primary mt-8">
          {t.exp.book}
        </Link>
      </div>
    </article>
  );
}

export function FamilyCard({ family }: { family: PublishedFamily }) {
  const { t, lang } = useI18n();
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card">
      {family.image_alt && (
        <img
          src={family.image_url}
          alt={family.image_alt[lang]}
          width={1200}
          height={1600}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
      )}
      <div className="p-6">
        <p className="eyebrow">{family.area[lang]}</p>
        <h2 className="mt-2 text-3xl">{family.name[lang]}</h2>
        {family.story[lang] && (
          <p className="mt-3 whitespace-pre-line text-muted-foreground">{family.story[lang]}</p>
        )}
        <dl className="mt-4 space-y-1.5 text-sm">
          {family.languages[lang] && (
            <div>
              <dt className="inline font-semibold">{t.families.languages}: </dt>
              <dd className="inline text-muted-foreground">{family.languages[lang]}</dd>
            </div>
          )}
          {family.signature_dish[lang] && (
            <div>
              <dt className="inline font-semibold">{t.families.dish}: </dt>
              <dd className="inline text-primary">{family.signature_dish[lang]}</dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  );
}
