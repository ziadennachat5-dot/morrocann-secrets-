import { BRAND_NAME } from "./brand";
import { dict, type Dict } from "./translations";
import type { Lang } from "./i18n";

const DEFAULT_SITE_URL = "https://moroccansecrets.com";

export function getSiteUrl(): string {
  const envUrl =
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SITE_URL"]) ||
    (typeof process !== "undefined" && process.env?.["VITE_SITE_URL"]) ||
    DEFAULT_SITE_URL;
  return envUrl.replace(/\/+$/, "");
}

export function getLocalizedPath(pathname: string, targetLang: Lang): string {
  const clean = pathname.replace(/^\/(?:fr|ar|en)(?=\/|$)/, "") || "/";
  if (targetLang === "en") {
    return clean;
  }
  return clean === "/" ? `/${targetLang}` : `/${targetLang}${clean}`;
}

const seoKeyByPath: Record<string, keyof typeof dict.en.seo> = {
  "/": "home",
  "/experiences": "experiences",
  "/families": "families",
  "/booking": "booking",
  "/faq": "faq",
  "/blog": "blog",
  "/private-events": "privateEvents",
  "/gift": "gift",
  "/partners": "partners",
  "/privacy": "privacy",
  "/terms": "terms",
  "/cancellation-policy": "cancellationPolicy",
};

const openGraphImages: Record<string, { path: string; alt: Record<Lang, string> }> = {
  "/": {
    path: "/og-image.png",
    alt: {
      en: "Moroccan dinner table in a Marrakech family home.",
      fr: "Table de dîner marocain dans une maison familiale à Marrakech.",
      ar: "مائدة عشاء مغربي في بيت عائلي بمراكش.",
    },
  },
  "/experiences": {
    path: "/images/moroccan-dishes-on-shared-table-1200.webp",
    alt: {
      en: "Moroccan tagine and salads served at a family dinner table.",
      fr: "Tajine et salades marocaines sur une table de dîner familial.",
      ar: "طواجن وسلطات مغربية على مائدة عشاء عائلي.",
    },
  },
  "/families": {
    path: "/images/family-sharing-tagine-1200.webp",
    alt: {
      en: "Guests sharing a traditional tagine meal with a local family.",
      fr: "Invités partageant un tajine traditionnel avec une famille locale.",
      ar: "ضيوف يتشاركون طاجيناً تقليدياً مع عائلة محلية.",
    },
  },
  "/booking": {
    path: "/images/couple-sharing-tagine-960.webp",
    alt: {
      en: "Guests enjoying an authentic Moroccan home dinner in Marrakech.",
      fr: "Invités savourant un dîner marocain chez l'habitant à Marrakech.",
      ar: "ضيوف يستمتعون بعشاء مغربي منزلي أصيل في مراكش.",
    },
  },
  "/blog": {
    path: "/images/couscous-with-group-of-guests-1200.webp",
    alt: {
      en: "Guests gathered around a traditional Moroccan couscous meal.",
      fr: "Invités réunis autour d'un couscous marocain traditionnel.",
      ar: "ضيوف مجتمعون حول مائدة كسكس مغربي تقليدي.",
    },
  },
  "/faq": {
    path: "/images/four-guests-around-dinner-960.webp",
    alt: {
      en: "Four guests sharing a home-cooked dinner in Marrakech.",
      fr: "Quatre invités partageant un dîner fait maison à Marrakech.",
      ar: "أربعة ضيوف يتشاركون عشاءً منزلياً في مراكش.",
    },
  },
  "/private-events": {
    path: "/images/large-riad-dinner-gathering-1200.webp",
    alt: {
      en: "Private family dinner gathering in Marrakech Medina.",
      fr: "Dîner privé chez l'habitant dans la médina de Marrakech.",
      ar: "عشاء عائلي خاص في المدينة القديمة بمراكش.",
    },
  },
  "/gift": {
    path: "/images/guests-sharing-tagine-1200.webp",
    alt: {
      en: "Gift voucher for a Moroccan home dinner experience.",
      fr: "Bon cadeau pour un dîner chez l'habitant à Marrakech.",
      ar: "قسيمة هدية لتجربة عشاء منزلي في مراكش.",
    },
  },
  "/partners": {
    path: "/images/low-light-group-dinner-1200.webp",
    alt: {
      en: "Warm evening gathering for a Moroccan family dinner.",
      fr: "Soirée chaleureuse autour d'un dîner en famille marocaine.",
      ar: "أمسية دافئة حول عشاء مع عائلة مغربية.",
    },
  },
  "/privacy": {
    path: "/brand/logo-full.png",
    alt: {
      en: "Moroccan Secrets logo.",
      fr: "Logo Moroccan Secrets.",
      ar: "شعار أسرار مغربية.",
    },
  },
  "/terms": {
    path: "/brand/logo-full.png",
    alt: {
      en: "Moroccan Secrets logo.",
      fr: "Logo Moroccan Secrets.",
      ar: "شعار أسرار مغربية.",
    },
  },
  "/cancellation-policy": {
    path: "/brand/logo-full.png",
    alt: {
      en: "Moroccan Secrets logo.",
      fr: "Logo Moroccan Secrets.",
      ar: "شعار أسرار مغربية.",
    },
  },
};

export function localizedSeo(
  path: string,
  language: Lang,
  translations: Dict = dict[language],
): { title: string; description: string } | null {
  const normalizedPath = path.startsWith("/blog/") ? "/blog" : path;
  const cleanPath = normalizedPath.replace(/^\/(?:fr|ar|en)(?=\/|$)/, "") || "/";
  const key = seoKeyByPath[cleanPath];
  return key ? translations.seo[key] : null;
}

export interface SeoOptions {
  experiences?: Array<{
    title: { en: string; fr?: string; ar?: string };
    blurb: { en: string; fr?: string; ar?: string };
    price: number;
  }>;
  faqs?: Array<{
    question: { en: string; fr?: string; ar?: string };
    answer: { en: string; fr?: string; ar?: string };
  }>;
  article?: {
    publishedAt?: string | null;
    createdAt?: string;
  };
}

export function formatMetaTitle(title: string): string {
  const brandSuffix = ` | ${BRAND_NAME}`;
  let cleanTitle = title.replace(/\s*[—|]\s*Moroccan Secrets(?:\s+Riad)?/i, "").trim();
  const maxTitleLen = 60 - brandSuffix.length;
  if (cleanTitle.length > maxTitleLen) {
    cleanTitle = cleanTitle.slice(0, maxTitleLen - 1).trim();
  }
  return `${cleanTitle}${brandSuffix}`;
}

export function pageHead(
  path: string,
  arg2?: Lang | string,
  arg3?: string | SeoOptions,
  arg4?: string | SeoOptions,
  arg5?: SeoOptions,
) {
  let lang: Lang = "en";
  let customTitle: string | undefined;
  let customDescription: string | undefined;
  let options: SeoOptions | undefined;

  if (arg2 === "en" || arg2 === "fr" || arg2 === "ar") {
    lang = arg2;
    if (typeof arg3 === "string") {
      customTitle = arg3;
      if (typeof arg4 === "string") {
        customDescription = arg4;
        options = arg5;
      } else if (typeof arg4 === "object" && arg4 !== null) {
        options = arg4;
      }
    } else if (typeof arg3 === "object" && arg3 !== null) {
      options = arg3;
    } else if (arg3 === undefined) {
      if (typeof arg4 === "string") {
        customDescription = arg4;
        options = arg5;
      } else if (typeof arg4 === "object" && arg4 !== null) {
        options = arg4;
      } else {
        options = arg5;
      }
    }
  } else if (typeof arg2 === "string") {
    customTitle = arg2;
    if (typeof arg3 === "string") {
      customDescription = arg3;
      if (typeof arg4 === "object" && arg4 !== null) {
        options = arg4;
      }
    } else if (typeof arg3 === "object" && arg3 !== null) {
      options = arg3;
    }
  } else if (typeof arg2 === "object" && arg2 !== null) {
    options = arg2;
  }

  const baseUrl = getSiteUrl();
  const cleanPath = path.replace(/^\/(?:fr|ar|en)(?=\/|$)/, "") || "/";
  const normalizedPath = cleanPath.startsWith("/blog/") ? "/blog" : cleanPath;
  const canonicalUrl = `${baseUrl}${getLocalizedPath(cleanPath, lang)}`;

  const dictMetadata = localizedSeo(cleanPath, lang);
  let rawTitle = customTitle ?? dictMetadata?.title ?? `Dinner with a Local Family Marrakech | ${BRAND_NAME}`;
  let rawDescription = customDescription ?? dictMetadata?.description ?? dict.en.seo.home.description;

  // Enforce under 60 characters for title
  const headTitle = rawTitle.includes(`| ${BRAND_NAME}`) && rawTitle.length <= 60
    ? rawTitle
    : formatMetaTitle(rawTitle);

  // Enforce under 155 characters for description
  const headDescription =
    rawDescription.length <= 155 ? rawDescription : `${rawDescription.slice(0, 151).trim()}…`;

  const imageObj = openGraphImages[normalizedPath] ?? openGraphImages["/"];
  const ogImageUrl = `${baseUrl}${imageObj.path}`;
  const ogImageAlt = imageObj.alt[lang] || imageObj.alt.en;

  const breadcrumbSegments = cleanPath.split("/").filter(Boolean);
  const breadcrumbItems = [
    { name: dict[lang].nav.home, item: `${baseUrl}${getLocalizedPath("/", lang)}` },
    ...breadcrumbSegments.map((segment, index) => ({
      name: segment.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      item: `${baseUrl}${getLocalizedPath(`/${breadcrumbSegments.slice(0, index + 1).join("/")}`, lang)}`,
    })),
  ];

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  const businessData: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "TouristAttraction"],
    name: BRAND_NAME,
    url: `${baseUrl}/`,
    logo: `${baseUrl}/brand/logo-full.png`,
    image: `${baseUrl}/og-image.png`,
    description: dict[lang].seo.home.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Marrakech",
      addressRegion: "Marrakech-Safi",
      streetAddress: "Bab Ghmat",
      addressCountry: "MA",
    },
    telephone: "+212707072556",
    priceRange: "€€",
    currenciesAccepted: "EUR, MAD",
    paymentAccepted: "Cash",
  };

  const scripts: Array<{ type: string; children: string }> = [
    {
      type: "application/ld+json",
      children: JSON.stringify(breadcrumbData).replace(/</g, "\\u003c"),
    },
  ];

  if (cleanPath === "/" || cleanPath === "") {
    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify(businessData).replace(/</g, "\\u003c"),
    });

    if (options?.experiences && options.experiences.length > 0) {
      for (const exp of options.experiences) {
        const tripData = {
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: exp.title[lang] || exp.title.en,
          description: exp.blurb[lang] || exp.blurb.en,
          touristType: "Culinary travelers, families, cultural exchange",
          offers: {
            "@type": "Offer",
            price: exp.price,
            priceCurrency: "EUR",
            availability: "https://schema.org/InStock",
            url: `${baseUrl}${getLocalizedPath("/booking", lang)}`,
          },
          provider: {
            "@type": "LocalBusiness",
            name: BRAND_NAME,
            url: `${baseUrl}/`,
          },
        };
        scripts.push({
          type: "application/ld+json",
          children: JSON.stringify(tripData).replace(/</g, "\\u003c"),
        });
      }
    }

    if (options?.faqs && options.faqs.length > 0) {
      const faqData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: options.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question[lang] || faq.question.en,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer[lang] || faq.answer.en,
          },
        })),
      };
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify(faqData).replace(/</g, "\\u003c"),
      });
    }
  }

  if (cleanPath.startsWith("/blog/") && options?.article) {
    const articleData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: headTitle.replace(` | ${BRAND_NAME}`, ""),
      description: headDescription,
      inLanguage: lang,
      datePublished: options.article.publishedAt || options.article.createdAt,
      author: {
        "@type": "Organization",
        name: BRAND_NAME,
        url: `${baseUrl}/`,
      },
      publisher: {
        "@type": "Organization",
        name: BRAND_NAME,
        url: `${baseUrl}/`,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/brand/logo-full.png`,
        },
      },
      mainEntityOfPage: canonicalUrl,
    };
    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify(articleData).replace(/</g, "\\u003c"),
    });
  }

  return {
    meta: [
      { title: headTitle },
      { name: "description", content: headDescription },
      { property: "og:site_name", content: BRAND_NAME },
      { property: "og:title", content: headTitle },
      { property: "og:description", content: headDescription },
      { property: "og:type", content: cleanPath.startsWith("/blog/") ? "article" : "website" },
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: ogImageUrl },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: ogImageAlt },
      {
        property: "og:locale",
        content: lang === "ar" ? "ar_MA" : lang === "fr" ? "fr_FR" : "en_US",
      },
      {
        property: "og:locale:alternate",
        content: lang === "en" ? "fr_FR" : "en_US",
      },
      {
        property: "og:locale:alternate",
        content: lang === "ar" ? "fr_FR" : "ar_MA",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@moroccansecrets" },
      { name: "twitter:title", content: headTitle },
      { name: "twitter:description", content: headDescription },
      { name: "twitter:image", content: ogImageUrl },
    ],
    links: [
      { rel: "canonical", href: canonicalUrl },
      {
        rel: "alternate",
        hrefLang: "en",
        href: `${baseUrl}${getLocalizedPath(cleanPath, "en")}`,
      },
      {
        rel: "alternate",
        hrefLang: "fr",
        href: `${baseUrl}${getLocalizedPath(cleanPath, "fr")}`,
      },
      {
        rel: "alternate",
        hrefLang: "ar",
        href: `${baseUrl}${getLocalizedPath(cleanPath, "ar")}`,
      },
      {
        rel: "alternate",
        hrefLang: "x-default",
        href: `${baseUrl}${getLocalizedPath(cleanPath, "en")}`,
      },
    ],
    scripts,
  };
}
