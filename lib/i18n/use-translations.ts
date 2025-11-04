"use client"

export function useTranslations() {
  const t = (key: string, params?: Record<string, string | number>) => {
    // Simple passthrough implementation - returns the key as-is
    // In a full implementation, this would look up translations from a dictionary
    if (!params) {
      return key
    }

    // Replace parameters in the format {paramName}
    let result = key
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      result = result.replace(new RegExp(`{${paramKey}}`, "g"), String(paramValue))
    })

    return result
  }

  return { t }
}
