"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from "@/lib/i18n/use-translations"

export type PriceType = "fixed" | "floating"

interface PriceTypeSelectorProps {
  value: PriceType
  onChange: (value: PriceType) => void
  disabled?: boolean
}

export function PriceTypeSelector({ value, onChange, disabled = false }: PriceTypeSelectorProps) {
  const { t } = useTranslations()

  return (
    <div className="space-y-4">
      <h3 className="text-base font-bold leading-6 tracking-normal mb-4">Rate Type</h3>

      <Select
        value={value}
        onValueChange={(val) => onChange(val as PriceType)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full md:w-64 h-14 rounded-lg">
          <SelectValue placeholder="Select price type">
            {value === "fixed" ? "Fixed" : "Floating"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="fixed">Fixed</SelectItem>
          <SelectItem value="floating">Floating Price</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
