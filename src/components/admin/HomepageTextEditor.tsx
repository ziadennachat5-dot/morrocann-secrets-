import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/types";
import { DEFAULT_HOW_STEPS } from "@/lib/homepage-content";

type Language = "en" | "fr" | "ar";
type LocalizedText = Record<Language, string>;
type HomepageText = {
  hero: LocalizedText;
  idea: LocalizedText;
  reasons: LocalizedText[];
  steps: LocalizedText[];
  contact: { whatsapp: string; email: string };
};
const languages: Language[] = ["en", "fr", "ar"];
const emptyText = (): LocalizedText => ({ en: "", fr: "", ar: "" });
const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function localizedText(value: Json | undefined): LocalizedText {
  if (!value || typeof value !== "object" || Array.isArray(value)) return emptyText();
  const fields = value as Record<string, Json | undefined>;
  return {
    en: typeof fields["en"] === "string" ? fields["en"] : "",
    fr: typeof fields["fr"] === "string" ? fields["fr"] : "",
    ar: typeof fields["ar"] === "string" ? fields["ar"] : "",
  };
}

function readHomepageText(settings: Tables<"site_settings">[]): HomepageText {
  const values = new Map(settings.map(({ setting_key, value }) => [setting_key, value]));
  const readSetting = (key: string) => {
    const value = values.get(key);
    return typeof value === "string" ? value : "";
  };
  const readList = (key: string): LocalizedText[] => {
    const value = values.get(key);
    if (!Array.isArray(value)) {
      return key === "home.steps" ? DEFAULT_HOW_STEPS.map((step) => ({ ...step })) : [];
    }
    if (key === "home.steps" && value.length === 0) {
      return DEFAULT_HOW_STEPS.map((step) => ({ ...step }));
    }
    return value.slice(0, 3).map((item) => localizedText(item));
  };
  return {
    hero: localizedText(values.get("home.hero")),
    idea: localizedText(values.get("home.idea")),
    reasons: [
      ...readList("home.reasons"),
      ...Array.from({ length: Math.max(0, 3 - readList("home.reasons").length) }, emptyText),
    ].slice(0, 3),
    steps: [
      ...readList("home.steps"),
      ...Array.from({ length: Math.max(0, 3 - readList("home.steps").length) }, emptyText),
    ].slice(0, 3),
    contact: {
      whatsapp: readSetting("contact.whatsapp"),
      email: readSetting("contact.email"),
    },
  };
}

export function HomepageTextEditor({
  settings,
  onRefresh,
  onError,
}: {
  settings: Tables<"site_settings">[];
  onRefresh: () => Promise<void>;
  onError: (message: string) => void;
}) {
  const [text, setText] = useState(() => readHomepageText(settings));
  const [busyKey, setBusyKey] = useState("");

  useEffect(() => setText(readHomepageText(settings)), [settings]);

  async function save(key: string, value: Json) {
    setBusyKey(key);
    const { error } = await supabase.from("site_settings").upsert({
      setting_key: key.startsWith("contact.") ? key : `home.${key}`,
      value,
      is_public: true,
      updated_at: new Date().toISOString(),
    });
    if (error) onError(`Homepage text could not be saved: ${error.message}`);
    else await onRefresh();
    setBusyKey("");
  }

  function updateField(field: "hero" | "idea", language: Language, value: string) {
    setText((current) => ({
      ...current,
      [field]: { ...current[field], [language]: value },
    }));
  }

  function updateList(list: "reasons" | "steps", index: number, language: Language, value: string) {
    setText((current) => ({
      ...current,
      [list]: current[list].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [language]: value } : item,
      ),
    }));
  }

  function updateContact(field: "whatsapp" | "email", value: string) {
    setText((current) => ({
      ...current,
      contact: { ...current.contact, [field]: value },
    }));
  }

  function fieldset(field: "hero" | "idea", label: string, rows: number) {
    return (
      <fieldset className="space-y-2 rounded-lg border p-4">
        <legend className="px-1 font-semibold">{label}</legend>
        {languages.map((language) => (
          <label key={language} className="block text-sm">
            {language.toUpperCase()}
            {language !== "en" ? " (optional)" : ""}
            <textarea
              dir={language === "ar" ? "rtl" : "ltr"}
              className={`${inputClass} mt-1`}
              rows={rows}
              maxLength={1500}
              value={text[field][language]}
              onChange={(event) => updateField(field, language, event.target.value)}
            />
          </label>
        ))}
        <Button
          type="button"
          className="min-h-11"
          disabled={busyKey === field}
          onClick={() => void save(field, text[field])}
        >
          {busyKey === field ? "Saving…" : `Save ${label.toLowerCase()}`}
        </Button>
      </fieldset>
    );
  }

  function saveList(event: FormEvent<HTMLFormElement>, list: "reasons" | "steps") {
    event.preventDefault();
    void save(list, text[list]);
  }

  function listEditor(list: "reasons" | "steps", title: string) {
    return (
      <form className="space-y-4 rounded-lg border p-4" onSubmit={(event) => saveList(event, list)}>
        <h3 className="font-semibold">{title}</h3>
        {text[list].map((item, index) => (
          <fieldset key={index} className="space-y-2 rounded border p-3">
            <legend className="px-1 text-sm font-medium">
              {title} {index + 1}
            </legend>
            {languages.map((language) => (
              <label key={language} className="block text-sm">
                {language.toUpperCase()}
                {language !== "en" ? " (optional)" : ""}
                <input
                  dir={language === "ar" ? "rtl" : "ltr"}
                  className={`${inputClass} mt-1`}
                  maxLength={300}
                  value={item[language]}
                  onChange={(event) => updateList(list, index, language, event.target.value)}
                />
              </label>
            ))}
          </fieldset>
        ))}
        <Button type="submit" className="min-h-11" disabled={busyKey === list}>
          {busyKey === list ? "Saving…" : `Save ${title.toLowerCase()}`}
        </Button>
      </form>
    );
  }

  function contactEditor(field: "whatsapp" | "email") {
    const settingKey = `contact.${field}`;
    return (
      <form
        className="rounded-lg border p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save(settingKey, text.contact[field].trim());
        }}
      >
        <label className="block text-sm font-medium">
          {field === "whatsapp" ? "WhatsApp number" : "Public email"}
          <input
            className={`${inputClass} mt-2 min-h-11`}
            type={field === "email" ? "email" : "tel"}
            maxLength={255}
            value={text.contact[field]}
            onChange={(event) => updateContact(field, event.target.value)}
          />
        </label>
        <Button type="submit" className="mt-3 min-h-11" disabled={busyKey === settingKey}>
          {busyKey === settingKey ? "Saving…" : "Save contact"}
        </Button>
      </form>
    );
  }

  return (
    <section className="space-y-5 rounded-xl border p-4">
      <h3 className="text-xl font-semibold">Homepage text</h3>
      <p className="text-sm text-muted-foreground">
        Empty sections stay hidden. English is required to display text; French and Arabic fall back
        to English when blank.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        {fieldset("hero", "Hero sentence", 2)}
        {fieldset("idea", "The idea", 3)}
        {listEditor("reasons", "Why try it")}
        {listEditor("steps", "How it works")}
        {contactEditor("whatsapp")}
        {contactEditor("email")}
      </div>
    </section>
  );
}
