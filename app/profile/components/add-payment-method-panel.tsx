"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"

interface PaymentMethod {
  id: string
  type: "bank_transfer" | "ewallet"
  name: string
  icon: string
}

interface AddPaymentMethodPanelProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (paymentMethod: any) => void
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "bank_transfer",
    type: "bank_transfer",
    name: "Bank Transfer",
    icon: "/icons/bank-transfer-icon.png",
  },
  {
    id: "ewallet",
    type: "ewallet",
    name: "E-wallet",
    icon: "/icons/ewallet-icon.png",
  },
]

interface PanelWrapperProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
  title: string
  showBackButton?: boolean
  onBack?: () => void
}

const PanelWrapper = ({ children, isOpen, onClose, title, showBackButton, onBack }: PanelWrapperProps) => {
  const isMobile = useIsMobile()

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button onClick={onBack} className="p-1">
              <Image src="/icons/arrow-left-icon.png" alt="Back" width={20} height={20} />
            </button>
          )}
          <h2 className={`text-lg font-semibold ${showBackButton ? "text-left pl-12" : "text-center"}`}>{title}</h2>
        </div>
        <button onClick={onClose} className="p-1">
          <Image src="/icons/close-icon.png" alt="Close" width={20} height={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] p-0">
          {content}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[600px] p-0">{content}</DialogContent>
    </Dialog>
  )
}

export default function AddPaymentMethodPanel({ isOpen, onClose, onAdd }: AddPaymentMethodPanelProps) {
  const [step, setStep] = useState<"select" | "details">("select")
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [instructions, setInstructions] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { showAlert } = useAlertDialog()

  const sanitizeInput = (value: string) => {
    return value.replace(/[^a-zA-Z0-9\s]/g, "")
  }

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setStep("details")
    setFormData({})
    setInstructions("")
  }

  const handleBack = () => {
    if (step === "details") {
      setStep("select")
      setSelectedMethod(null)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value)
    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }))
  }

  const handleInstructionsChange = (value: string) => {
    const sanitizedValue = sanitizeInput(value)
    setInstructions(sanitizedValue)
  }

  const handleSubmit = async () => {
    if (!selectedMethod) return

    const requiredFields = getRequiredFields(selectedMethod.type)
    const missingFields = requiredFields.filter((field) => !formData[field]?.trim())

    if (missingFields.length > 0) {
      showAlert({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        type: "warning",
      })
      return
    }

    setIsLoading(true)

    try {
      const paymentMethodData = {
        type: selectedMethod.type,
        ...formData,
        instructions: instructions.trim(),
      }

      await onAdd(paymentMethodData)

      showAlert({
        title: "Success",
        description: "Payment method added successfully.",
        type: "success",
      })

      onClose()
      setStep("select")
      setSelectedMethod(null)
      setFormData({})
      setInstructions("")
    } catch (error) {
      showAlert({
        title: "Error",
        description: "Failed to add payment method. Please try again.",
        type: "warning",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRequiredFields = (type: string) => {
    switch (type) {
      case "bank_transfer":
        return ["account_number", "bank_name", "account_holder_name"]
      case "ewallet":
        return ["account_number", "account_holder_name"]
      default:
        return []
    }
  }

  const renderFormFields = () => {
    if (!selectedMethod) return null

    const fields = getFormFields(selectedMethod.type)

    return (
      <div className="p-4 space-y-4">
        {fields.map((field) => (
          <div key={field.key} className="space-y-2">
            <Label htmlFor={field.key} className="text-sm font-medium">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.key}
              type={field.type}
              placeholder={field.placeholder}
              value={formData[field.key] || ""}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              className="w-full"
            />
          </div>
        ))}

        <div className="space-y-2">
          <Label htmlFor="instructions" className="text-sm font-medium">
            Instructions (Optional)
          </Label>
          <Textarea
            id="instructions"
            placeholder="Add any additional instructions..."
            value={instructions}
            onChange={(e) => handleInstructionsChange(e.target.value)}
            className="w-full min-h-[80px] resize-none"
            maxLength={300}
          />
          <div className="text-xs text-gray-500 text-right">{instructions.length}/300</div>
        </div>

        <div className="pt-4">
          <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Payment Method"}
          </Button>
        </div>
      </div>
    )
  }

  const getFormFields = (type: string) => {
    switch (type) {
      case "bank_transfer":
        return [
          {
            key: "account_number",
            label: "Account Number",
            type: "text",
            placeholder: "Enter account number",
            required: true,
          },
          { key: "bank_name", label: "Bank Name", type: "text", placeholder: "Enter bank name", required: true },
          {
            key: "account_holder_name",
            label: "Account Holder Name",
            type: "text",
            placeholder: "Enter account holder name",
            required: true,
          },
          {
            key: "branch_code",
            label: "Branch Code",
            type: "text",
            placeholder: "Enter branch code (optional)",
            required: false,
          },
        ]
      case "ewallet":
        return [
          {
            key: "account_number",
            label: "Account Number/ID",
            type: "text",
            placeholder: "Enter account number or ID",
            required: true,
          },
          {
            key: "account_holder_name",
            label: "Account Holder Name",
            type: "text",
            placeholder: "Enter account holder name",
            required: true,
          },
        ]
      default:
        return []
    }
  }

  if (step === "select") {
    return (
      <PanelWrapper isOpen={isOpen} onClose={onClose} title="Select a payment method">
        <div className="p-4 space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method)}
              className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Image src={method.icon || "/placeholder.svg"} alt={method.name} width={24} height={24} />
              <span className="font-medium">{method.name}</span>
            </button>
          ))}
        </div>
      </PanelWrapper>
    )
  }

  return (
    <PanelWrapper isOpen={isOpen} onClose={onClose} title="Add payment details" showBackButton onBack={handleBack}>
      {renderFormFields()}
    </PanelWrapper>
  )
}
