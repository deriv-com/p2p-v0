"use client"

import type * as React from "react"
import { useCallback, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { getPaymentMethods } from "@/services/api/api-buy-sell"
import { getPaymentMethodFields, getPaymentMethodIcon, type AvailablePaymentMethod } from "@/lib/utils"
import { PanelWrapper } from "@/components/ui/panel-wrapper"
import EmptyState from "@/components/empty-state"
import { useTranslations } from "@/lib/i18n/use-translations"

interface AddPaymentMethodPanelProps {
  onAdd: (method: string, fields: Record<string, string>) => void
  isLoading: boolean
  allowedPaymentMethods?: string[]
  onMethodSelect?: (method: string) => void
  onBack?: () => void
  selectedMethod?: string
  onClose?: () => void
}

export default function AddPaymentMethodPanel({
  onAdd,
  isLoading,
  allowedPaymentMethods,
  onMethodSelect,
  onBack,
  selectedMethod: selectedMethodProp,
  onClose,
}: AddPaymentMethodPanelProps) {
  const [selectedMethodState, setSelectedMethodState] = useState<string>("")
  const selectedMethod = selectedMethodProp || selectedMethodState
  const [showMethodDetails, setShowMethodDetails] = useState(!!selectedMethodProp)
  const [details, setDetails] = useState<Record<string, string>>({})
  const [instructions, setInstructions] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [charCount, setCharCount] = useState(0)
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<AvailablePaymentMethod[]>([])
  const [isLoadingMethods, setIsLoadingMethods] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const { t } = useTranslations()

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
    return () => {
      setShowMethodDetails(false)
      setSelectedMethodState("")
      setDetails({})
      setErrors({})
      setTouched({})
      setInstructions("")
      setSearchQuery("")
    }
  }, [])

  const selectedMethodFields = getPaymentMethodFields(selectedMethod, availablePaymentMethods)

  const handleMethodSelect = (paymentMethod: AvailablePaymentMethod) => {
    if (onMethodSelect) {
      onMethodSelect(paymentMethod.method)
    } else {
      setSelectedMethodState(paymentMethod.method)
      setShowMethodDetails(true)
    }
  }

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleBackToMethodList = () => {
    setShowMethodDetails(false)
    setSelectedMethodState("")
    setDetails({})
    setErrors({})
    setTouched({})
    setInstructions("")
    setSearchQuery("")
    onBack?.()
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

  if (isLoadingMethods) {
    if (onClose) {
      return (
        <PanelWrapper onClose={onClose}>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">{t("paymentMethod.loadingPaymentMethods")}</div>
          </div>
        </PanelWrapper>
      )
    }
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">{t("paymentMethod.loadingPaymentMethods")}</div>
      </div>
    )
  }

  if (availablePaymentMethods.length === 0 && !isLoadingMethods) {
    if (onClose) {
      return (
        <PanelWrapper onClose={onClose}>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">{t("paymentMethod.noPaymentMethodsAvailable")}</div>
          </div>
        </PanelWrapper>
      )
    }
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">{t("paymentMethod.noPaymentMethodsAvailable")}</div>
      </div>
    )
  }

  if (!showMethodDetails && !selectedMethodProp) {
    const filteredPaymentMethods = availablePaymentMethods.filter((method) =>
      method.display_name.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    const methodSelectionContent = (
      <>
        <h2 className="text-2xl font-bold p-4 pb-0">{t("paymentMethod.selectPaymentMethod")}</h2>
        <div className="p-4 pb-2">
          <div className="relative">
            <Image
              src="/icons/search-icon-custom.png"
              alt="Search"
              width={24}
              height={24}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <Input
              placeholder={t("paymentMethod.search")}
              value={searchQuery}
              onChange={handleSearchChange}
              className="text-base pl-10 pr-10 h-8 md:h-14 border-grayscale-500 focus:border-black rounded-lg"
              autoComplete="off"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 hover:bg-transparent"
              >
                <Image src="/icons/clear-search-icon.png" alt="Clear search" width={24} height={24} />
              </Button>
            )}
          </div>
        </div>
        <div className="p-4 pt-2 space-y-3 overflow-y-auto mb-8">
          {filteredPaymentMethods.length > 0 ? (
            filteredPaymentMethods.map((paymentMethod) => (
              <Button
                key={paymentMethod.method}
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => handleMethodSelect(paymentMethod)}
                className="w-full p-4 rounded-none justify-start gap-3 h-auto border-b border-grayscale-500 hover:bg-transparent"
              >
                <Image
                  src={getPaymentMethodIcon(paymentMethod.type) || "/placeholder.svg"}
                  alt={paymentMethod.display_name}
                  width={24}
                  height={24}
                />
                <span className="text-sm font-normal text-slate-1200">{paymentMethod.display_name}</span>
              </Button>
            ))
          ) : (
            <EmptyState
              title={t("paymentMethod.paymentMethodUnavailable")}
              description={t("paymentMethod.searchDifferent")}
              redirectToAds={false}
            />
          )}
        </div>
      </>
    )

    if (onClose) {
      return <PanelWrapper onClose={onClose}>{methodSelectionContent}</PanelWrapper>
    }

    return <div className="w-full">{methodSelectionContent}</div>
  }

  const formContent = (
    <>
      <div className="flex items-center gap-4 p-4 pb-0">
        <h2 className="text-2xl font-bold">{t("paymentMethod.addPaymentDetails")}</h2>
      </div>
      <form onSubmit={handleSubmit} className="overflow-y-auto">
        <div className="p-4 space-y-4">
          {selectedMethodFields.length > 0 && (
            <div className="space-y-4">
              {selectedMethodFields.map((field) => (
                <div key={field.name}>
                  <Input
                    id={field.name}
                    type={field.type}
                    value={details[field.name] || ""}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    label={`${t("profile.enterField", { field: field.label.toLowerCase() })}`}
                    required={field.required}
                    variant="floating"
                    maxLength={30}
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
              label={t("paymentMethod.enterInstructions")}
              className="min-h-[120px] resize-none"
              maxLength={300}
              variant="floating"
            />
            {errors.instructions && <p className="mt-1 text-xs text-red-500">{errors.instructions}</p>}
            <div className="flex justify-end mt-1 text-xs text-gray-500">{charCount}/300</div>
          </div>
        </div>
      </form>

      <div className="p-4 flex justify-end">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading || !selectedMethod || !isFormValid()}
          className="w-full md:w-auto"
        >
          {isLoading ? (
            <Image src="/icons/spinner.png" alt="Loading" width={20} height={20} className="animate-spin" />
          ) : (
            t("common.add")
          )}
        </Button>
      </div>
    </>
  )

  if (onClose) {
    return (
      <PanelWrapper onBack={!selectedMethodProp ? handleBackToMethodList : undefined} onClose={onClose}>
        {formContent}
      </PanelWrapper>
    )
  }

  return <div className="w-full h-[calc(100%-60px)]">{formContent}</div>
}
