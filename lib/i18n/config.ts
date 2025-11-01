export const locales = ["en", "es", "it"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  it: "Italiano",
}
