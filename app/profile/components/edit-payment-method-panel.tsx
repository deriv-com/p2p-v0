"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { PanelWrapper } from "@/components/ui/panel-wrapper"

interface EditPaymentMethodPanelProps {
  onClose: () => void
  onSave: (id: string, fields: Record<string, string>) => void
  isLoading: boolean
  paymentMethod: {
    id: string
    name: string
    type: string
    details: Record<
      string,
      {
        display_name: string
        required: boolean
        value: string
      }
    >
  }
}

export default function EditPaymentMethodPanel({
  onClose,
  onSave,
  isLoading,
  paymentMethod,
}: EditPaymentMethodPanelProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!paymentMethod?.details) return

    setFieldValues(
      Object.fromEntries(
        Object.entries(paymentMethod.details).map(([fieldName, fieldConfig]) => [fieldName, fieldConfig.value || ""]),
      ),
    )
  }, [paymentMethod])

  const validateInput = (value: string) => {
    const allowedPattern = /^[a-zA-Z0-9\s\-.@_+#(),:;']+$/
    return allowedPattern.test(value)
  }

  const handleInputChange = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldName]: value }))

    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }

    if (value && !validateInput(value)) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "Only letters, numbers, spaces, and symbols -+.,'#@():; are allowed",
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    Object.entries(paymentMethod.details).forEach(([fieldName, fieldConfig]) => {
      const value = fieldValues[fieldName]?.trim()

      if (!value && fieldConfig.required) {
        newErrors[fieldName] = `${fieldConfig.display_name} is required`
      } else if (value && !validateInput(value)) {
        newErrors[fieldName] = "Only letters, numbers, spaces, and symbols -+.,'#@():; are allowed"
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm() && isFormValid()) {
      onSave(paymentMethod.id, fieldValues)
    }
  }

  const getFieldType = (fieldName: string): string => {
    if (fieldName.includes("phone")) return "tel"
    if (fieldName.includes("email")) return "email"
    return "text"
  }

  const isFormValid = (): boolean => {
    if (!paymentMethod?.details) return false

    if (Object.keys(errors).length > 0) return false

    return Object.entries(paymentMethod.details)
      .filter(([, fieldConfig]) => fieldConfig.required)
      .every(([fieldName]) => {
        const currentValue = fieldValues[fieldName]
        return currentValue && currentValue.trim() !== ""
      })
  }

  if (!paymentMethod) {
    return (
      <PanelWrapper onClose={onClose}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      </PanelWrapper>
    )
  }

  return (
    <PanelWrapper onClose={onClose}>
      <h2 className="text-2xl font-bold p-4 pb-0">Edit payment details</h2>
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="space-y-4">
            {Object.entries(paymentMethod.details).map(([fieldName, fieldConfig]) => (
              <div key={fieldName}>
                {fieldName === "instructions" ? (
                  <div>
                    <Textarea
                      id={fieldName}
                      value={fieldValues[fieldName] || ""}
                      onChange={(e) => handleInputChange(fieldName, e.target.value)}
                      label={`Enter ${fieldConfig.display_name.toLowerCase()}`}
                      className="min-h-[120px] resize-none"
                      maxLength={300}
                      variant="floating"
                    />
                    {errors[fieldName] && <p className="mt-1 text-xs text-red-500">{errors[fieldName]}</p>}
                    <div className="flex justify-end mt-1 text-xs text-gray-500">
                      {(fieldValues[fieldName] || "").length}/300
                    </div>
                  </div>
                ) : (
                  <div>
                    <Input
                      id={fieldName}
                      type={getFieldType(fieldName)}
                      value={fieldValues[fieldName] || ""}
                      onChange={(e) => handleInputChange(fieldName, e.target.value)}
                      label={`Enter ${fieldConfig.display_name.toLowerCase()}`}
                      required={field.required}
                      variant="floating"
                    />
                    {errors[fieldName] && <p className="mt-1 text-xs text-red-500">{errors[fieldName]}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>

      <div className="p-4 flex justify-end">
        <Button type="button" onClick={handleSubmit} disabled={isLoading || !isFormValid()} className="w-full md:w-auto">
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </PanelWrapper>
  )
}
