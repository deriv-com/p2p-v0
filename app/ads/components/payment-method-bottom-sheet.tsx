"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface PaymentMethodBottomSheetProps {
  open: boolean
  setOpen: (open: boolean) => void
  selectedMethods: string[]
  setSelectedMethods: (methods: string[]) => void
}

const PaymentMethodBottomSheet = ({
  open,
  setOpen,
  selectedMethods,
  setSelectedMethods,
}: PaymentMethodBottomSheetProps) => {
  const [initialSelectedMethods, setInitialSelectedMethods] = useState<string[]>(selectedMethods)

  useEffect(() => {
    if (open) {
      setInitialSelectedMethods(selectedMethods)
    }
  }, [open, selectedMethods])

  const handleReset = () => {
    setSelectedMethods(initialSelectedMethods)
  }

  const handleSelect = () => {
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Payment Methods</SheetTitle>
          <SheetDescription>Select the payment methods you want to use.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">{/* Payment methods will go here */}</div>
        <div className="flex justify-between mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full h-[48px] border-black text-black rounded-full"
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={handleSelect}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full h-[48px] bg-primary text-white rounded-full ml-2"
          >
            Select
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default PaymentMethodBottomSheet
