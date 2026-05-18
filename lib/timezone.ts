/**
 * Browser-native IANA timezone helpers.
 *
 * Web equivalent of mobile's `BusinessHoursTimezone` — but synchronous, since
 * `Intl.DateTimeFormat` resolves the device timezone without a platform call.
 */

/** Returns the current device IANA zone (e.g. `Asia/Singapore`). Falls back to `UTC` in non-browser environments. */
export function getCurrentTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}

/** Returns the short GMT offset for the current device (e.g. `GMT+8`, `GMT-5:30`). */
export function getGmtOffsetLabel(now: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZoneName: "shortOffset",
    }).formatToParts(now)
    const tzPart = parts.find((p) => p.type === "timeZoneName")?.value
    if (tzPart) {
      // `GMT+8`, `GMT-04:00` — normalize to `GMT+8` / `GMT-4:30`.
      const m = tzPart.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
      if (m) {
        const sign = m[1]
        const hours = Number.parseInt(m[2], 10)
        const minutes = m[3] ? Number.parseInt(m[3], 10) : 0
        return minutes === 0
          ? `GMT${sign}${hours}`
          : `GMT${sign}${hours}:${m[3]}`
      }
      return tzPart
    }
  } catch {
    // fall through
  }
  // Fallback: derive from local offset.
  const offset = -now.getTimezoneOffset()
  const sign = offset >= 0 ? "+" : "-"
  const abs = Math.abs(offset)
  const hours = Math.floor(abs / 60)
  const minutes = abs % 60
  return minutes === 0
    ? `GMT${sign}${hours}`
    : `GMT${sign}${hours}:${minutes.toString().padStart(2, "0")}`
}

/** Builds the caption shown under the Hours section, e.g. `GMT+8 (Asia/Singapore)`. */
export function getTimezoneDisplayLabel(iana?: string): string {
  const zone = iana ?? getCurrentTimezone()
  return `${getGmtOffsetLabel()} (${zone})`
}
