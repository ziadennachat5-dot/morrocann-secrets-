import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dict, type Dict } from "./translations";
import { getPublicCopyOverrides } from "./copy.functions";
import { applyCopyOverrides, type CopyOverride } from "./copy-utils";
import { localizedSeo } from "./seo";

export type Lang = "en" | "fr" | "ar";
export const LANGS: Lang[] = ["en", "fr", "ar"];
export type L10n = Record<Lang, string>;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict; l: (v: L10n) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [copyOverrides, setCopyOverrides] = useState<CopyOverride[]>([]);
  const [copyLoadError, setCopyLoadError] = useState(false);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("lang");
    const selected =
      LANGS.find((language) => language === requested) ??
      LANGS.find((language) => language === localStorage.getItem("ms-lang"));
    if (!selected) return;
    setLangState(selected);
    if (requested !== selected) {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", selected);
      window.history.replaceState(window.history.state, "", url);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    getPublicCopyOverrides()
      .then(setCopyOverrides)
      .catch((error: unknown) => {
        console.error("Unable to load published page text:", error);
        setCopyLoadError(true);
      });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("ms-lang", l);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", l);
    window.history.replaceState(window.history.state, "", url);
  };
  const localizedDict = applyCopyOverrides(dict[lang], lang, copyOverrides);

  useEffect(() => {
    if (window.location.pathname.startsWith("/blog/")) return;
    const metadata = localizedSeo(window.location.pathname, lang, localizedDict);
    if (!metadata) return;
    document.title = metadata.title;
    const pageUrl = new URL(window.location.href);
    pageUrl.searchParams.set("lang", lang);
    document
      .querySelector<HTMLLinkElement>('link[rel="canonical"]')
      ?.setAttribute("href", pageUrl.toString());
    for (const [selector, content] of [
      ['meta[name="description"]', metadata.description],
      ['meta[property="og:title"]', metadata.title],
      ['meta[property="og:description"]', metadata.description],
      ['meta[property="og:locale"]', lang === "ar" ? "ar_MA" : lang === "fr" ? "fr_FR" : "en_US"],
      ['meta[name="twitter:title"]', metadata.title],
      ['meta[name="twitter:description"]', metadata.description],
    ] as const) {
      document.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", content);
    }
  }, [lang, localizedDict]);

  return (
    <I18nContext.Provider
      value={{
        lang,
        setLang,
        t: localizedDict,
        l: (v) => v[lang],
      }}
    >
      {copyLoadError && (
        <p role="alert" className="bg-destructive px-4 py-2 text-center text-sm text-white">
          {localizedDict.copyLoadError}
        </p>
      )}
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
