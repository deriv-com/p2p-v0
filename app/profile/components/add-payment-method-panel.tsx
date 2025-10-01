"use client"

import type * as React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getPaymentMethods } from "@/services/api/api-buy-sell"
import { getPaymentMethodFields, getPaymentMethodIcon, type AvailablePaymentMethod } from "@/lib/utils"
import { useAlertDialog } from "@/hooks/use-alert-dialog"

interface AddPaymentMethodPanelProps {
  onClose: () => void
  onAdd: (method: string, fields: Record<string, string>) => void
  isLoading: boolean
  allowedPaymentMethods?: string[]
  isInDialog?: boolean
  show?: boolean
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
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center justify-between gap-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack} className="bg-grayscale-300 px-1">
                <Image src="/icons/arrow-left-icon.png" alt="Back" width={24} height={24} />
              </Button>
            )}
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="bg-grayscale-300 px-1">
            <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
          </Button>
        </div>
        {children}
      </div>
    </>
  )
}

export default function AddPaymentMethodPanel({
  onClose,
  onAdd,
  isLoading,
  allowedPaymentMethods,
  isInDialog = false,
  show = false,
}: AddPaymentMethodPanelProps) {
  const { showAlert, hideAlert } = useAlertDialog()
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

        let methods: AvailablePaymentMethod[] = []
        if (response && response.data && Array.isArray(response.data)) {
          methods = response.data
        } else if (Array.isArray(response)) {
          methods = response
        }

        if (allowedPaymentMethods && allowedPaymentMethods.length > 0) {
          methods = methods.filter((method) =>
            allowedPaymentMethods.some((allowed) => method.method.toLowerCase() === allowed.toLowerCase()),
          )
        }

        setAvailablePaymentMethods(methods)
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoadingMethods(false)
      }
    }

    fetchAvailablePaymentMethods()
  }, [allowedPaymentMethods])

  useEffect(() => {
    setDetails({})
    setErrors({})
    setTouched({})
  }, [selectedMethod])

  useEffect(() => {
    setCharCount(instructions.length)
  }, [instructions])

  useEffect(() => {
    if (!show) {
      setShowMethodDetails(false)
      setSelectedMethod("")
      setDetails({})
      setErrors({})
      setTouched({})
      setInstructions("")
    }
  }, [show])

  const selectedMethodFields = getPaymentMethodFields(selectedMethod, availablePaymentMethods)

  const handleMethodSelect = (paymentMethod: AvailablePaymentMethod) => {
    setSelectedMethod(paymentMethod.method)
    setShowMethodDetails(true)

    if (isInDialog && showAlert) {
      showAlert({
        title: "Add payment details",
        description: <div className="w-full">{renderContent()}</div>,
        showCloseButton: true,
        onClose: () => {
          hideAlert?.()
          onClose()
        },
      })
    }
  }

  const handleBackToMethodList = () => {
    setShowMethodDetails(false)
    setSelectedMethod("")
    setDetails({})
    setErrors({})
    setTouched({})
    setInstructions("")

    if (isInDialog && showAlert) {
      showAlert({
        title: "Add payment method",
        description: <div className="w-full">{renderContent()}</div>,
        showCloseButton: true,
        onClose: () => {
          hideAlert?.()
          onClose()
        },
      })
    }
  }

  const validateInput = (value: string) => {
    const allowedPattern = /^[a-zA-Z0-9\s\-.@_+#(),:;']+$/
    return allowedPattern.test(value)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedMethod) {
      newErrors.method = "Please select a payment method"
    }

    selectedMethodFields.forEach((field) => {
      const value = details[field.name]?.trim()

      if (!value && field.required) {
        newErrors[field.name] = `${field.label} is required`
      } else if (value && !validateInput(value)) {
        newErrors[field.name] = "Only letters, numbers, spaces, and symbols -+.,'#@():; are allowed"
      }
    })

    if (instructions && !validateInput(instructions)) {
      newErrors.instructions = "Only letters, numbers, spaces, and symbols -+.,'#@():; are allowed"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (name: string, value: string) => {
    setDetails((prev) => ({ ...prev, [name]: value }))
    setTouched((prev) => ({ ...prev, [name]: true }))

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    if (value && !validateInput(value)) {
      setErrors((prev) => ({
        ...prev,
        [name]: "Only letters, numbers, spaces, and symbols -+.,'#@():; are allowed",
      }))
    }
  }

  const handleInstructionsChange = (value: string) => {
    setInstructions(value)

    if (errors.instructions) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.instructions
        return newErrors
      })
    }

    if (value && !validateInput(value)) {
      setErrors((prev) => ({
        ...prev,
        instructions: "Only letters, numbers, spaces, and symbols -+.,'#@():; are allowed",
      }))
    }
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

    if (Object.keys(errors).length > 0) return false

    return selectedMethodFields.every((field) => {
      if (field.required) {
        return details[field.name]?.trim()
      }
      return true
    })
  }

  const renderContent = () => {
    if (isLoadingMethods) {
      return (
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="text-gray-500">Loading payment methods...</div>
        </div>
      )
    }

    if (availablePaymentMethods.length === 0 && !isLoadingMethods) {
      return (
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="text-gray-500">No payment methods available</div>
        </div>
      )
    }

    if (!showMethodDetails) {
      return (
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="space-y-3">
              {availablePaymentMethods.map((paymentMethod) => (
                <Button
                  key={paymentMethod.method}
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={() => handleMethodSelect(paymentMethod)}
                  className="w-full p-4 justify-start gap-3 h-auto rounded-lg bg-grayscale-300"
                >
                  <Image
                    src={getPaymentMethodIcon(paymentMethod.type) || "/placeholder.svg"}
                    alt={paymentMethod.display_name}
                    width={24}
                    height={24}
                  />
                  <span className="text-sm font-normal">{paymentMethod.display_name}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <>
        {isInDialog && (
          <div className="flex items-center px-4 py-3 border-b">
            <Button variant="ghost" size="sm" onClick={handleBackToMethodList} className="bg-grayscale-300 px-1 mr-4">
              <Image src="/icons/arrow-left-icon.png" alt="Back" width={24} height={24} />
            </Button>
            <h2 className="text-xl font-bold">Add payment details</h2>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-6">
            {selectedMethodFields.length > 0 && (
              <div className="space-y-4">
                {selectedMethodFields.map((field) => (
                  <div key={field.name}>
                    <Input
                      id={field.name}
                      type={field.type}
                      value={details[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      label={`Enter ${field.label.toLowerCase()}`}
                      required={field.required}
                      variant="floating"
                    />
                    {(touched[field.name] || details[field.name]) && errors[field.name] && (
                      <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => handleInstructionsChange(e.target.value)}
                label="Enter your instructions"
                className="min-h-[120px] resize-none"
                maxLength={300}
                variant="floating"
              />
              {errors.instructions && <p className="mt-1 text-xs text-red-500">{errors.instructions}</p>}
              <div className="flex justify-end mt-1 text-xs text-gray-500">{charCount}/300</div>
            </div>
          </div>
        </form>

        <div className="p-4">
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || !selectedMethod || !isFormValid()}
            className="w-full"
          >
            {isLoading ? "Adding..." : "Add"}
          </Button>
        </div>
      </>
    )
  }

  useEffect(() => {
    if (isInDialog && show && showAlert) {
      showAlert({
        title: showMethodDetails ? "Add payment details" : "Add payment method",
        description: <div className="w-full">{renderContent()}</div>,
        showCloseButton: true,
        onClose: () => {
          hideAlert?.()
          onClose()
        },
      })
    }
    if (isInDialog && !show && hideAlert) {
      hideAlert()
    }
  }, [show, isInDialog, showMethodDetails, isLoadingMethods, availablePaymentMethods, details, errors, instructions])

  if (isInDialog) {
    return null
  }

  const getTitle = () => {
    if (isLoadingMethods || availablePaymentMethods.length === 0) {
      return "Select a payment method"
    }
    return showMethodDetails ? "Add payment details" : "Select a payment method"
  }

  return (
    <PanelWrapper onClose={onClose} onBack={showMethodDetails ? handleBackToMethodList : undefined} title={getTitle()}>
      {renderContent()}
    </PanelWrapper>
  )
}
