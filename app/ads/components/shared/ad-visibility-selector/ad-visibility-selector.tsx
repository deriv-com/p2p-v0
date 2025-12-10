"use client"

import { useTranslations } from "@/lib/i18n/use-translations"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import { cn } from "@/lib/utils"

export type AdVisibilityType = "everyone" | "closed_group"

interface AdVisibilitySelectorProps {
  value: AdVisibilityType
  onValueChange: (value: AdVisibilityType) => void
  onEditList?: () => void
}

export function AdVisibilitySelector({ value, onValueChange, onEditList }: AdVisibilitySelectorProps) {
  const { t } = useTranslations()

  return (
    <div className="w-full">
      <div className="flex gap-[4px] items-center mb-4">
        <h3 className="text-base font-bold">{t("adForm.adVisibility")}</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Image src="/icons/info-circle.svg" alt="Info" width={24} height={24} className="ml-1 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-white">{t("adForm.adVisibilityTooltip")}</p>
              <TooltipArrow className="fill-black" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <RadioGroup value={value} onValueChange={onValueChange} className="space-y-3">
        {/* Everyone Option */}
        <label
          htmlFor="visibility-everyone"
          className={cn(
            "flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors",
            "hover:bg-grayscale-100",
            value === "everyone" ? "border-black bg-grayscale-100" : "border-grayscale-400 bg-white",
          )}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                fill="#0EA5E9"
              />
            </svg>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-base font-bold">{t("adForm.everyone")}</h4>
              <RadioGroupItem value="everyone" id="visibility-everyone" />
            </div>
            <p className="text-sm text-grayscale-600">{t("adForm.everyoneDescription")}</p>
          </div>
        </label>

        {/* Closed Group Option */}
        <label
          htmlFor="visibility-closed-group"
          className={cn(
            "flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors",
            "hover:bg-grayscale-100",
            value === "closed_group" ? "border-black bg-grayscale-100" : "border-grayscale-400 bg-white",
          )}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 flex-shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="#06B6D4"
              />
            </svg>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-base font-bold">{t("adForm.closedGroup")}</h4>
              <RadioGroupItem value="closed_group" id="visibility-closed-group" />
            </div>
            <p className="text-sm text-grayscale-600">
              {t("adForm.closedGroupDescription")}{" "}
              {onEditList && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    onEditList()
                  }}
                  className="text-blue-600 underline hover:text-blue-700"
                >
                  {t("adForm.editList")}
                </button>
              )}
            </p>
          </div>
        </label>
      </RadioGroup>
    </div>
  )
}
