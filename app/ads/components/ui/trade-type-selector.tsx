"use client"

import { Button } from "@/components/ui/button"

interface TradeTypeSelectorProps {
  value: "buy" | "sell"
  onChange: (value: "buy" | "sell") => void
  isEditMode?: boolean
}

export function TradeTypeSelector({ value, onChange, isEditMode = false }: TradeTypeSelectorProps) {
  return (
    <div className="flex bg-gray-50 rounded-lg w-full md:w-[270px] h-10 min-h-10 max-h-10 px-1 py-0">
      <Button
        type="button"
        variant="ghost"
        onClick={() => !isEditMode && onChange("buy")}
        disabled={isEditMode}
        className={`flex-1 flex items-center justify-center rounded-lg text-center font-medium transition-all h-8 whitespace-nowrap
          ${value === "buy" ? "bg-white shadow-sm my-1" : "bg-transparent text-gray-500 my-1"}`}
      >
        I want to buy
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={() => !isEditMode && onChange("sell")}
        disabled={isEditMode}
        className={`flex-1 flex items-center justify-center rounded-lg text-center font-medium transition-all h-8 min-h-[32px] text-sm whitespace-nowrap
          ${value === "sell" ? "bg-white shadow-sm my-1" : "bg-transparent text-gray-500 my-1"}`}
      >
        I want to sell
      </Button>
    </div>
  )
}
