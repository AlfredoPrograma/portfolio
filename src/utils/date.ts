const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(locale: string) {
  if (!formatterCache.has(locale)) {
    formatterCache.set(locale, new Intl.DateTimeFormat(locale, { dateStyle: "long" }));
  }

  return formatterCache.get(locale)!;
}

export function formatDate(date: Date, locale: string) {
  return getFormatter(locale).format(date);
}
