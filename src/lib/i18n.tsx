import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { dict, type Dict } from "./translations";

export type Lang = "en" | "fr" | "ar";
export const LANGS: Lang[] = ["en", "fr", "ar"];
export type L10n = Record<Lang, string>;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict; l: (v: L10n) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("ms-lang") as Lang | null;
    if (saved && LANGS.includes(saved)) setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("ms-lang", l);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t: dict[lang], l: (v) => v[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
