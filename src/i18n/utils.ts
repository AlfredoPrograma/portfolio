export type Language = "en" | "es"

export const languages = {
  en: "English",
  es: "Español"
} satisfies Record<Language, string>

const defaultLanguage = "en" satisfies Language

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in languages) return lang as Language
  return defaultLanguage;
}

