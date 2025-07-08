"use client"

import { Button } from "@/components/ui/button"

interface TradeTypeSelectorProps {
  value: "buy" | "sell"
  onChange: (value: "buy" | "sell") => void
  disabled?: boolean
}

export function TradeTypeSelector({ value, onChange, disabled = false }: TradeTypeSelectorProps) {
  return (
    <div className="flex w-full rounded-lg border border-gray-200 overflow-hidden">
      <Button
        type="button"
        variant={value === "buy" ? "default" : "outline"}
        className={`flex-1 rounded-none border-0 ${
          value === "buy" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-white hover:bg-gray-50 text-gray-700"
        }`}
        onClick={() => onChange("buy")}
        disabled={disabled}
      >
        Buy
      </Button>
      <Button
        type="button"
        variant={value === "sell" ? "default" : "outline"}
        className={`flex-1 rounded-none border-0 border-l border-gray-200 ${
          value === "sell" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-white hover:bg-gray-50 text-gray-700"
        }`}
        onClick={() => onChange("sell")}
        disabled={disabled}
      >
        Sell
      </Button>
    </div>
  )
}
