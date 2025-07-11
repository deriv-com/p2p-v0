"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { getPaymentMethods } from "@/app/profile/api/api-payment-methods"
import type { PaymentMethod } from "@/app/profile/api/api-payment-methods"

interface AdPaymentMethodsProps {
  onSelectionChange?: (selectedIds: number[]) => void
  initialSelectedIds?: number[]
  maxSelections?: number
}

export default function AdPaymentMethods({
  onSelectionChange,
  initialSelectedIds = [],
  maxSelections = 3,
}: AdPaymentMethodsProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds)
  const [isLoading, setIsLoading] = useState(true)

  const getPaymentMethodColour = (type: string): string => {
    if (type === "bank") {
      return "bg-paymentMethod-bank"
    } else {
      return "bg-paymentMethod-ewallet"
    }
  }

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setIsLoading(true)
        const methods = await getPaymentMethods()
        setPaymentMethods(methods)
      } catch (error) {
        console.error("Failed to fetch payment methods:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentMethods()
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).adPaymentMethodIds = selectedIds
    }
    onSelectionChange?.(selectedIds)
  }, [selectedIds, onSelectionChange])

  const handleCheckboxChange = (methodId: number, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.length >= maxSelections) {
          return prev
        }
        return [...prev, methodId]
      } else {
        return prev.filter((id) => id !== methodId)
      }
    })
  }

  const isMaxSelectionsReached = selectedIds.length >= maxSelections

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3 p-4 border rounded-lg animate-pulse">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Select up to {maxSelections} payment methods ({selectedIds.length}/{maxSelections} selected)
      </div>

      {paymentMethods.map((method) => {
        const isSelected = selectedIds.includes(method.id)
        const isDisabled = !isSelected && isMaxSelectionsReached

        return (
          <div
            key={method.id}
            className={`flex items-center space-x-3 p-4 border rounded-lg transition-colors ${
              isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
            } ${isDisabled ? "opacity-50" : ""}`}
          >
            <div className={`${getPaymentMethodColour(method.type)} rounded-full w-6 h-6`} />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{method.display_name}</div>
              <div className="text-sm text-gray-500">{method.account_identifier}</div>
            </div>
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => handleCheckboxChange(method.id, checked as boolean)}
              disabled={isDisabled}
              className="data-[state=checked]:bg-black data-[state=checked]:border-black border-black"
            />
          </div>
        )
      })}

      {paymentMethods.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          <p>No payment methods available.</p>
          <p className="text-sm mt-2">Please add payment methods in your profile first.</p>
        </div>
      )}
    </div>
  )
}
