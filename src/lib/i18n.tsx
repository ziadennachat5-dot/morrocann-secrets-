import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dict, type Dict } from "./translations";
import { getPublicCopyOverrides } from "./copy.functions";
import { applyCopyOverrides, type CopyOverride } from "./copy-utils";
import { getLocalizedPath } from "./seo";

export type Lang = "en" | "fr" | "ar";
export const LANGS: Lang[] = ["en", "fr", "ar"];
export type L10n = Record<Lang, string>;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict; l: (v: L10n) => string };
const I18nContext = createContext<Ctx | null>(null);

export function detectLangFromPath(pathname: string): Lang {
  if (pathname.startsWith("/ar/") || pathname === "/ar") return "ar";
  if (pathname.startsWith("/fr/") || pathname === "/fr") return "fr";
  return "en";
}

export function I18nProvider({ children, forcedLang }: { children: ReactNode; forcedLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (forcedLang) return forcedLang;
    if (typeof window !== "undefined") {
      return detectLangFromPath(window.location.pathname);
    }
    return "en";
  });
  const [copyOverrides, setCopyOverrides] = useState<CopyOverride[]>([]);
  const [copyLoadError, setCopyLoadError] = useState(false);

  useEffect(() => {
    if (forcedLang) {
      setLangState(forcedLang);
      return;
    }
    const currentLang = detectLangFromPath(window.location.pathname);
    setLangState(currentLang);

    // If arrival had ?lang= parameter, redirect to the real language URL
    const searchParams = new URLSearchParams(window.location.search);
    const requested = searchParams.get("lang");
    if (requested && (requested === "en" || requested === "fr" || requested === "ar")) {
      searchParams.delete("lang");
      const targetPath = getLocalizedPath(window.location.pathname, requested as Lang);
      const searchStr = searchParams.toString();
      const newUrl = `${targetPath}${searchStr ? `?${searchStr}` : ""}${window.location.hash}`;
      window.location.replace(newUrl);
    }
  }, [forcedLang]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    }
  }, [lang]);

  useEffect(() => {
    getPublicCopyOverrides()
      .then(setCopyOverrides)
      .catch((error: unknown) => {
        console.warn("Using default copy (published overrides unavailable):", error);
      });
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem("ms-lang", l);
      const targetPath = getLocalizedPath(window.location.pathname, l);
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.delete("lang");
      const searchStr = searchParams.toString();
      const newUrl = `${targetPath}${searchStr ? `?${searchStr}` : ""}${window.location.hash}`;
      window.location.assign(newUrl);
    }
  };

  const localizedDict = applyCopyOverrides(dict[lang], lang, copyOverrides);

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
