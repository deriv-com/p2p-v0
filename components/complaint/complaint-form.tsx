"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { OrdersAPI } from "@/services/api"
import { type ComplaintProps, COMPLAINT_OPTIONS } from "./types"

export function ComplaintForm({ isOpen, onClose, onSubmit, orderId }: ComplaintProps) {
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMobile = useIsMobile()

  const handleSubmit = async () => {
    if (selectedOption && !isSubmitting) {
      setIsSubmitting(true)
      try {
        const result = await OrdersAPI.disputeOrder(orderId, selectedOption)
        if (result.errors?.length === 0 || result.success) {
          onSubmit?.()
        }
        setSelectedOption("")
        onClose()
      } catch (error) {
        console.error("Error submitting complaint:", error)
        onClose()
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleClose = () => {
    setSelectedOption("")
    onClose()
  }

  const ComplaintContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 space-y-6">
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
          {COMPLAINT_OPTIONS.map((option) => (
            <div key={option.id} className="flex items-start space-x-3">
              <RadioGroupItem value={option.value} id={option.id} className="mt-1 border-grayscale-100" />
              <Label htmlFor={option.id} className="font-normal text-base leading-relaxed cursor-pointer flex-1 text-grayscale-100">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <div className="text-sm text-gray-600">
            If your issue isn't listed, contact us via live chat for help.
        </div>
      </div>

      <div className="p-4 border-t md:border-t-0">
        <Button vaiant="black" onClick={handleSubmit} disabled={!selectedOption || isSubmitting} className=className="w-full disabled:opacity-[0.24]" size="lg">Submit
        </Button>
      </div>
    </div>
  )

  if (!isOpen) return null

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl px-0">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl font-bold text-center">Submit a complaint</SheetTitle>
          </SheetHeader>
          <ComplaintContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        <div className="flex justify-between items-center px-4 py-1 border-b">
          <h2 className="text-xl font-bold">Submit a complaint</h2>
          <Button onClick={handleClose} variant="ghost" size="icon" className="p-1">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <ComplaintContent />
      </div>
    </div>
  )
}
