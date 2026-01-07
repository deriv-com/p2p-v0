"use client"

import { useState } from "react"
import { useTranslations } from "@/lib/i18n/use-translations"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface AdVisibilitySelectorProps {
  value: number
  onValueChange: (value: number) => void
}

export default function AdVisibilitySelector({ value, onValueChange }: AdVisibilitySelectorProps) {
  const { t } = useTranslations()

  return (
    <RadioGroup value={value} onValueChange={handleSelect} disabled={disabled}>
      <Label
        htmlFor="fixed"
        className={`font-normal flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors bg-grayscale-500 ${
          value === "fixed"
            ? "border-black"
            : "border-grayscale-500"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="text-left flex-1">
          <div className="text-base mb-1 text-slate-1200">Fixed</div>
          <div className="text-xs text-grayscale-text-muted">
            Set a constant price, unaffected by market fluctuations.
          </div>
        </div>
        <RadioGroupItem value="fixed" id="fixed" className="hidden mt-1 ml-4 h-6 w-6" />
      </Label>

      <Label
        htmlFor="float"
        className={`font-normal flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors bg-grayscale-500 ${
          value === "float"
            ? "border-black"
            : "border-grayscale-500"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="text-left flex-1">
          <div className="text-base text-slate-1200 mb-1">Floating</div>
          <div className="text-xs text-grayscale-text-muted">
            Set a rate that changes with market movements.
          </div>
        </div>
        <RadioGroupItem value="float" id="float" className="hidden mt-1 ml-4 h-6 w-6" />
      </Label>
    </RadioGroup>
  )
}
