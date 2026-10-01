import en from "./locales/en.json";
import es from "./locales/es.json";
import ptBR from "./locales/pt-BR.json";

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object") return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

function collectPlaceholders(value: unknown, prefix = "", acc: string[] = []): string[] {
  if (typeof value === "string") {
    for (const match of value.matchAll(/\{\{\s*([\w.-]+)\s*\}\}/g)) {
      acc.push(`${prefix} -> ${match[1]}`);
    }
    return acc;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      collectPlaceholders(child, prefix ? `${prefix}.${key}` : key, acc);
    }
  }
  return acc;
}

describe("locale key parity", () => {
  const base = flattenKeys(ptBR).sort();

  it.each([
    ["en", en],
    ["es", es],
  ])("%s has exactly the same keys as pt-BR", (_name, locale) => {
    expect(flattenKeys(locale).sort()).toEqual(base);
  });

  it.each([
    ["en", en],
    ["es", es],
  ])("%s has the same i18next placeholders ({{x}}) as pt-BR", (_name, locale) => {
    expect(collectPlaceholders(locale).sort()).toEqual(collectPlaceholders(ptBR).sort());
  });
});
