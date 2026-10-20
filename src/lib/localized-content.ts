import type { Lang } from "@/lib/i18n";

export type LocalizedContent = Record<Lang, string>;

export function localizedTextForLanguage(value: LocalizedContent, language: Lang): string {
  return value[language].trim() || value.en.trim();
}
