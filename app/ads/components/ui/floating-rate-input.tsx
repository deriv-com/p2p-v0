"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FloatingRateInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: boolean
  label?: string
  currency?: string
  marketPrice?: number
  highestPrice?: number
}

export function FloatingRateInput({
  value,
  onChange,
  onBlur,
  error = false,
  label = "Rate",
  currency = "IDR",
  marketPrice,
  highestPrice,
}: FloatingRateInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleIncrement = () => {
    const currentValue = Number.parseFloat(value) || 0
    const newValue = Math.min(currentValue + 0.01, 100)
    onChange(newValue.toFixed(2))
  }

  const handleDecrement = () => {
    const currentValue = Number.parseFloat(value) || 0
    const newValue = Math.max(currentValue - 0.01, -100)
    onChange(newValue.toFixed(2))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value

    if (newValue === "" || newValue === "-") {
      onChange(newValue)
      return
    }

    const numValue = Number.parseFloat(newValue)
    if (!isNaN(numValue) && numValue >= -100 && numValue <= 100) {
      onChange(newValue)
    }
  }

  const showFloating = isFocused || value.length > 0

  const ratePercentage = Number.parseFloat(value) || 0
  const yourPrice = marketPrice ? marketPrice * (1 + ratePercentage / 100) : null

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div
            className={cn(
              "flex rounded-lg overflow-hidden border transition-colors duration-200 bg-white",
              error ? "border-red-500" : "border-gray-200",
            )}
          >
            <div className="flex-1 relative">
              <Input
                type="text"
                value={`${value}%`}
                onChange={handleChange}
                onBlur={() => {
                  setIsFocused(false)
                  onBlur?.()
                }}
                onFocus={() => setIsFocused(true)}
                placeholder=""
                aria-invalid={error}
                variant="floating"
                className="pr-8"
              />
              <label
                className={cn(
                  "absolute left-3 pointer-events-none transition-all duration-200",
                  showFloating ? "text-xs top-2 px-1" : "text-sm top-1/2 -translate-y-1/2",
                  error ? "text-red-500" : "text-black/70",
                )}
              >
                {label}
              </label>
            </div>

            <div className="flex items-center gap-2 px-3 bg-white border-l">
              <Button type="button" onClick={handleDecrement} variant="ghost" size="sm" className="h-8 w-8 p-0 text-lg">
                −
              </Button>
              <Button type="button" onClick={handleIncrement} variant="ghost" size="sm" className="h-8 w-8 p-0 text-lg">
                +
              </Button>
            </div>
          </div>
        </div>
      </div>

      {marketPrice && (
        <div className="text-sm text-grayscale-100">
          Current market price:{" "}
          <span className="font-semibold">
            {marketPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            {currency}
          </span>
        </div>
      )}

      {yourPrice && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-grayscale-100">Your price:</span>
          <span className="text-base font-bold">
            {yourPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-xs font-normal">{currency}</span>
          </span>
        </div>
      )}

      {highestPrice && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-grayscale-100">Highest price in market:</span>
          <span className="text-base font-bold">
            {highestPrice.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            <span className="text-xs font-normal">{currency}</span>
          </span>
        </div>
      )}
    </div>
  )
}
