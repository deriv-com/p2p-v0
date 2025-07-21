"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import Image from "next/image"

interface PaymentMethod {
  id: string
  name: string
  type: string
  category: "bank_transfer" | "e_wallet" | "other"
  details: Record<string, any>
  instructions?: string
  isDefault?: boolean
}

interface EditPaymentMethodPanelProps {
  paymentMethod: PaymentMethod
  onClose: () => void
  onSave: (id: string, fields: Record<string, string>) => void
  isLoading: boolean
}

interface PanelWrapperProps {
  children: React.ReactNode
  onClose: () => void
}

function PanelWrapper({ children, onClose }: PanelWrapperProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)

    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Edit payment method</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Edit payment method</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
      </div>
    </div>
  )
}

export default function EditPaymentMethodPanel({
  paymentMethod,
  onClose,
  onSave,
  isLoading,
}: EditPaymentMethodPanelProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})

  useEffect(() => {
    const initialData: Record<string, string> = {}
    if (paymentMethod.details) {
      Object.entries(paymentMethod.details).forEach(([key, value]) => {
        if (typeof value === "object" && value !== null && "value" in value) {
          initialData[key] = String(value.value || "")
        } else {
          initialData[key] = String(value || "")
        }
      })
    }
    setFormData(initialData)
  }, [paymentMethod])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = () => {
    onSave(paymentMethod.id, formData)
  }

  const getFieldLabel = (key: string) => {
    const labelMap: Record<string, string> = {
      account: "Account ID",
      account_id: "Account ID",
      wallet_id: "Wallet ID",
      phone_number: "Phone Number",
      email: "Email",
      username: "Username",
      instructions: "Instructions",
    }
    return labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")
  }

  const renderField = (key: string, value: any) => {
    if (key === "instructions") {
      return (
        <div key={key}>
          <Label htmlFor={key}>Instructions (optional)</Label>
          <Textarea
            id={key}
            value={formData[key] || ""}
            onChange={(e) => handleInputChange(key, e.target.value)}
            placeholder="Enter any additional instructions"
            rows={3}
          />
        </div>
      )
    }

    return (
      <div key={key}>
        <Label htmlFor={key}>{getFieldLabel(key)}</Label>
        <Input
          id={key}
          value={formData[key] || ""}
          onChange={(e) => handleInputChange(key, e.target.value)}
          placeholder={`Enter ${getFieldLabel(key).toLowerCase()}`}
        />
      </div>
    )
  }

  return (
    <PanelWrapper onClose={onClose}>
      <div className="p-4 space-y-4">
        <div className="space-y-4">
          {paymentMethod.details &&
            Object.entries(paymentMethod.details)
              .filter(([key]) => key !== "method_type")
              .map(([key, value]) => renderField(key, value))}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </PanelWrapper>
  )
}
