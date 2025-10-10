export const LANGUAGES = {
  en: "English",
  es: "Español",
} as const;

export type Lang = keyof typeof LANGUAGES;

export const DEFAULT_LANG: Lang = "en";

export const SUPPORTED_LANGS = Object.keys(LANGUAGES) as Lang[];

export function isLang(value: string | undefined): value is Lang {
  return Boolean(value) && value! in LANGUAGES;
}

export function resolveLang(value: string | undefined): Lang {
  return isLang(value) ? value : DEFAULT_LANG;
}

export function createLangHref(lang: Lang, path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${lang}${normalized === "/" ? "" : normalized}`;
}
