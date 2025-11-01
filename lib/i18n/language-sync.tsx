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

    if (langParam && locales.includes(langParam as Locale)) {
      setLocale(langParam as Locale)
    } else {
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
