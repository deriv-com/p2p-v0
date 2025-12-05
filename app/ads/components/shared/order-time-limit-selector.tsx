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
  const hasValue = !!selectedOption

  const handleSelect = (selectedValue: number) => {
    onValueChange(selectedValue)
    setIsOpen(false)
  }

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <div className="relative">
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full h-[56px] max-h-none justify-start rounded-lg bg-transparent border-input hover:bg-transparent focus:border-black font-normal pl-4 pr-12 [&>svg]:hidden",
                hasValue ? "pt-6 pb-2" : "py-4",
                className,
              )}
            >
              <span className={cn("text-left text-base text-grayscale-600")}>
                {hasValue ? selectedOption.label : t("adForm.orderTimeLimitPlaceholder")}
              </span>
            </Button>
          </SheetTrigger>
          {hasValue && (
            <label className="absolute left-[14px] top-2 text-[12px] font-normal text-grayscale-600 pointer-events-none bg-white px-1">
              {t("adForm.orderTimeLimitPlaceholder")}
            </label>
          )}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Image
              src="/icons/chevron-down.png"
              alt="Arrow"
              width={24}
              height={24}
              className={cn("transition-transform", isOpen && "rotate-180")}
            />
          </div>
        </div>
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
    <div className="relative">
      <Select
        value={value.toString()}
        onValueChange={(selectedValue) => onValueChange(Number(selectedValue))}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger
          hideChevron
          className={cn(
            "w-[100%] h-[56px] text-base rounded-lg pl-4 pr-12 text-grayscale-600",
            hasValue ? "pt-6 pb-2" : "py-4",
            className,
          )}
        >
          <SelectValue>{hasValue ? selectedOption.label : t("adForm.orderTimeLimitPlaceholder")}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TIME_LIMIT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()} className="text-base h-12">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hasValue && (
        <label className="absolute left-[14px] top-2 text-[12px] font-normal text-grayscale-600 pointer-events-none bg-white px-1">
          {t("adForm.orderTimeLimitPlaceholder")}
        </label>
      )}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <Image
          src="/icons/chevron-down.png"
          alt="Arrow"
          width={24}
          height={24}
          className={cn("transition-transform", isOpen && "rotate-180")}
        />
      </div>
    </div>
  )
}
