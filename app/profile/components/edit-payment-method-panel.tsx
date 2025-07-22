"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface EditPaymentMethodPanelProps {
  paymentMethod: {
    id: string
    type: string
    display_name: string
    fields: Record<string, any>
  }
  onSave: (data: any) => void
  onCancel: () => void
}

export default function EditPaymentMethodPanel({ paymentMethod, onSave, onCancel }: EditPaymentMethodPanelProps) {
  const [formData, setFormData] = useState({
    display_name: paymentMethod.display_name || "",
    ...paymentMethod.fields,
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
        <CardTitle>Edit Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={formData.display_name}
              onChange={(e) => handleInputChange("display_name", e.target.value)}
              placeholder="Enter display name"
              required
            />
          </div>

          {Object.entries(paymentMethod.fields).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</Label>
              <Input
                id={key}
                value={formData[key] || ""}
                onChange={(e) => handleInputChange(key, e.target.value)}
                placeholder={`Enter ${key.replace(/_/g, " ")}`}
                required
              />
            </div>
          ))}

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
