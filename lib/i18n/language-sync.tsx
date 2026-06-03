"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLanguageStore } from "@/stores/language-store"
import {
  defaultLocale,
  isRtlLocale,
  localeToBcp47,
  normalizeLocaleParam,
  type Locale,
} from "./config"

function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = localeToBcp47(locale)
  document.documentElement.dir = isRtlLocale(locale) ? "rtl" : "ltr"
}

export function LanguageSync() {
  const searchParams = useSearchParams()
  const { locale, setLocale } = useLanguageStore()

  useEffect(() => {
    const langParam = searchParams.get("lang")

    if (langParam) {
      const resolved = normalizeLocaleParam(langParam)
      if (resolved) {
        setLocale(resolved)
      } else {
        // Fallback to stored locale if URL param is invalid
        const storedLocale = localStorage.getItem("language-storage")
        if (storedLocale) {
          try {
            const parsed = JSON.parse(storedLocale)
            const stored = parsed.state?.locale
              ? normalizeLocaleParam(parsed.state.locale)
              : null
            if (stored) {
              setLocale(stored)
            }
          } catch {
            setLocale(defaultLocale)
          }
        }
      }
    } else {
      // No lang param, use stored locale or default
      const storedLocale = localStorage.getItem("language-storage")
      if (storedLocale) {
        try {
          const parsed = JSON.parse(storedLocale)
          const stored = parsed.state?.locale
            ? normalizeLocaleParam(parsed.state.locale)
            : null
          if (stored) {
            setLocale(stored)
          }
        } catch {
          setLocale(defaultLocale)
        }
      }
    }
  }, [searchParams, setLocale])

  // Sync document lang/dir whenever the active locale changes (covers all
  // supported locales including RTL Arabic and all LTR locales).
  useEffect(() => {
    applyDocumentLocale(locale)
  }, [locale])

  return null
}
