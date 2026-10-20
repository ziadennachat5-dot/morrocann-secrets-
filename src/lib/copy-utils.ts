import type { Dict } from "./translations";
import type { Lang } from "./i18n";

export type CopyOverride = {
  settingKey: string;
  value: Record<Lang, string>;
};

export function translationPaths(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return prefix ? [prefix] : [];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => translationPaths(item, `${prefix}.${index}`));
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).flatMap(([key, child]) =>
      translationPaths(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

export function readTranslation(value: unknown, path: string): string {
  let current = value;
  for (const segment of path.split(".")) {
    if (Array.isArray(current)) {
      const index = Number(segment);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) return "";
      current = current[index];
    } else if (typeof current === "object" && current !== null && Object.hasOwn(current, segment)) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return "";
    }
  }
  return typeof current === "string" ? current : "";
}

export function applyCopyOverrides(base: Dict, lang: Lang, overrides: CopyOverride[]): Dict {
  const result = structuredClone(base);
  const allowedPaths = new Set(translationPaths(base));
  for (const override of overrides) {
    if (!override.settingKey.startsWith("copy.")) continue;
    const path = override.settingKey.slice("copy.".length);
    if (!allowedPaths.has(path)) continue;
    const segments = path.split(".");
    let parent: unknown = result;
    for (const segment of segments.slice(0, -1)) {
      if (Array.isArray(parent)) {
        const index = Number(segment);
        if (!Number.isInteger(index) || index < 0 || index >= parent.length) {
          parent = null;
          break;
        }
        parent = parent[index];
      } else if (typeof parent === "object" && parent !== null && Object.hasOwn(parent, segment)) {
        parent = (parent as Record<string, unknown>)[segment];
      } else {
        parent = null;
        break;
      }
    }
    const last = segments.at(-1);
    if (!last) continue;
    if (Array.isArray(parent)) {
      const index = Number(last);
      if (Number.isInteger(index) && index >= 0 && index < parent.length) {
        parent[index] = override.value[lang];
      }
    } else if (typeof parent === "object" && parent !== null && Object.hasOwn(parent, last)) {
      const record = parent as Record<string, unknown>;
      if (typeof record[last] === "string") record[last] = override.value[lang];
    }
  }
  return result;
}

export function writeTranslation(value: unknown, path: string, replacement: string): unknown {
  const segments = path.split(".");
  const clone = structuredClone(value);
  let parent: unknown = clone;
  for (const segment of segments.slice(0, -1)) {
    if (Array.isArray(parent)) {
      const index = Number(segment);
      if (!Number.isInteger(index) || index < 0 || index >= parent.length) return clone;
      parent = parent[index];
    } else if (typeof parent === "object" && parent !== null && Object.hasOwn(parent, segment)) {
      parent = (parent as Record<string, unknown>)[segment];
    } else {
      return clone;
    }
  }
  const last = segments.at(-1);
  if (!last) return clone;
  if (Array.isArray(parent)) {
    const index = Number(last);
    if (Number.isInteger(index) && index >= 0 && index < parent.length) parent[index] = replacement;
  } else if (typeof parent === "object" && parent !== null && Object.hasOwn(parent, last)) {
    const record = parent as Record<string, unknown>;
    if (typeof record[last] === "string") record[last] = replacement;
  }
  return clone;
}
