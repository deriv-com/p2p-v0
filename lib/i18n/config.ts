export const locales = ["en", "es", "it", "pt", "fr", "ru", "vi", "de", "bn", "pl", "ko", "sw"] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  it: "Italiano",
  pt: "Português",
  fr: "Français",
  ru: "Русский",
  vi: "Tiếng Việt",
  de: "Deutsch",
  bn: "বাংলা",
  pl: "Polski",
  ko: "한국어",
  sw: "Kiswahili",
}
