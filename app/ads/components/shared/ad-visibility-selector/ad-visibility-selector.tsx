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
            <Image src="/icons/everyone.svg" alt="Everyone" width={24} height={24} />
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
            <Image src="/icons/closed-group.svg" alt="Closed group" width={24} height={24} />
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
