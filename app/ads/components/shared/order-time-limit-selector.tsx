"use client"

import { useTranslations } from "@/lib/i18n/use-translations"
import { cn } from "@/lib/utils"

interface OrderTimeLimitSelectorProps {
  value: number
  onValueChange: (value: number) => void
  className?: string
}

const TIME_LIMIT_OPTIONS = [15, 30, 45, 60] as const

export default function OrderTimeLimitSelector({
  value,
  onValueChange,
  className,
}: OrderTimeLimitSelectorProps) {
  const { t } = useTranslations()

  const labelFor = (minutes: number) => {
    switch (minutes) {
      case 15:
        return t("adForm.timeLimit15Minutes")
      case 30:
        return t("adForm.timeLimit30Minutes")
      case 45:
        return t("adForm.timeLimit45Minutes")
      case 60:
        return t("adForm.timeLimit60Minutes")
      default:
        return `${minutes}`
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {TIME_LIMIT_OPTIONS.map((option) => {
        const isSelected = option === value
        return (
          <button
            key={option}
            type="button"
            onClick={() => onValueChange(option)}
            aria-pressed={isSelected}
            className={cn(
              "flex-1 h-10 rounded-full text-base font-normal transition-colors",
              "border-[1.5px] text-grayscale-100",
              isSelected
                ? "bg-grayscale-500 border-black"
                : "bg-transparent border-grayscale-400",
            )}
          >
            {labelFor(option)}
          </button>
        )
      })}
    </div>
  )
}
