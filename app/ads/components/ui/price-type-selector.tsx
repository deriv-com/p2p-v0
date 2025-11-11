"use client"

import { cn } from "@/lib/utils"

interface PriceTypeSelectorProps {
  value: "fixed" | "floating"
  onChange: (value: "fixed" | "floating") => void
  disabled?: boolean
}

export function PriceTypeSelector({ value, onChange, disabled = false }: PriceTypeSelectorProps) {
  return (
    <div className="flex items-center gap-8">
      <Button
        type="button"
        onClick={() => !disabled && onChange("fixed")}
        disabled={disabled}
        className={cn("flex items-center gap-3 cursor-pointer group", disabled && "cursor-not-allowed opacity-50")}
      >
        <div
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
            value === "fixed" ? "border-black" : "border-gray-300 group-hover:border-gray-400",
          )}
        >
          {value === "fixed" && <div className="w-3.5 h-3.5 rounded-full bg-black" />}
        </div>
        <span className={cn("text-base", value === "fixed" ? "text-black" : "text-gray-600")}>Fixed Price</span>
      </Button>

      <Button
        type="button"
        onClick={() => !disabled && onChange("floating")}
        disabled={disabled}
        className={cn("flex items-center gap-3 cursor-pointer group", disabled && "cursor-not-allowed opacity-50")}
      >
        <div
          className={cn(
            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
            value === "floating" ? "border-black" : "border-gray-300 group-hover:border-gray-400",
          )}
        >
          {value === "floating" && <div className="w-3.5 h-3.5 rounded-full bg-black" />}
        </div>
        <span className={cn("text-base", value === "floating" ? "text-black" : "text-gray-600")}>Floating Price</span>
      </Button>
    </div>
  )
}
