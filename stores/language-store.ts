import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Locale } from "@/lib/i18n/config"
import { defaultLocale } from "@/lib/i18n/config"

interface LanguageState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

// Store persists the preference as fallback when no query param is present
export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "language-storage",
    },
  ),
)
