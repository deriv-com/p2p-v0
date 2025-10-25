"use client"

import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface OrderTimeLimitSelectorProps {
  value: number
  onValueChange: (value: number) => void
  className?: string
}

const TIME_LIMIT_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes" },
]

export default function OrderTimeLimitSelector({ value, onValueChange, className }: OrderTimeLimitSelectorProps) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = TIME_LIMIT_OPTIONS.find((option) => option.value === value)

  const handleSelect = (selectedValue: number) => {
    onValueChange(selectedValue)
    setIsOpen(false)
  }

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className={`w-full h-[56px] rounded-lg justify-between ${className} font-normal`}>
            <span>{selectedOption?.label || "Order time limit"}</span>
            <Image src="/icons/chevron-down.png" alt="Arrow" width={24} height={24} className="ml-2" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-fit p-4 rounded-t-2xl">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-center">Order time limit</h3>
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
    <Select value={value.toString()} onValueChange={(selectedValue) => onValueChange(Number(selectedValue))} >
      <SelectTrigger className={`w-[70%] h-[56px] text-base rounded-lg ${className}`}>
        <SelectValue>{selectedOption?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {TIME_LIMIT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value.toString()} className="text-base">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
