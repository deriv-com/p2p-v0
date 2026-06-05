import {
  apiPreferredLanguageToLocale,
  isRtlLocale,
  localeToBcp47,
  locales,
  normalizeLocaleParam,
} from "@/lib/i18n/config"

describe("normalizeLocaleParam", () => {
  it("handles case variations and aliases", () => {
    expect(normalizeLocaleParam("ZH-TW")).toBe("zh_TW")
    expect(normalizeLocaleParam("zh-tw")).toBe("zh_TW")
    expect(normalizeLocaleParam("zh_tw")).toBe("zh_TW")
    expect(normalizeLocaleParam("zh-CN")).toBe("zh")
    expect(normalizeLocaleParam("zh-cn")).toBe("zh")
    expect(normalizeLocaleParam("zh-Hans")).toBe("zh")
    expect(normalizeLocaleParam("zh-Hant")).toBe("zh_TW")
    expect(normalizeLocaleParam("AR")).toBe("ar")
  })

  it("returns null for invalid locales", () => {
    expect(normalizeLocaleParam("invalid")).toBeNull()
    expect(normalizeLocaleParam("<script>")).toBeNull()
    expect(normalizeLocaleParam("")).toBeNull()
  })
})

describe("isRtlLocale", () => {
  it("identifies Arabic as RTL", () => {
    expect(isRtlLocale("ar")).toBe(true)
  })

  it("identifies all other locales as LTR", () => {
    const ltrLocales = locales.filter((locale) => locale !== "ar")
    ltrLocales.forEach((locale) => {
      expect(isRtlLocale(locale)).toBe(false)
    })
  })
})

describe("localeToBcp47", () => {
  it("maps Chinese locales to BCP 47 tags", () => {
    expect(localeToBcp47("zh_TW")).toBe("zh-TW")
    expect(localeToBcp47("zh")).toBe("zh-CN")
  })
})

describe("apiPreferredLanguageToLocale", () => {
  it("maps API preferred_language values to supported locales", () => {
    expect(apiPreferredLanguageToLocale("en")).toBe("en")
    expect(apiPreferredLanguageToLocale("zh-CN")).toBe("zh")
    expect(apiPreferredLanguageToLocale("zh_tw")).toBe("zh_TW")
  })

  it("returns null for unsupported values", () => {
    expect(apiPreferredLanguageToLocale("invalid")).toBeNull()
    expect(apiPreferredLanguageToLocale("")).toBeNull()
  })
})
