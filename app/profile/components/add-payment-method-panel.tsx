"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getPaymentMethods } from "@/services/api/api-buy-sell"
import { getPaymentMethodFields, getPaymentMethodIcon, type AvailablePaymentMethod } from "@/lib/utils"

interface AddPaymentMethodPanelProps {
  onClose: () => void
  onAdd: (method: string, fields: Record<string, string>) => void
  isLoading: boolean
}

interface PanelWrapperProps {
  onClose: () => void
  onBack?: () => void
  title: string
  children: React.ReactNode
}

function PanelWrapper({ onClose, onBack, title, children }: PanelWrapperProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/80" onClick={onClose} />
      <div
        className={`fixed inset-y-0 right-0 z-50 bg-white shadow-xl flex flex-col ${
          isMobile ? "inset-0 w-full" : "w-full max-w-md"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-1 border-b relative">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="absolute left-6 top-1/2 -translate-y-1/2">
              <Image src="/icons/back-circle.png" alt="Back" width={32} height={20} />
            </Button>
          )}
          <h2 className="text-xl font-bold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-6 top-1/2 -translate-y-1/2">
            <Image src="/icons/close-circle.png" alt="Close" width={32} height={32} />
          </Button>
        </div>
        {children}
      </div>
    </>
  )
}

export default function AddPaymentMethodPanel({ onClose, onAdd, isLoading }: AddPaymentMethodPanelProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("")
  const [showMethodDetails, setShowMethodDetails] = useState(false)
  const [details, setDetails] = useState<Record<string, string>>({})
  const [instructions, setInstructions] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [charCount, setCharCount] = useState(0)
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<AvailablePaymentMethod[]>([])
  const [isLoadingMethods, setIsLoadingMethods] = useState(true)

  useEffect(() => {
    const fetchAvailablePaymentMethods = async () => {
      try {
        setIsLoadingMethods(true)
        const response = await getPaymentMethods()

        if (response && response.data && Array.isArray(response.data)) {
          setAvailablePaymentMethods(response.data)
        } else if (Array.isArray(response)) {
          setAvailablePaymentMethods(response)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoadingMethods(false)
      }
    }

    fetchAvailablePaymentMethods()
  }, [])

  useEffect(() => {
    setDetails({})
    setErrors({})
    setTouched({})
  }, [selectedMethod])

  useEffect(() => {
    setCharCount(instructions.length)
  }, [instructions])

  const selectedMethodFields = getPaymentMethodFields(selectedMethod, availablePaymentMethods)

  const handleMethodSelect = (paymentMethod: AvailablePaymentMethod) => {
    setSelectedMethod(paymentMethod.method)
    setShowMethodDetails(true)
  }

  const handleBackToMethodList = () => {
    setShowMethodDetails(false)
    setSelectedMethod("")
    setDetails({})
    setErrors({})
    setTouched({})
    setInstructions("")
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedMethod) {
      newErrors.method = "Please select a payment method"
    }

    selectedMethodFields.forEach((field) => {
      if (!details[field.name]?.trim() && field.required) {
        newErrors[field.name] = `${field.label} is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const sanitizeInput = (value: string) => {
    return value.replace(/[^\p{L}0-9\s\-.@_+#(),:;']/gu, "")
  }

  const handleInputChange = (name: string, value: string) => {
    const sanitizedValue = sanitizeInput(value)
    setDetails((prev) => ({ ...prev, [name]: sanitizedValue }))
    setTouched((prev) => ({ ...prev, [name]: true }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleInstructionsChange = (value: string) => {
    const sanitizedValue = sanitizeInput(value)
    setInstructions(sanitizedValue)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedMethodFields.length > 0) {
      const allTouched: Record<string, boolean> = {}
      selectedMethodFields.forEach((field) => {
        allTouched[field.name] = true
      })
      setTouched(allTouched)
    }

    if (validateForm()) {
      const fieldValues = { ...details }
      fieldValues.instructions = instructions.trim() || "-"

      if (selectedMethod === "bank_transfer") {
        fieldValues.bank_code = fieldValues.bank_code || "-"
        fieldValues.branch = fieldValues.branch || "-"
      }

      onAdd(selectedMethod, fieldValues)
    }
  }

  const isFormValid = () => {
    if (!selectedMethod) return false

    return selectedMethodFields.every((field) => {
      if (field.required) {
        return details[field.name]?.trim()
      }
      return true
    })
  }

  if (isLoadingMethods) {
    return (
      <PanelWrapper onClose={onClose} title="Select a payment method">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">Loading payment methods...</div>
        </div>
      </PanelWrapper>
    )
  }

  if (availablePaymentMethods.length === 0 && !isLoadingMethods) {
    return (
      <PanelWrapper onClose={onClose} title="Select a payment method">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-500">No payment methods available</div>
        </div>
      </PanelWrapper>
    )
  }

  if (!showMethodDetails) {
    return (
      <PanelWrapper onClose={onClose} title="Select a payment method">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="space-y-3">
              {availablePaymentMethods.map((paymentMethod) => (
                <Button
                  key={paymentMethod.method}
                  type="button"
                  variant="outline"
                  onClick={() => handleMethodSelect(paymentMethod)}
                  className="w-full p-4 justify-start gap-3 h-auto rounded-lg border border-gray-200 hover:border-gray-300"
                >
                  <Image
                    src={getPaymentMethodIcon(paymentMethod.type) || "/placeholder.svg"}
                    alt={paymentMethod.display_name}
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">{paymentMethod.display_name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PanelWrapper>
    )
  }

  return (
    <PanelWrapper onClose={onClose} onBack={handleBackToMethodList} title="Add payment details">
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {selectedMethodFields.length > 0 && (
            <div className="space-y-4">
              {selectedMethodFields.map((field) => (
                <div key={field.name}>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-500 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <Input
                    id={field.name}
                    type={field.type}
                    value={details[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                  />
                  {touched[field.name] && errors[field.name] && (
                    <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-500 mb-2">
              Instructions
            </label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => handleInstructionsChange(e.target.value)}
              placeholder="Enter your instructions"
              className="min-h-[120px] resize-none"
              maxLength={300}
            />
            <div className="flex justify-end mt-1 text-xs text-gray-500">{charCount}/300</div>
          </div>
        </div>
      </form>

      <div className="p-6 border-t">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading || !selectedMethod || !isFormValid()}
          variant="black"
          className="w-full"
        >
          {isLoading ? "Adding..." : "Add"}
        </Button>
      </div>
    </PanelWrapper>
  )
}
