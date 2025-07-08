"use client"

import { Button } from "@/components/ui/button"

interface TradeTypeSelectorProps {
  selectedType: "buy" | "sell"
  onTypeChange: (type: "buy" | "sell") => void
  disabled?: boolean
}

export function TradeTypeSelector({ selectedType, onTypeChange, disabled = false }: TradeTypeSelectorProps) {
  return (
    <div className="flex w-full rounded-lg border border-gray-200 bg-gray-50 p-1">
      <Button
        variant={selectedType === "buy" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTypeChange("buy")}
        disabled={disabled}
        className={`flex-1 ${
          selectedType === "buy"
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-transparent text-gray-600 hover:bg-gray-100"
        }`}
      >
        Buy
      </Button>
      <Button
        variant={selectedType === "sell" ? "default" : "ghost"}
        size="sm"
        onClick={() => onTypeChange("sell")}
        disabled={disabled}
        className={`flex-1 ${
          selectedType === "sell"
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-transparent text-gray-600 hover:bg-gray-100"
        }`}
      >
        Sell
      </Button>
    </div>
  )
}
