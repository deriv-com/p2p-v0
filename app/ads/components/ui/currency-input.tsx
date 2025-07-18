"use client"

import type React from "react"
import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  currency?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  isEditMode?: boolean
  error?: boolean
  label?: string
}

export function CurrencyInput({
  currency = "USD",
  onValueChange,
  placeholder = "0.00",
  value,
  onChange,
  isEditMode = false,
  disabled,
  error = false,
  label = "Enter Amount",
  ...props
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  // Combine the isEditMode prop with any existing disabled prop
  const isDisabled = isEditMode || disabled

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only process changes if not in edit mode
    if (!isEditMode) {
      if (onChange) onChange(e)
      if (onValueChange) onValueChange(e.target.value)
    }
  }

  const showFloating = isFocused || (value && value.toString().length > 0)

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex rounded-lg overflow-hidden border transition-colors duration-200",
          error ? "border-red-500" : isDisabled ? "border-gray-100 bg-gray-50" : "border-gray-200",
        )}
        style={{ borderWidth: "1px" }}
      >
        <div className="flex-1 relative">
          <input
            type="number"
            value={value}
            onChange={handleChange}
            onBlur={() => setIsFocused(false)}
            onFocus={() => setIsFocused(true)}
            placeholder=""
            className={cn(
              "w-full p-4 pt-6 border-0 focus:ring-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              isDisabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "text-gray-900",
            )}
            disabled={isDisabled}
            readOnly={isEditMode}
            aria-readonly={isEditMode}
            aria-invalid={error}
            {...props}
          />

          <label
            className={cn(
              "absolute left-4 text-gray-500 pointer-events-none transition-all duration-200",
              showFloating ? "text-xs top-0.5 bg-white px-1" : "text-sm top-1/2 -translate-y-1/2",
              error ? "text-red-500" : "text-gray-500",
            )}
          >
            {label}
          </label>

          {error && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        <div className="flex items-center justify-center bg-gray-50 px-4 text-gray-500 min-w-[80px] text-center">
          {currency}
        </div>
      </div>
    </div>
  )
}
