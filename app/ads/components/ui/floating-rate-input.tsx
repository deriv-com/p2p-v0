"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"

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

    // Allow empty string, minus sign, or valid number
    if (newValue === "" || newValue === "-") {
      onChange(newValue)
      return
    }

    // Validate number format
    const numValue = Number.parseFloat(newValue)
    if (!isNaN(numValue) && numValue >= -100 && numValue <= 100) {
      onChange(newValue)
    }
  }

  const showFloating = isFocused || value.length > 0

  // Calculate your price based on market price and rate
  const calculateYourPrice = () => {
    if (!marketPrice || !value) return null
    const rateValue = Number.parseFloat(value) || 0
    const yourPrice = marketPrice * (1 + rateValue / 100)
    return yourPrice.toFixed(2)
  }

  const yourPrice = calculateYourPrice()

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
              <input
                type="text"
                value={value}
                onChange={handleChange}
                onBlur={() => {
                  setIsFocused(false)
                  onBlur?.()
                }}
                onFocus={() => setIsFocused(true)}
                placeholder=""
                className="w-full p-4 pt-6 border-0 focus:ring-0 focus:outline-none text-gray-900"
                aria-invalid={error}
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

            <div className="flex items-center gap-2 px-3 bg-white">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-10 h-10 flex items-center justify-center text-2xl text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                −
              </button>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-10 h-10 flex items-center justify-center text-2xl text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-full">
            <div className="flex-1 relative">
              <div className="p-4 pt-6 text-gray-500">{/* Placeholder for consistency */}</div>
              <label className="absolute left-3 top-2 text-xs text-black/70 px-1">Sell quantity</label>
            </div>
            <div className="flex items-center justify-center bg-slate-75 px-4 text-gray-500 min-w-[80px] text-center">
              USD
            </div>
          </div>
        </div>
      </div>

      {marketPrice && (
        <div className="text-sm text-gray-600">
          Current market price:{" "}
          {marketPrice.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{" "}
          {currency}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-gray-50 rounded-lg">
        {yourPrice && marketPrice && (
          <div className="flex-1 flex items-center justify-between">
            <span className="text-sm text-gray-600">Your price:</span>
            <span className="text-lg font-bold text-black">
              {Number.parseFloat(yourPrice).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              <span className="text-sm font-normal text-gray-600">{currency}</span>
            </span>
          </div>
        )}

        {yourPrice && marketPrice && highestPrice && <div className="w-full h-[1px] md:w-px md:h-6 bg-gray-300" />}

        {highestPrice && (
          <div className="flex-1 flex items-center justify-between">
            <span className="text-sm text-gray-600">Highest price in market:</span>
            <span className="text-lg font-bold text-black">
              {highestPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              <span className="text-sm font-normal text-gray-600">{currency}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
