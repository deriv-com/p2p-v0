"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { getPaymentMethodColour } from "@/lib/utils"

interface PaymentMethod {
  id: number
  method: string
  display_name: string
  type: string
  fields: Record<string, any>
}

interface AdPaymentMethodsProps {
  availablePaymentMethods: PaymentMethod[]
  selectedPaymentMethods: number[]
  onSelectionChange: (selectedIds: number[]) => void
  maxSelections?: number
}

export default function AdPaymentMethods({
  availablePaymentMethods,
  selectedPaymentMethods,
  onSelectionChange,
  maxSelections = 3,
}: AdPaymentMethodsProps) {
  const [localSelectedMethods, setLocalSelectedMethods] = useState<number[]>(selectedPaymentMethods)

  useEffect(() => {
    setLocalSelectedMethods(selectedPaymentMethods)
  }, [selectedPaymentMethods])

  const handleCheckboxChange = (methodId: number, checked: boolean) => {
    let newSelection: number[]

    if (checked) {
      if (localSelectedMethods.length >= maxSelections) {
        return // Don't allow more than max selections
      }
      newSelection = [...localSelectedMethods, methodId]
    } else {
      newSelection = localSelectedMethods.filter((id) => id !== methodId)
    }

    setLocalSelectedMethods(newSelection)
    onSelectionChange(newSelection)
  }

  const handleCardClick = (methodId: number) => {
    const isSelected = localSelectedMethods.includes(methodId)
    handleCheckboxChange(methodId, !isSelected)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">Select up to {maxSelections} payment methods</div>

      <div className="grid grid-cols-1 gap-3">
        {availablePaymentMethods.map((method) => {
          const isSelected = localSelectedMethods.includes(method.id)
          const isDisabled = !isSelected && localSelectedMethods.length >= maxSelections

          return (
            <Card
              key={method.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "ring-2 ring-primary bg-primary/5"
                  : isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-muted/50"
              }`}
              onClick={() => !isDisabled && handleCardClick(method.id)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className={`${getPaymentMethodColour(method.type)} rounded-full w-6 h-6`} />
                  <div>
                    <div className="font-medium text-sm">{method.display_name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {method.type === "bank" ? "Bank transfer" : method.type}
                    </div>
                  </div>
                </div>

                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => handleCheckboxChange(method.id, !!checked)}
                  disabled={isDisabled}
                  className="!border-black data-[state=checked]:!bg-black data-[state=checked]:!border-black"
                />
              </CardContent>
            </Card>
          )
        })}
      </div>

      {localSelectedMethods.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {localSelectedMethods.length} of {maxSelections} payment methods selected
        </div>
      )}
    </div>
  )
}
