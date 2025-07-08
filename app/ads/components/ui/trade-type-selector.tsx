"use client"

import { Button } from "@/components/ui/button"

interface TradeTypeSelectorProps {
  selectedType: "buy" | "sell"
  onTypeChange: (type: "buy" | "sell") => void
  disabled?: boolean
}

export function TradeTypeSelector({ selectedType, onTypeChange, disabled = false }: TradeTypeSelectorProps) {
  return (
    <div className="flex w-full rounded-lg border border-gray-200 overflow-hidden">
      <Button
        variant={selectedType === "buy" ? "default" : "ghost"}
        className={`flex-1 rounded-none border-0 ${
          selectedType === "buy"
            ? "bg-green-600 text-white hover:bg-green-700"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => onTypeChange("buy")}
        disabled={disabled}
      >
        Buy
      </Button>
      <Button
        variant={selectedType === "sell" ? "default" : "ghost"}
        className={`flex-1 rounded-none border-0 ${
          selectedType === "sell" ? "bg-red-600 text-white hover:bg-red-700" : "bg-white text-gray-700 hover:bg-gray-50"
        }`}
        onClick={() => onTypeChange("sell")}
        disabled={disabled}
      >
        Sell
      </Button>
    </div>
  )
}
