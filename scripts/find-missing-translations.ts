import enTranslations from "../lib/i18n/translations/en.json"
import ruTranslations from "../lib/i18n/translations/ru.json"
import deTranslations from "../lib/i18n/translations/de.json"

function getAllKeys(obj: Record<string, any>, prefix = ""): string[] {
  const keys: string[] = []

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key

    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys.push(...getAllKeys(obj[key], fullKey))
    } else {
      keys.push(fullKey)
    }
  }

  return keys
}

const enKeys = new Set(getAllKeys(enTranslations))
const ruKeys = new Set(getAllKeys(ruTranslations))
const deKeys = new Set(getAllKeys(deTranslations))

console.log("[v0] Missing keys in RU:")
for (const key of enKeys) {
  if (!ruKeys.has(key)) {
    console.log(`  - ${key}`)
  }
}

console.log("\n[v0] Missing keys in DE:")
for (const key of enKeys) {
  if (!deKeys.has(key)) {
    console.log(`  - ${key}`)
  }
}

console.log("\n[v0] EN total keys:", enKeys.size)
console.log("[v0] RU total keys:", ruKeys.size)
console.log("[v0] DE total keys:", deKeys.size)
