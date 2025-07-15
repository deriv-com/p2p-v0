"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, X } from "lucide-react"
import { PaymentMethodBottomSheet } from "./payment-method-bottom-sheet"
import { getPaymentMethodIcon, getPaymentMethodColour, getMethodDisplayDetails } from "@/lib/utils"

interface PaymentMethod {
  id: number
  method: string
  display_name: string
  type: string
  fields: Record<string, any>
}

interface AdPaymentMethodsProps {
  selectedPaymentMethods: PaymentMethod[]
  onPaymentMethodsChange: (methods: PaymentMethod[]) => void
  availablePaymentMethods: PaymentMethod[]
}

export function AdPaymentMethods({
  selectedPaymentMethods,
  onPaymentMethodsChange,
  availablePaymentMethods,
}: AdPaymentMethodsProps) {
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)

  const handleAddPaymentMethod = (method: PaymentMethod) => {
    const isAlreadySelected = selectedPaymentMethods.some((selected) => selected.id === method.id)

    if (!isAlreadySelected) {
      onPaymentMethodsChange([...selectedPaymentMethods, method])
    }
    setIsBottomSheetOpen(false)
  }

  const handleRemovePaymentMethod = (methodId: number) => {
    onPaymentMethodsChange(selectedPaymentMethods.filter((method) => method.id !== methodId))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Payment methods</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsBottomSheetOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {selectedPaymentMethods.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-muted-foreground mb-4">No payment methods selected</div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBottomSheetOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add payment method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {selectedPaymentMethods.map((method) => {
            const displayDetails = getMethodDisplayDetails(method)

            return (
              <Card key={method.id} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${getPaymentMethodColour(method.type)} flex items-center justify-center`}
                      >
                        <img
                          src={getPaymentMethodIcon(method.type) || "/placeholder.svg"}
                          alt={method.display_name}
                          className="w-6 h-6"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{displayDetails.primary}</div>
                        <div className="text-xs text-muted-foreground">{displayDetails.secondary}</div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePaymentMethod(method.id)}
                      className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <PaymentMethodBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        onSelectPaymentMethod={handleAddPaymentMethod}
        availablePaymentMethods={availablePaymentMethods}
        selectedPaymentMethods={selectedPaymentMethods}
      />
    </div>
  )
}
