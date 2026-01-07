"use client"

import { useTranslations } from "@/lib/i18n/use-translations"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
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
            : "border-grayscale-500"}`}
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
        }`}
      >
        <div className="text-left flex-1">
          <div className="text-base text-slate-1200 mb-1">Closed group</div>
          <div className="text-xs text-grayscale-text-muted">
            Your ad will be visible only to users in your close group list.
          </div>
        </div>
        <RadioGroupItem value="closed-group" id="closed-group" className="hidden mt-1 ml-4 h-6 w-6" />
      </Label>
    </RadioGroup>
  )
}
