"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

export type PriceType = "fixed" | "float"

interface PriceTypeSelectorProps {
  value: PriceType
  onChange: (value: PriceType) => void
  disabled?: boolean
}

export function PriceTypeSelector({ value, onChange, disabled = false }: PriceTypeSelectorProps) {
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
      className="w-full h-[56px] max-h-[56px] rounded-lg justify-between px-4 border border-gray-200 hover:bg-none"
    >
      <span>{value === "fixed" ? "Fixed" : "Floating"}</span>
      <Image src="/icons/chevron-down.png" alt="Arrow" width={24} height={24} className="ml-2" />
    </Button>
  )

  const content = (
    <div className="space-y-4 p-4">
      <Button
        onClick={() => handleSelect("fixed")}
        disabled={disabled}
        className={`w-full p-4 rounded-lg border-2 flex items-start justify-between transition-colors ${
          value === "fixed"
            ? "border-black bg-white"
            : "border-gray-200 bg-gray-50 hover:bg-gray-100"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="text-left flex-1">
          <div className="text-base font-semibold mb-1">Fixed</div>
          <div className="text-sm text-gray-600">
            Set a constant price, unaffected by market fluctuations.
          </div>
        </div>
        <div className="ml-4 mt-1">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              value === "fixed" ? "border-black" : "border-gray-400"
            }`}
          >
            {value === "fixed" && (
              <div className="w-3 h-3 rounded-full bg-black" />
            )}
          </div>
        </div>
      </Button>

      <Button
        onClick={() => handleSelect("float")}
        disabled={disabled}
        className={`w-full p-4 rounded-lg border-2 flex items-start justify-between transition-colors ${
          value === "float"
            ? "border-black bg-white"
            : "border-gray-200 bg-gray-50 hover:bg-gray-100"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className="text-left flex-1">
          <div className="text-base font-semibold mb-1">Floating</div>
          <div className="text-sm text-gray-600">
            Set a rate that changes with market movements.
          </div>
        </div>
        <div className="ml-4 mt-1">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              value === "float" ? "border-black" : "border-gray-400"
            }`}
          >
            {value === "float" && (
              <div className="w-3 h-3 rounded-full bg-black" />
            )}
          </div>
        </div>
      </Button>
    </div>
  )

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold leading-6 tracking-normal mb-4">Rate type</h3>

      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
          <DrawerContent>
            <div className="pb-6">
              <div className="px-4 pt-4 pb-2">
                <h3 className="text-lg font-bold">Rate type</h3>
              </div>
              {content}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{triggerButton}</DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <h3 className="text-lg font-bold mb-2">Rate type</h3>
            {content}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
