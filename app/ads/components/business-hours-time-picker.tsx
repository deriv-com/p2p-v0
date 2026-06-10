"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const ITEM_H = 44  // px per row
const VISIBLE = 5  // rows visible in viewport
const PAD = Math.floor(VISIBLE / 2) // rows of padding top & bottom

interface ScrollColumnProps {
  options: string[]
  value: string
  onChange: (v: string) => void
  width?: string
}

function ScrollColumn({ options, value, onChange, width = "flex-1" }: ScrollColumnProps) {
  const ref = useRef<HTMLDivElement>(null)
  const programmatic = useRef(false)

  // Scroll to selected item whenever value changes from outside.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const idx = options.indexOf(value)
    if (idx < 0) return
    programmatic.current = true
    el.scrollTo({ top: idx * ITEM_H, behavior: "smooth" })
    const t = setTimeout(() => { programmatic.current = false }, 400)
    return () => clearTimeout(t)
  }, [value, options])

  const handleScroll = () => {
    if (programmatic.current) return
    const el = ref.current
    if (!el) return
    const idx = Math.round(el.scrollTop / ITEM_H)
    const clamped = Math.max(0, Math.min(idx, options.length - 1))
    if (options[clamped] !== value) onChange(options[clamped])
  }

  return (
    <div className={cn("relative overflow-hidden", width)} style={{ height: ITEM_H * VISIBLE }}>
      {/* Gray selection band */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 z-10 rounded-xl bg-gray-100"
        style={{ top: PAD * ITEM_H, height: ITEM_H }}
      />
      {/* Fade top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20"
        style={{
          height: PAD * ITEM_H,
          background: "linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))",
        }}
      />
      {/* Fade bottom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
        style={{
          height: PAD * ITEM_H,
          background: "linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))",
        }}
      />
      {/* Scrollable column */}
      <div
        ref={ref}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll"
        style={{
          scrollSnapType: "y mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Top padding */}
        <div style={{ height: PAD * ITEM_H, scrollSnapAlign: "none" }} />
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => {
              onChange(opt)
              const idx = options.indexOf(opt)
              ref.current?.scrollTo({ top: idx * ITEM_H, behavior: "smooth" })
            }}
            className="flex w-full items-center justify-center font-medium text-gray-800 focus:outline-none"
            style={{
              height: ITEM_H,
              scrollSnapAlign: "start",
              fontSize: 17,
            }}
          >
            {opt}
          </button>
        ))}
        {/* Bottom padding */}
        <div style={{ height: PAD * ITEM_H, scrollSnapAlign: "none" }} />
      </div>
    </div>
  )
}

export interface TimePickerProps {
  /** 24h `HH:mm`. */
  value: string | null
  onChange: (hhmm: string) => void
}

const HOURS_12 = ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
const MINUTES = ["00", "15", "30", "45"]
const PERIODS = ["AM", "PM"]

function parse(hhmm: string | null): { h: number; m: number; period: "AM" | "PM" } {
  if (!hhmm) return { h: 9, m: 0, period: "AM" }
  const [hStr, mStr] = hhmm.split(":")
  const h24 = Number.parseInt(hStr ?? "0", 10)
  const m = Number.parseInt(mStr ?? "0", 10)
  const period: "AM" | "PM" = h24 >= 12 ? "PM" : "AM"
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return { h: h12, m, period }
}

function to24(h12: number, m: number, period: "AM" | "PM"): string {
  let h = h12 % 12
  if (period === "PM") h += 12
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
}

/** Nearest minute value from MINUTES list. */
function snapMinute(m: number): number {
  const snapped = [0, 15, 30, 45].reduce((prev, cur) =>
    Math.abs(cur - m) < Math.abs(prev - m) ? cur : prev,
  )
  return snapped
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const { h, m, period } = parse(value)
  const snappedM = snapMinute(m)

  const setH = (s: string) => onChange(to24(Number.parseInt(s, 10), snappedM, period as "AM" | "PM"))
  const setM = (s: string) => onChange(to24(h, Number.parseInt(s, 10), period as "AM" | "PM"))
  const setP = (s: string) => onChange(to24(h, snappedM, s as "AM" | "PM"))

  return (
    <div className="flex w-full gap-1 px-2">
      <ScrollColumn options={HOURS_12} value={String(h)} onChange={setH} />
      <div className="flex items-center justify-center text-lg font-semibold text-gray-500 pt-1" style={{ marginTop: PAD * ITEM_H }}>
        :
      </div>
      <ScrollColumn options={MINUTES} value={snappedM.toString().padStart(2, "0")} onChange={setM} />
      <ScrollColumn options={PERIODS} value={period} onChange={setP} />
    </div>
  )
}
