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
        variant={value === "buy" ? "default" : "ghost"}
        size="sm"
        onClick={() => !isEditMode && onChange("buy")}
        disabled={isEditMode}
        className={`flex-1 h-8 my-1 rounded-lg font-medium transition-all ${
          value === "buy" ? "bg-white shadow-sm" : "bg-transparent text-gray-500"
        }`}
      >
        I want to buy
      </Button>
      <Button
        type="button"
        variant={value === "sell" ? "default" : "ghost"}
        size="sm"
        onClick={() => !isEditMode && onChange("sell")}
        disabled={isEditMode}
        className={`flex-1 h-8 my-1 rounded-lg font-medium transition-all ${
          value === "sell" ? "bg-white shadow-sm" : "bg-transparent text-gray-500"
        }`}
      >
        I want to sell
      </Button>
    </div>
  )
}
