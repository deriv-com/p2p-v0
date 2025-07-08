"use client"

import { Button } from "@/components/ui/button"

interface TradeTypeSelectorProps {
  selectedType: "buy" | "sell"
  onTypeChange: (type: "buy" | "sell") => void
  disabled?: boolean
}

export function TradeTypeSelector({ selectedType, onTypeChange, disabled = false }: TradeTypeSelectorProps) {
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
      <Button
        variant={selectedType === "buy" ? "default" : "outline"}
        className={`flex-1 rounded-none border-0 ${
          selectedType === "buy"
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-white hover:bg-gray-50 text-gray-700"
        }`}
        onClick={() => onTypeChange("buy")}
        disabled={disabled}
      >
        Buy
      </Button>
      <Button
        variant={selectedType === "sell" ? "default" : "outline"}
        className={`flex-1 rounded-none border-0 border-l ${
          selectedType === "sell" ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white hover:bg-gray-50 text-gray-700"
        }`}
        onClick={() => onTypeChange("sell")}
        disabled={disabled}
      >
        Sell
      </Button>
    </div>
  )
}
