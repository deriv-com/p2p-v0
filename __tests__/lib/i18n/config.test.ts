import {
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
  it("maps zh_TW to BCP 47 zh-TW", () => {
    expect(localeToBcp47("zh_TW")).toBe("zh-TW")
  })
})
