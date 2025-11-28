"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslations } from "@/lib/i18n/use-translations"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface OrderTimeLimitSelectorProps {
  value: number
  onValueChange: (value: number) => void
  className?: string
}

export default function OrderTimeLimitSelector({ value, onValueChange, className }: OrderTimeLimitSelectorProps) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslations()

  const TIME_LIMIT_OPTIONS = [
    { value: 15, label: t("adForm.timeLimit15Minutes") },
    { value: 30, label: t("adForm.timeLimit30Minutes") },
    { value: 45, label: t("adForm.timeLimit45Minutes") },
    { value: 60, label: t("adForm.timeLimit60Minutes") },
  ]

  const selectedOption = TIME_LIMIT_OPTIONS.find((option) => option.value === value)

  const handleSelect = (selectedValue: number) => {
    onValueChange(selectedValue)
    setIsOpen(false)
  }

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <div className="relative w-full">
            <Button
              variant="outline"
              className={cn(
                "w-full h-[56px] max-h-none justify-start pl-4 pr-12 rounded-lg bg-transparent border-input hover:bg-transparent focus:border-black font-normal",
                selectedOption ? "pt-6 pb-2" : "",
                className,
              )}
            >
              <span className="text-base">
                {selectedOption ? selectedOption.label : t("adForm.orderTimeLimitPlaceholder")}
              </span>
            </Button>
            {selectedOption && (
              <label className="absolute left-4 top-2 text-xs font-normal text-[#000000B8] pointer-events-none">
                {t("adForm.orderTimeLimitPlaceholder")}
              </label>
            )}
            <Image
              src="/icons/chevron-down.png"
              alt="Arrow"
              width={24}
              height={24}
              className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-fit p-4 rounded-t-2xl">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-center">{t("adForm.orderTimeLimit")}</h3>
          </div>
          <div className="mt-6 space-y-2">
            {TIME_LIMIT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={value === option.value ? "black" : "ghost"}
                className="w-full justify-start rounded-sm font-normal opacity-72 text-base"
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="relative w-full">
      {selectedOption && (
        <label className="absolute left-4 top-2 text-xs font-normal text-[#000000B8] pointer-events-none z-10">
          {t("adForm.orderTimeLimitPlaceholder")}
        </label>
      )}
      <Select value={value.toString()} onValueChange={(selectedValue) => onValueChange(Number(selectedValue))}>
        <SelectTrigger
          className={cn(
            "w-full h-[56px] text-base rounded-lg pl-4 pr-12 [&>svg]:hidden",
            selectedOption ? "pt-6 pb-2" : "",
            className,
          )}
        >
          <SelectValue placeholder={t("adForm.orderTimeLimitPlaceholder")}>{selectedOption?.label}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TIME_LIMIT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()} className="text-base h-12">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Image
        src="/icons/chevron-down.png"
        alt="Arrow"
        width={24}
        height={24}
        className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
      />
    </div>
  )
}
