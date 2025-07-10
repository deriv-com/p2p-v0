"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import AdDetailsForm from "../components/ad-details-form"
import PaymentDetailsForm from "../components/payment-details-form"
import StatusModal from "../components/ui/status-modal"
import StatusBottomSheet from "../components/ui/status-bottom-sheet"
import type { AdFormData, StatusModalState } from "../types"
import { createAd, updateAd } from "../api/api-ads"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { X, ArrowLeft } from "lucide-react"
import { ProgressSteps } from "../components/ui/progress-steps"

const getPageTitle = (isEditMode: boolean, adType?: string) => {
  if (isEditMode && adType) {
    return `Edit ${adType === "sell" ? "Sell" : "Buy"} ad`
  }
  return "Create new ad"
}

const getButtonText = (isEditMode: boolean, isSubmitting: boolean, currentStep: number) => {
  if (isSubmitting) {
    return isEditMode ? "Saving..." : "Creating..."
  }

  if (currentStep === 0) {
    return "Next"
  }

  return isEditMode ? "Save Details" : "Create Ad"
}

const getErrorTitle = (isEditMode: boolean) => {
  return isEditMode ? "Failed to update ad" : "Failed to create ad"
}

const getActionButtonText = (isEditMode: boolean) => {
  return isEditMode ? "Update ad" : "Create ad"
}

export default function CreateAdPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()

  const [localEditMode, setLocalEditMode] = useState<boolean>(false)
  const [localAdId, setLocalAdId] = useState<string | null>(null)

  useEffect(() => {
    const mode = searchParams.get("mode")
    const id = searchParams.get("id")

    if (mode === "edit" && id) {
      setLocalEditMode(true)
      setLocalAdId(id)
    }
  }, [searchParams])

  const isEditMode = localEditMode
  const adId = localAdId

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<AdFormData>>({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [validationErrors, setValidationErrors] = useState<any>({})
  const [statusModal, setStatusModal] = useState<StatusModalState>({
    show: false,
    type: "success",
    title: "",
    message: "",
    subMessage: "",
    adType: "",
    adId: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [adFormValid, setAdFormValid] = useState(false)
  const [paymentFormValid, setPaymentFormValid] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [hasSelectedPaymentMethods, setHasSelectedPaymentMethods] = useState(false)

  const formDataRef = useRef<Partial<AdFormData>>({})

  const steps = [
    { title: "Set Type and Price", completed: currentStep > 0 },
    { title: "Set payment details", completed: currentStep > 1 },
    { title: "Set ad conditions", completed: currentStep > 2 },
  ]

  interface SuccessData {
    type?: string
    id?: string
  }

  const convertToSnakeCase = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
  }

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true)

        if (isEditMode) {
          const editData = localStorage.getItem("editAdData")
          if (editData) {
            const parsedData = JSON.parse(editData)

            let rateValue = 0
            if (parsedData.rate && parsedData.rate.value) {
              const rateMatch = parsedData.rate.value.match(/([A-Z]+)\s+(\d+(?:\.\d+)?)/)
              if (rateMatch && rateMatch[2]) {
                rateValue = Number.parseFloat(rateMatch[2])
              }
            }

            let minAmount = 0
            let maxAmount = 0

            if (typeof parsedData.limits === "string") {
              const limitsMatch = parsedData.limits.match(/([A-Z]+)\s+(\d+(?:\.\d+)?)\s+-\s+(\d+(?:\.\d+)?)/)
              if (limitsMatch) {
                minAmount = Number.parseFloat(limitsMatch[2])
                maxAmount = Number.parseFloat(limitsMatch[3])
              }
            } else if (parsedData.limits && typeof parsedData.limits === "object") {
              minAmount = parsedData.limits.min || 0
              maxAmount = parsedData.limits.max || 0
            }

            let paymentMethodNames: string[] = []
            let paymentMethodIds: number[] = []

            if (parsedData.paymentMethods && Array.isArray(parsedData.paymentMethods)) {
              if (parsedData.type?.toLowerCase() === "buy") {
                paymentMethodNames = parsedData.paymentMethods.map((methodName: string) => {
                  if (methodName.includes("_") || methodName === methodName.toLowerCase()) {
                    return methodName
                  }
                  return convertToSnakeCase(methodName)
                })
              } else {
                paymentMethodIds = parsedData.paymentMethods
                  .map((id: any) => Number(id))
                  .filter((id: number) => !isNaN(id))

                if (typeof window !== "undefined") {
                  ;(window as any).adPaymentMethodIds = paymentMethodIds
                }
              }
            }

            const formattedData: Partial<AdFormData> = {
              type: parsedData.type?.toLowerCase() === "sell" ? "sell" : "buy",
              totalAmount: parsedData.available?.current || 0,
              fixedRate: rateValue,
              minAmount: minAmount,
              maxAmount: maxAmount,
              paymentMethods: paymentMethodNames,
              payment_method_ids: paymentMethodIds,
              instructions: parsedData.description || "",
            }

            setFormData(formattedData)
            formDataRef.current = formattedData
          }
        }
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [isEditMode])

  useEffect(() => {
    const checkSelectedPaymentMethods = () => {
      if (formData.type === "sell" && typeof window !== "undefined") {
        const selectedIds = (window as any).adPaymentMethodIds || []
        setHasSelectedPaymentMethods(selectedIds.length > 0)
      }
    }

    checkSelectedPaymentMethods()
    const interval = setInterval(checkSelectedPaymentMethods, 100)

    return () => clearInterval(interval)
  }, [formData.type])

  useEffect(() => {
    const handleFormValidation = (event: CustomEvent) => {
      setIsFormValid(event.detail.isValid)
      setFormData((prev) => ({ ...prev, ...event.detail.formData }))
    }

    document.addEventListener("adFormValidationChange", handleFormValidation as EventListener)
    return () => {
      document.removeEventListener("adFormValidationChange", handleFormValidation as EventListener)
    }
  }, [])

  const handleAdDetailsNext = (data: Partial<AdFormData>, errors?: Record<string, string>) => {
    const updatedData = { ...formData, ...data }
    setFormData(updatedData)
    formDataRef.current = updatedData

    if (!errors || Object.keys(errors).length === 0) {
      setCurrentStep(2)
    } else {
      setValidationErrors(errors)
    }
  }

  const handlePaymentDetailsNext = (data: Partial<AdFormData>, errors?: Record<string, string>) => {
    const updatedData = { ...formData, ...data }
    setFormData(updatedData)
    formDataRef.current = updatedData

    if (!errors || Object.keys(errors).length === 0) {
      setCurrentStep(3)
    } else {
      setValidationErrors(errors)
    }
  }

  const handleBottomSheetOpenChange = (isOpen: boolean) => {
    setIsBottomSheetOpen(isOpen)
  }

  const handleNext = (data: Partial<AdFormData>) => {
    // Placeholder for handleNext logic
  }

  const formatErrorMessage = (errors: any[]): string => {
    if (!errors || errors.length === 0) {
      return "An unknown error occurred"
    }

    if (errors[0].code === "AdvertExchangeRateDuplicate") {
      const error = new Error(
        "You have another active ad with the same rate for this currency pair and order type. Set a different rate.",
      )
      error.name = "AdvertExchangeRateDuplicate"
      throw error
    }

    if (errors[0].code === "AdvertOrderRangeOverlap") {
      const error = new Error(
        "Change the minimum and/or maximum order limit for this ad. The range between these limits must not overlap with another active ad you created for this currency pair and order type.",
      )
      error.name = "AdvertOrderRangeOverlap"
      throw error
    }

    if (errors[0].message) {
      return errors[0].message
    }

    if (errors[0].code) {
      const errorCodeMap: Record<string, string> = {
        AdvertLimitReached: "You've reached the maximum number of ads allowed.",
        InvalidExchangeRate: "The exchange rate you provided is invalid.",
        InvalidOrderAmount: "The order amount limits are invalid.",
        InsufficientBalance: "You don't have enough balance to create this ad.",
        AdvertTotalAmountExceeded: "The total amount exceeds your available balance. Please enter a smaller amount.",
      }

      if (errorCodeMap[errors[0].code]) {
        const error = new Error(errorCodeMap[errors[0].code])
        error.name = errors[0].code
        throw error
      }

      return `Error: ${errors[0].code}. Please try again or contact support.`
    }

    return "There was an error processing your request. Please try again."
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const selectedPaymentMethodIds = formData.type === "sell" ? (window as any).adPaymentMethodIds || [] : []

      if (isEditMode && adId) {
        const payload = {
          is_active: true,
          minimum_order_amount: formData.minAmount || 0,
          maximum_order_amount: formData.maxAmount || 0,
          available_amount: formData.totalAmount || 0,
          exchange_rate: formData.fixedRate || 0,
          exchange_rate_type: "fixed",
          order_expiry_period: 15,
          description: formData.instructions || "",
          ...(formData.type === "buy"
            ? { payment_method_names: formData.paymentMethods || [] }
            : { payment_method_ids: selectedPaymentMethodIds }),
        }

        const updateResult = await updateAd(adId, payload)

        if (updateResult.errors && updateResult.errors.length > 0) {
          const errorMessage = formatErrorMessage(updateResult.errors)
          throw new Error(errorMessage)
        }

        localStorage.removeItem("editAdData")

        setStatusModal({
          show: true,
          type: "success",
          title: "Ad updated",
          message: "Your ad has been updated successfully.",
          adType: formData.type || "",
          adId: adId || "",
        })

        router.push("/ads")
      } else {
        const payload = {
          type: formData.type || "buy",
          account_currency: "USD",
          payment_currency: "IDR",
          minimum_order_amount: formData.minAmount || 0,
          maximum_order_amount: formData.maxAmount || 0,
          available_amount: formData.totalAmount || 0,
          exchange_rate: formData.fixedRate || 0,
          exchange_rate_type: "fixed" as const,
          description: formData.instructions || "",
          is_active: 1,
          order_expiry_period: 15,
          ...(formData.type === "buy"
            ? { payment_method_names: formData.paymentMethods || [] }
            : { payment_method_ids: selectedPaymentMethodIds }),
        }

        const result = await createAd(payload)

        if (result.errors && result.errors.length > 0) {
          const errorMessage = formatErrorMessage(result.errors)
          throw new Error(errorMessage)
        }

        localStorage.setItem(
          "adCreationSuccess",
          JSON.stringify({
            type: result.data.type,
            id: result.data.id,
          }),
        )

        setStatusModal({
          show: true,
          type: "success",
          title: "Ad created",
          message: "Your ad has been created successfully.",
          adType: result.data.type || "",
          adId: result.data.id || "",
        })

        router.push("/ads")
      }
    } catch (error) {
      let errorInfo = {
        title: getErrorTitle(isEditMode),
        message: "Please try again.",
        type: "error" as "error" | "warning",
        actionButtonText: getActionButtonText(isEditMode),
        adType: "",
        adId: "",
      }

      if (error instanceof Error) {
        if (error.name === "AdvertExchangeRateDuplicate") {
          errorInfo = {
            title: "You already have an ad with this rate.",
            message:
              "You have another active ad with the same rate for this currency pair and order type. Set a different rate.",
            type: "warning",
            actionButtonText: getActionButtonText(isEditMode),
            adType: formData.type || "",
            adId: adId || "",
          }
        } else if (error.name === "AdvertOrderRangeOverlap") {
          errorInfo = {
            title: "You already have an ad with this range.",
            message:
              "Change the minimum and/or maximum order limit for this ad. The range between these limits must not overlap with another active ad you created for this currency pair and order type.",
            type: "warning",
            actionButtonText: getActionButtonText(isEditMode),
            adType: formData.type || "",
            adId: adId || "",
          }
        } else if (error.name === "AdvertLimitReached" || error.message === "ad_limit_reached") {
          errorInfo = {
            title: "Ad limit reached",
            message:
              "You can have only 3 active ads for this currency pair and order type. Delete one to create a new ad.",
            type: "error",
            actionButtonText: getActionButtonText(isEditMode),
            adType: formData.type || "",
            adId: adId || "",
          }
        } else if (error.name === "InsufficientBalance") {
          errorInfo = {
            title: "Insufficient balance",
            message: "You don't have enough balance to create this ad.",
            type: "error",
            actionButtonText: getActionButtonText(isEditMode),
            adType: formData.type || "",
            adId: adId || "",
          }
        } else if (error.name === "InvalidExchangeRate" || error.name === "InvalidOrderAmount") {
          errorInfo = {
            title: "Invalid values",
            message: error.message || "Please check your input values.",
            type: "error",
            actionButtonText: getActionButtonText(isEditMode),
            adType: formData.type || "",
            adId: adId || "",
          }
        } else if (error.name === "AdvertTotalAmountExceeded") {
          errorInfo = {
            title: "Amount exceeds balance",
            message: "The total amount exceeds your available balance. Please enter a smaller amount.",
            type: "error",
            actionButtonText: getActionButtonText(isEditMode),
            adType: formData.type || "",
            adId: adId || "",
          }
        } else {
          errorInfo.message = error.message || errorInfo.message
        }
      }

      setStatusModal({
        show: true,
        type: errorInfo.type,
        title: errorInfo.title,
        message: errorInfo.message,
        actionButtonText: errorInfo.actionButtonText,
        adType: errorInfo.adType,
        adId: errorInfo.adId,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    router.push("/ads")
  }

  const handleModalClose = () => {
    setStatusModal((prev) => ({ ...prev, show: false }))
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const isButtonDisabled =
    isSubmitting ||
    (currentStep === 1 && !adFormValid) ||
    (currentStep === 2 && formData.type === "buy" && !paymentFormValid) ||
    (currentStep === 2 && formData.type === "sell" && !hasSelectedPaymentMethods) ||
    isBottomSheetOpen

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <AdDetailsForm
            onNext={handleAdDetailsNext}
            onClose={handleClose}
            initialData={formData}
            isEditMode={isEditMode}
          />
        )
      case 2:
        return (
          <PaymentDetailsForm
            onNext={handlePaymentDetailsNext}
            onBack={handleBack}
            initialData={formData}
            isSubmitting={isSubmitting}
            isEditMode={isEditMode}
            onBottomSheetOpenChange={handleBottomSheetOpenChange}
          />
        )
      case 3:
        return (
          <div className="max-w-[800px] mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Review Your Ad</h2>
            <div className="bg-slate-1500 p-6 rounded-lg mb-6">
              <pre className="text-left text-sm">{JSON.stringify(formData, null, 2)}</pre>
            </div>
            <Button onClick={handleSubmit} className="w-full md:w-auto">
              {isEditMode ? "Save Ad" : "Create Ad"}
            </Button>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isMobile ? (
            // Mobile Header
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-6 w-6" />
                </button>
                <h1 className="ml-4 text-xl-bold text-slate-1600">{getPageTitle(isEditMode, formData.type)}</h1>
              </div>
            </div>
          ) : (
            // Desktop Header
            <>
              <div className="flex items-center justify-between h-16">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="flex items-center text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </button>
                <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="pb-4">
                <h1 className="text-2xl-bold text-slate-1600">{getPageTitle(isEditMode, formData.type)}</h1>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ProgressSteps currentStep={currentStep} steps={steps} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">{renderStepContent()}</div>

      {/* Footer Actions */}
      {currentStep < 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="max-w-7xl mx-auto flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="w-full md:w-auto mr-4 bg-transparent"
            >
              Back
            </Button>
            <Button
              onClick={() => {
                if (currentStep === 1) {
                  const form = document.getElementById("ad-details-form") as HTMLFormElement
                  if (form) {
                    form.requestSubmit()
                  }
                } else {
                  handleNext(formData)
                }
              }}
              disabled={isButtonDisabled}
              className="w-full md:w-auto"
            >
              {currentStep === 2 ? "Review" : "Next"}
            </Button>
          </div>
        </div>
      )}

      {statusModal.show && !isMobile && (
        <StatusModal
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          subMessage={statusModal.subMessage}
          adType={statusModal.adType}
          adId={statusModal.adId}
          onClose={handleModalClose}
          actionButtonText={statusModal.actionButtonText}
        />
      )}

      {statusModal.show && isMobile && (
        <StatusBottomSheet
          isOpen={statusModal.show}
          onClose={handleModalClose}
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          subMessage={statusModal.subMessage}
          adType={statusModal.adType}
          adId={statusModal.adId}
          actionButtonText={statusModal.actionButtonText}
        />
      )}
    </div>
  )
}
