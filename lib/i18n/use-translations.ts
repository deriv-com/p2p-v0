"use client"

import { useCallback } from "react"
import { useLanguageStore } from "@/stores/language-store"
import en from "./translations/en.json"
import es from "./translations/es.json"
import it from "./translations/it.json"
import type { Locale } from "./config"

const translations = {
  en,
  es,
  it,
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
          // Fallback to English if key not found
          value = translations.en
          for (const fallbackKey of keys) {
            if (value && typeof value === "object" && fallbackKey in value) {
              value = value[fallbackKey]
            } else {
              return key // Return key if not found in fallback
            }
          }
          break
        }
      }

      if (typeof value !== "string") {
        return key
      }

      // Replace parameters in the translation
      if (params) {
        return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
          return params[paramKey]?.toString() || match
        })
      }

      return value
    },
    [locale],
  )

  return { t, locale }
}
