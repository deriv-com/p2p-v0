"use client"

import { useState } from "react"
import { useTranslations } from "@/lib/i18n/use-translations"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Image from "next/image"

interface AdVisibilitySelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export default function AdVisibilitySelector({ value, onValueChange }: AdVisibilitySelectorProps) {
  const { t } = useTranslations()

  return (
    <RadioGroup value={value} onValueChange={onValueChange}>
      <Label
        htmlFor="everyone"
        className={`font-normal flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors bg-grayscale-500 ${
          value === "everyone"
            ? "border-black"
            : "border-grayscale-500"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="text-left flex-1">
          <div className="text-base mb-1 text-slate-1200">Everyone</div>
          <div className="text-xs text-grayscale-text-muted">
            Your ad will be visible to everyone on the marketplace.
          </div>
        </div>
        <RadioGroupItem value="everyone" id="everyone" className="hidden mt-1 ml-4 h-6 w-6" />
      </Label>

      <Label
        htmlFor="closed-group"
        className={`font-normal flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors bg-grayscale-500 ${
          value === "closed-group"
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
        <RadioGroupItem value="closed-group" id="closed-group" className="hidden mt-1 ml-4 h-6 w-6" />
      </Label>
    </RadioGroup>
  )
}
