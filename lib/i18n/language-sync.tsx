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
import { loadLocale } from "./translation-loader"

function applyDocumentLocale(locale: Locale) {
  document.documentElement.lang = localeToBcp47(locale)
  document.documentElement.dir = isRtlLocale(locale) ? "rtl" : "ltr"
}

function resolveLangFromUrl(langParam: string | null): Locale | null {
  if (!langParam) return null
  return normalizeLocaleParam(langParam) ?? defaultLocale
}

export function LanguageSync() {
  const searchParams = useSearchParams()
  const locale = useLanguageStore((state) => state.locale)
  const setLocale = useLanguageStore((state) => state.setLocale)

  const applyLocaleFromUrl = () => {
    const langParam = searchParams.get("lang")
    if (!langParam) return false
    const resolved = resolveLangFromUrl(langParam)
    if (resolved) {
      setLocale(resolved)
    }
    return true
  }

  // `?lang=` from platform (e.g. zh-CN, zh-TW) wins over persisted preference.
  useEffect(() => {
    if (applyLocaleFromUrl()) return

    const storedLocale = localStorage.getItem("language-storage")
    if (!storedLocale) return

    try {
      const parsed = JSON.parse(storedLocale)
      const stored = parsed.state?.locale ? normalizeLocaleParam(parsed.state.locale) : null
      if (stored) {
        setLocale(stored)
      }
    } catch {
      setLocale(defaultLocale)
    }
  }, [searchParams, setLocale])

  // Persist rehydration can run after the effect above and overwrite URL locale.
  useEffect(() => {
    const persistApi = useLanguageStore.persist
    if (!persistApi?.onFinishHydration) return

    return persistApi.onFinishHydration(() => {
      applyLocaleFromUrl()
    })
  }, [searchParams, setLocale])

  useEffect(() => {
    applyDocumentLocale(locale)
  }, [locale])

  useEffect(() => {
    void loadLocale(locale)
  }, [locale])

  return null
}
