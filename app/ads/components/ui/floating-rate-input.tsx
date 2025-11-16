"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FloatingRateInputProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: boolean
  currency?: string
  marketPrice?: number
}

export function FloatingRateInput({
  value,
  onChange,
  onBlur,
  error = false,
  currency = "IDR",
  marketPrice,
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
                className="pr-8 border-0"
              />
            </div>

            <div className="flex items-center gap-2 px-3 bg-white border-l">
              <Button type="button" onClick={handleDecrement} variant="ghost" size="sm" className="h-8 w-8 p-0 text-lg">
                <Image src="/icons/subtract-icon.png" alt="Filter" width={16} height={16} />
              </Button>
              <Button type="button" onClick={handleIncrement} variant="ghost" size="sm" className="h-8 w-8 p-0 text-lg">
                <Image src="/icons/subtract-icon.png" alt="Filter" width={16} height={16} />
              </Button>
            </div>
          </div>
          {marketPrice && (
            <div className="text-xs text-grayscale-text-muted ml-4">
              Current market price:{" "}
              <span>
                {marketPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {currency}
              </span>
            </div>
          )}
        </div>
      </div>
      {yourPrice && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-grayscale-text-muted">Your rate:</span>
          <span className="text-slate-1200">
            {yourPrice.toLocaleString(undefined, {
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
