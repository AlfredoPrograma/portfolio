import type { Language } from "@i18n/utils"

const englishDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long"
})

const spanishDateFormatter = new Intl.DateTimeFormat("es-VE", {
  dateStyle: "long"
})

export function formatDate(date: Date, lang: Language) {
  if (lang === "es") {
    return spanishDateFormatter.format(date)
  }

  return englishDateFormatter.format(date)
}

