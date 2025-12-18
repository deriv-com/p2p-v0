"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useIsMobile } from "@/hooks/use-mobile"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export type PriceType = "fixed" | "float"

interface PriceTypeSelectorProps {
  marketPrice: number | null
  value: PriceType
  onChange: (value: PriceType) => void
  disabled?: boolean
}

export function PriceTypeSelector({ marketPrice, value, onChange, disabled = false }: PriceTypeSelectorProps) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  const isFloatingRateEnabled = process.env.NEXT_PUBLIC_FLOATING_RATE_ENABLED == 1

  const handleSelect = (newValue: PriceType) => {
    onChange(newValue)
    setOpen(false)
  }

  const triggerButton = (
    <Button
      variant="outline"
      disabled={disabled}
      className="w-full h-[56px] max-h-[56px] rounded-lg justify-between px-4 border border-gray-200 hover:bg-transparent font-normal"
    >
      <span className="text-grayscale-600">{value === "fixed" ? "Fixed" : "Floating"}</span>
      <Image src="/icons/chevron-down.png" alt="Arrow" width={24} height={24} className="ml-2" />
    </Button>
  )

  const content = (
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

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {!marketPrice || !isFloatingRateEnabled ? 
          (
            <div className="flex items-center">
              <h3 className="text-lg font-bold leading-6 tracking-normal">Rate (fixed)</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Image src="/icons/info-circle.png" alt="Info" width={12} height={12} className="ml-1 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-white">Set a constant price, unaffected by market fluctuations.</p>
                  <TooltipArrow className="fill-black" />
                </TooltipContent>
              </Tooltip>
            </div>
          ) :
          (<h3 className="text-lg font-bold leading-6 tracking-normal">Rate</h3>)
        }
        {isMobile ? (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>{marketPrice && isFloatingRateEnabled && triggerButton}</DrawerTrigger>
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
          <Dialog open={open} onOpenChange={setOpen} className="sm:rounded-4xl">
            <DialogTrigger asChild>{marketPrice && isFloatingRateEnabled && triggerButton}</DialogTrigger>
            <DialogContent className="p-[32px] sm:rounded-[32px]">
              <DialogHeader className="flex-row items-center justify-between mb-4">
                <DialogTitle className="tracking-normal font-bold text-2xl">Rate type</DialogTitle>
                <DialogClose> 
                  <Button variant="ghost" className="bg-slate-75 min-w-[48px] px-0 absolute right-[32px] top-4">
                    <Image src="/icons/close-icon.png" alt="Close" width={24} height={24} />
                  </Button>
                </DialogClose>
              </DialogHeader>
              {content}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  )
}
