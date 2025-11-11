"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
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
     <h3 className="text-base font-bold leading-6 tracking-normal mb-4">{t("adForm.priceType")}</h3>

      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as PriceType)}
        disabled={disabled}
        className="flex gap-8"
      >
        <div className="flex items-center space-x-3">
          <RadioGroupItem value="fixed" id="fixed-price" className="border-grayscale-100 text-black" />
          <Label htmlFor="fixed-price" className="text-sm font-normal cursor-pointer text-grayscale-100">
            Fixed Price
          </Label>
        </div>

        <div className="flex items-center space-x-3">
          <RadioGroupItem value="floating" id="floating-price" className="border-grayscale-100 text-black" />
          <Label htmlFor="floating-price" className="text-sm font-normal cursor-pointer text-grayscale-100">
            Floating Price
          </Label>
        </div>
      </RadioGroup>
    </div>
  )
}
