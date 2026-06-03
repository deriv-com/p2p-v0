"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLanguageStore } from "@/stores/language-store"
import { locales, defaultLocale, isRtlLocale, type Locale } from "./config"

function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = locale
  document.documentElement.dir = isRtlLocale(locale) ? "rtl" : "ltr"
}

export function LanguageSync() {
  const searchParams = useSearchParams()
  const { locale, setLocale } = useLanguageStore()

  useEffect(() => {
    const langParam = searchParams.get("lang")

    if (langParam) {
      const normalizedLang = langParam.toLowerCase()
      if (locales.includes(normalizedLang as Locale)) {
        setLocale(normalizedLang as Locale)
      } else {
        // Fallback to stored locale if URL param is invalid
        const storedLocale = localStorage.getItem("language-storage")
        if (storedLocale) {
          try {
            const parsed = JSON.parse(storedLocale)
            if (parsed.state?.locale && locales.includes(parsed.state.locale)) {
              setLocale(parsed.state.locale)
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
          if (parsed.state?.locale && locales.includes(parsed.state.locale)) {
            setLocale(parsed.state.locale)
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
