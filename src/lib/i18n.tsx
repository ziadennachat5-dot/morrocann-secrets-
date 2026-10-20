import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dict, type Dict } from "./translations";
import { getPublicCopyOverrides } from "./copy.functions";
import { applyCopyOverrides, type CopyOverride } from "./copy-utils";

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
    const saved = localStorage.getItem("ms-lang") as Lang | null;
    if (saved && LANGS.includes(saved)) setLangState(saved);
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
