"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useLanguageStore } from "@/stores/language-store"
import { locales, defaultLocale, type Locale } from "./config"

export function LanguageSync() {
  const searchParams = useSearchParams()
  const setLocale = useLanguageStore((state) => state.setLocale)

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

  return null
}
