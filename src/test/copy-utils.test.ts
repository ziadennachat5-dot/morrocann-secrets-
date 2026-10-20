import { describe, expect, it } from "vitest";
import {
  applyCopyOverrides,
  readTranslation,
  translationPaths,
  writeTranslation,
} from "@/lib/copy-utils";
import { dict } from "@/lib/translations";

describe("localized copy helpers", () => {
  it("enumerates and reads string leaves including nested arrays", () => {
    const paths = translationPaths(dict.en);
    expect(paths).toContain("nav.home");
    expect(paths).toContain("how.steps.0.t");
    expect(readTranslation(dict.en, "nav.home")).toBe("Home");
    expect(readTranslation(dict.en, "invalid.path")).toBe("");
  });

  it("writes only an existing translation path", () => {
    const updated = writeTranslation(dict.en, "nav.home", "Welcome");
    expect(readTranslation(updated, "nav.home")).toBe("Welcome");
    expect(readTranslation(updated, "nav.exploit")).toBe("");
    expect(readTranslation(dict.en, "nav.home")).toBe("Home");
  });

  it("applies localized overrides only for known copy keys", () => {
    const localized = applyCopyOverrides(dict.en, "fr", [
      { settingKey: "copy.nav.home", value: { en: "Home", fr: "Accueil édité", ar: "الرئيسية" } },
      { settingKey: "copy.constructor.prototype", value: { en: "bad", fr: "bad", ar: "bad" } },
    ]);
    expect(readTranslation(localized, "nav.home")).toBe("Accueil édité");
    expect(readTranslation(localized, "constructor.prototype")).toBe("");
  });
});
