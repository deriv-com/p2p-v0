/**
 * Business hours codec — pure functions shared by the form, header row, and
 * the React Query mutation. Mirror of the Flutter implementation in
 * `p2p/ai-deriv-p2p-app/lib/core/utils/business_hours_codec.dart` so both
 * clients agree on what gets stored vs displayed.
 */

export const BUSINESS_HOURS_DAY_KEYS = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
] as const

export type DayKey = (typeof BUSINESS_HOURS_DAY_KEYS)[number]

export interface ScheduleDayWindow {
  start: string
  end: string
}

export interface BusinessHoursSchedule {
  timezone?: string
  sun?: ScheduleDayWindow
  mon?: ScheduleDayWindow
  tue?: ScheduleDayWindow
  wed?: ScheduleDayWindow
  thu?: ScheduleDayWindow
  fri?: ScheduleDayWindow
  sat?: ScheduleDayWindow
}

export interface BusinessHoursUiState {
  /** Toggle off = "Always open" (no schedule restriction). */
  enabled: boolean
  /** Day keys (`mon`, `tue`, ...) currently selected as available. */
  selectedDays: Set<DayKey>
  /** Open time in 24h `HH:mm`. `null` until the user picks one. */
  openTime: string | null
  /** Close time in 24h `HH:mm`. */
  closeTime: string | null
  /** IANA timezone (e.g. `Asia/Singapore`); falls back to `UTC`. */
  timezone: string
}

export const DEFAULT_OPEN_TIME = "09:00"
export const DEFAULT_CLOSE_TIME = "22:00"

const ALL_DAY: ScheduleDayWindow = { start: "00:00", end: "24:00" }
const CLOSED: ScheduleDayWindow = { start: "00:00", end: "00:00" }

const isAllDay = (d?: ScheduleDayWindow) =>
  d?.start === ALL_DAY.start && d?.end === ALL_DAY.end

const isClosed = (d?: ScheduleDayWindow) =>
  d?.start === CLOSED.start && d?.end === CLOSED.end

/**
 * Decode a backend `schedule` payload into UI state.
 *
 * Default-on-empty: when `schedule` is null OR every day is `00:00–24:00`,
 * the UI shows "Always open" (`enabled = false`).
 */
export function decodeSchedule(
  schedule: BusinessHoursSchedule | null | undefined,
  fallbackTimezone: string,
): BusinessHoursUiState {
  if (!schedule) {
    return {
      enabled: false,
      selectedDays: new Set(BUSINESS_HOURS_DAY_KEYS),
      openTime: DEFAULT_OPEN_TIME,
      closeTime: DEFAULT_CLOSE_TIME,
      timezone: fallbackTimezone,
    }
  }

  const tz = schedule.timezone ?? fallbackTimezone

  const allDays = BUSINESS_HOURS_DAY_KEYS.every((k) => isAllDay(schedule[k]))
  if (allDays) {
    return {
      enabled: false,
      selectedDays: new Set(BUSINESS_HOURS_DAY_KEYS),
      openTime: DEFAULT_OPEN_TIME,
      closeTime: DEFAULT_CLOSE_TIME,
      timezone: tz,
    }
  }

  const selected = new Set<DayKey>()
  let open: string | null = null
  let close: string | null = null
  for (const k of BUSINESS_HOURS_DAY_KEYS) {
    const d = schedule[k]
    if (!d || isClosed(d)) continue
    selected.add(k)
    open ??= d.start
    close ??= d.end
  }

  return {
    enabled: true,
    selectedDays: selected,
    openTime: open ?? DEFAULT_OPEN_TIME,
    closeTime: close ?? DEFAULT_CLOSE_TIME,
    timezone: tz,
  }
}

/** Encode UI state into the backend `schedule` payload. */
export function encodeSchedule(
  state: BusinessHoursUiState,
): BusinessHoursSchedule {
  if (!state.enabled) {
    return {
      timezone: "UTC",
      sun: { ...ALL_DAY },
      mon: { ...ALL_DAY },
      tue: { ...ALL_DAY },
      wed: { ...ALL_DAY },
      thu: { ...ALL_DAY },
      fri: { ...ALL_DAY },
      sat: { ...ALL_DAY },
    }
  }
  const open = state.openTime ?? DEFAULT_OPEN_TIME
  const close = state.closeTime ?? DEFAULT_CLOSE_TIME
  const out: BusinessHoursSchedule = { timezone: state.timezone }
  for (const k of BUSINESS_HOURS_DAY_KEYS) {
    out[k] = state.selectedDays.has(k)
      ? { start: open, end: close }
      : { ...CLOSED }
  }
  return out
}

/** True when [state] can be saved (enables the Save changes button). */
export function isStateValid(state: BusinessHoursUiState): boolean {
  if (!state.enabled) return true
  if (state.selectedDays.size === 0) return false
  if (!state.openTime || !state.closeTime) return false
  if (state.openTime === state.closeTime) return false
  return true
}

export function statesEqual(
  a: BusinessHoursUiState,
  b: BusinessHoursUiState,
): boolean {
  if (a.enabled !== b.enabled) return false
  if (a.openTime !== b.openTime) return false
  if (a.closeTime !== b.closeTime) return false
  if (a.timezone !== b.timezone) return false
  if (a.selectedDays.size !== b.selectedDays.size) return false
  for (const k of a.selectedDays) {
    if (!b.selectedDays.has(k)) return false
  }
  return true
}

/**
 * Format a 24h `HH:mm` value as a localized time label
 * (`9:00 AM`, `22:00`, depending on locale + hour cycle).
 */
export function formatTime(hhmm: string | null, locale?: string): string {
  if (!hhmm) return ""
  const [h, m] = hhmm.split(":").map((p) => Number.parseInt(p, 10))
  if (Number.isNaN(h) || Number.isNaN(m)) return ""
  const date = new Date()
  date.setHours(h, m, 0, 0)
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

/**
 * Build the summary string shown in the header row entry point.
 * Returns the bare summary (no `Business hour:` prefix); the row component
 * adds the localized prefix.
 */
export function summaryFor(
  state: BusinessHoursUiState,
  copy: { alwaysOpen: string; closed: string },
  locale?: string,
): string {
  if (!state.enabled) return copy.alwaysOpen
  if (state.selectedDays.size === 0) return copy.closed
  return `${formatTime(state.openTime, locale)} – ${formatTime(state.closeTime, locale)}`
}
