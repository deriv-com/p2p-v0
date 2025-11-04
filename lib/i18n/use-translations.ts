"use client"

/**
 * Simple translation hook
 * Returns translation keys as-is (passthrough) until proper i18n is implemented
 */
export function useTranslations() {
  const t = (key: string, params?: Record<string, string | number>) => {
    // For now, return the key as-is
    // In a full implementation, this would look up translations from a dictionary
    let result = key

    // Handle parameter interpolation if params are provided
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        result = result.replace(`{${paramKey}}`, String(params[paramKey]))
      })
    }

    return result
  }

  return { t }
}
