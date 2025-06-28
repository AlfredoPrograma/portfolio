import type { Language } from "@i18n/utils";

const translations = {
  en: {
    "blog.description": "Thoughts on development, cloud design, and the ever-evolving backend, infrastructure and devops topics.",
  },
  es: {
    "blog.description": "Reflexiones y casos de estudio enfocados en el desarrollo backend, la nube, infrastructura cloud y devops.",
  },
} as const

export function translate(lang: Language) {
  return function t(key: keyof typeof translations[typeof lang]) {
    return translations[lang][key]
  }
}