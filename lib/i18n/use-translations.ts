"use client"

import { useCallback } from "react"
import { useLanguageStore } from "@/stores/language-store"
import en from "./translations/en.json"
import es from "./translations/es.json"
import it from "./translations/it.json"
import pt from "./translations/pt.json"
import fr from "./translations/fr.json"
import ru from "./translations/ru.json"
import vi from "./translations/vi.json"
import de from "./translations/de.json" 
import bn from "./translations/bn.json"
import pl from "./translations/pl.json"
import type { Locale } from "./config"

const translations = {
  en,
  es,
  it,
  pt,
  fr,
  ru,
  vi,
  de,
  bn,
  pl,
}

type TranslationKey = string
type TranslationParams = Record<string, string | number>

export function useTranslations() {
  const locale = useLanguageStore((state) => state.locale)

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams): string => {
      const keys = key.split(".")
      let value: any = translations[locale as Locale]

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = value[k]
        } else {
          value = translations.en
          for (const fallbackKey of keys) {
            if (value && typeof value === "object" && fallbackKey in value) {
              value = value[fallbackKey]
            } else {
              return key
            }
          }
          break
        }
      }

      if (typeof value !== "string") {
        return key
      }

      if (params) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return paramKey in params ? String(params[paramKey]) : match
        })
      }

      return value
    },
    [locale],
  )

  return { t, locale }
}
