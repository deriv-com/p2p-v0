"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BankTransferEditPanelProps {
  paymentMethod: {
    id: string
    type: string
    bank_name: string
    account_number: string
    account_holder_name: string
  }
  onSave: (data: any) => void
  onCancel: () => void
}

export default function BankTransferEditPanel({ paymentMethod, onSave, onCancel }: BankTransferEditPanelProps) {
  const [formData, setFormData] = useState({
    bank_name: paymentMethod.bank_name || "",
    account_number: paymentMethod.account_number || "",
    account_holder_name: paymentMethod.account_holder_name || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Edit Bank Transfer Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input
              id="bank_name"
              value={formData.bank_name}
              onChange={(e) => handleInputChange("bank_name", e.target.value)}
              placeholder="Enter bank name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number</Label>
            <Input
              id="account_number"
              value={formData.account_number}
              onChange={(e) => handleInputChange("account_number", e.target.value)}
              placeholder="Enter account number"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_holder_name">Account Holder Name</Label>
            <Input
              id="account_holder_name"
              value={formData.account_holder_name}
              onChange={(e) => handleInputChange("account_holder_name", e.target.value)}
              placeholder="Enter account holder name"
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" variant="default">
              Save Details
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
