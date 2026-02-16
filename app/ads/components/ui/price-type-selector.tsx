"use client"

import { useState } from "react"
import Image from "next/image"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type PriceType = "fixed" | "float"

interface PriceTypeSelectorProps {
  marketPrice: number | null
  value: PriceType
  onChange: (value: PriceType) => void
  disabled?: boolean
  isFloatingRateEnabled?: boolean
}

export function PriceTypeSelector({ marketPrice, value, onChange, disabled = false, isFloatingRateEnabled = false }: PriceTypeSelectorProps) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  const handleSelect = (newValue: PriceType) => {
    onChange(newValue)
    setOpen(false)
  }

  const triggerButton = (
    <Button
      variant="outline"
      disabled={disabled}
      className="w-full h-[56px] max-h-[56px] rounded-lg justify-between px-4 border border-gray-200 hover:bg-transparent font-normal bg-transparent"
    >
      <span className="text-grayscale-600">{value === "fixed" ? "Fixed" : "Floating"}</span>
      <Image src="/icons/chevron-down.png" alt="Arrow" width={24} height={24} className="ml-2" />
    </Button>
  )

  const content = (
    <RadioGroup value={value} onValueChange={handleSelect} disabled={disabled}>
      <Label
        htmlFor="fixed"
        className={`font-normal flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors bg-grayscale-500 ${value === "fixed"
          ? "border-black"
          : "border-grayscale-500"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="text-left flex-1">
          <div className="text-base mb-1 text-slate-1200">Fixed</div>
          <div className="text-xs text-grayscale-text-muted">
            Set a constant rate, unaffected by market fluctuations.
          </div>
        </div>
        <RadioGroupItem value="fixed" id="fixed" className="hidden mt-1 ml-4 h-6 w-6" />
      </Label>

      <Label
        htmlFor="float"
        className={`font-normal flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors bg-grayscale-500 ${value === "float"
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

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {!marketPrice || !isFloatingRateEnabled ?
          (
            <div className="flex items-center">
              <h3 className="text-lg font-bold leading-6 tracking-normal">Rate (fixed)</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Image
                    src="/icons/info-circle.svg"
                    alt="Info"
                    width={24}
                    height={24}
                    className="ml-1 cursor-pointer flex-shrink-0"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-white">Set a constant rate, unaffected by market fluctuations.</p>
                  <TooltipArrow className="fill-black" />
                </TooltipContent>
              </Tooltip>
            </div>
          ) :
          (<h3 className="text-lg font-bold leading-6 tracking-normal">Rate</h3>)
        }
        {marketPrice && isFloatingRateEnabled && (
          isMobile ? (
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
              <DrawerContent>
                <div className="px-4 pb-6">
                  <div className="py-4">
                    <h3 className="text-xl font-bold text-center">Rate type</h3>
                  </div>
                  {content}
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Select value={value} onValueChange={handleSelect} disabled={disabled}>
              <SelectTrigger className="w-full h-[56px] max-h-[56px] rounded-lg border border-gray-200 bg-transparent hover:bg-transparent">
                <div className="text-slate-1200">{value === "fixed" ? "Fixed" : "Floating"}</div>
              </SelectTrigger>
              <SelectContent className="[&>*]:!p-0 [&_.bg-slate-1200]:hover:!bg-black">
                <SelectItem value="fixed" className="!py-0 !px-0">
                  <div className="flex flex-col p-4 rounded-xl border cursor-pointer transition-all bg-slate-1200 border-slate-1200 text-white w-full hover:bg-black hover:border-black">
                    <span className="text-base mb-1">Fixed</span>
                    <span className="text-sm text-gray-300">Set a constant rate, unaffected by market fluctuations.</span>
                  </div>
                </SelectItem>
                <SelectItem value="float" className="!py-0 !px-0">
                  <div className="flex flex-col p-4 rounded-xl border cursor-pointer transition-all bg-slate-1200 border-slate-1200 text-white w-full hover:bg-black hover:border-black">
                    <span className="text-base mb-1">Floating</span>
                    <span className="text-sm text-gray-300">Set a rate that changes with market movements.</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )
        )}
      </div>
    </TooltipProvider>
  )
}
