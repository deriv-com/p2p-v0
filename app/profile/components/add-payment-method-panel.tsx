"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface AddPaymentMethodPanelProps {
  onClose: () => void
  onAdd: (method: string, fields: Record<string, string>) => Promise<void>
  isLoading: boolean
}

const paymentMethodTypes = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "ewallet", label: "E-Wallet" },
  { value: "crypto", label: "Cryptocurrency" },
]

const fieldConfigs = {
  bank_transfer: [
    { key: "bankName", label: "Bank Name", type: "text", required: true },
    { key: "accountNumber", label: "Account Number", type: "text", required: true },
    { key: "accountHolder", label: "Account Holder Name", type: "text", required: true },
    { key: "routingNumber", label: "Routing Number", type: "text", required: false },
  ],
  ewallet: [
    { key: "email", label: "Email Address", type: "email", required: true },
    { key: "phoneNumber", label: "Phone Number", type: "tel", required: false },
  ],
  crypto: [
    { key: "walletAddress", label: "Wallet Address", type: "text", required: true },
    { key: "network", label: "Network", type: "text", required: true },
  ],
}

export default function AddPaymentMethodPanel({ onClose, onAdd, isLoading }: AddPaymentMethodPanelProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("")
  const [fields, setFields] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }))
    }
  }

  const validateFields = () => {
    const newErrors: Record<string, string> = {}
    const config = fieldConfigs[selectedMethod as keyof typeof fieldConfigs]

    if (!config) return false

    config.forEach((field) => {
      if (field.required && !fields[field.key]?.trim()) {
        newErrors[field.key] = `${field.label} is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMethod) {
      return
    }

    if (!validateFields()) {
      return
    }

    await onAdd(selectedMethod, fields)
  }

  const currentFields = selectedMethod ? fieldConfigs[selectedMethod as keyof typeof fieldConfigs] : []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Add Payment Method</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="method-type">Payment Method Type</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method type" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethodTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentFields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id={field.key}
                  type={field.type}
                  value={fields[field.key] || ""}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  className={errors[field.key] ? "border-red-500" : ""}
                />
                {errors[field.key] && <p className="text-sm text-red-500">{errors[field.key]}</p>}
              </div>
            ))}

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedMethod || isLoading} className="flex-1">
                {isLoading ? "Adding..." : "Add Method"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
