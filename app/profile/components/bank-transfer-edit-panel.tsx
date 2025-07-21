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

interface BankTransferEditPanelProps {
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

export default function BankTransferEditPanel({
  paymentMethod,
  onClose,
  onSave,
  isLoading,
}: BankTransferEditPanelProps) {
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

  return (
    <PanelWrapper onClose={onClose}>
      <div className="p-4 space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="bank_name">Bank name</Label>
            <Input
              id="bank_name"
              value={formData.bank_name || ""}
              onChange={(e) => handleInputChange("bank_name", e.target.value)}
              placeholder="Enter bank name"
            />
          </div>

          <div>
            <Label htmlFor="account_number">Account number</Label>
            <Input
              id="account_number"
              value={formData.account_number || formData.account || ""}
              onChange={(e) => handleInputChange("account_number", e.target.value)}
              placeholder="Enter account number"
            />
          </div>

          <div>
            <Label htmlFor="account_holder_name">Account holder name</Label>
            <Input
              id="account_holder_name"
              value={formData.account_holder_name || ""}
              onChange={(e) => handleInputChange("account_holder_name", e.target.value)}
              placeholder="Enter account holder name"
            />
          </div>

          <div>
            <Label htmlFor="instructions">Instructions (optional)</Label>
            <Textarea
              id="instructions"
              value={formData.instructions || ""}
              onChange={(e) => handleInputChange("instructions", e.target.value)}
              placeholder="Enter any additional instructions"
              rows={3}
            />
          </div>
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
