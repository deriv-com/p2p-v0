"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdDetailsForm from "../components/ad-details-form"
import PaymentDetailsForm from "../components/payment-details-form"
import { createAd } from "../api/api-ads"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ProgressSteps } from "../components/ui/progress-steps"
import Navigation from "@/components/navigation"
import { useAlertDialog } from "@/hooks/use-alert-dialog"

const getButtonText = (isSubmitting: boolean, currentStep: number) => {
  if (isSubmitting) {
    return "Creating..."
  }

  if (currentStep === 0) {
    return "Next"
  }

  return "Create Ad"
}

export default function CreateAdPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adFormValid, setAdFormValid] = useState(false)
  const [paymentFormValid, setPaymentFormValid] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [hasSelectedPaymentMethods, setHasSelectedPaymentMethods] = useState(false)
  const { showAlert } = useAlertDialog()

  const formDataRef = useRef({})

  const steps = [
    { title: "Set Type and Price", completed: currentStep > 0 },
    { title: "Set payment details", completed: currentStep > 1 },
    { title: "Set ad conditions", completed: currentStep > 2 },
  ]

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
    const handleAdFormValidation = (e: any) => {
      setAdFormValid(e.detail.isValid)
      if (e.detail.isValid) {
        const updatedData = { ...formData, ...e.detail.formData }
        setFormData(updatedData)
        formDataRef.current = updatedData
      }
    }

    const handlePaymentFormValidation = (e: any) => {
      setPaymentFormValid(e.detail.isValid)
      if (e.detail.isValid) {
        const updatedData = { ...formData, ...e.detail.formData }
        setFormData(updatedData)
        formDataRef.current = updatedData
      }
    }

    document.addEventListener("adFormValidationChange", handleAdFormValidation)
    document.addEventListener("paymentFormValidationChange", handlePaymentFormValidation)

    return () => {
      document.removeEventListener("adFormValidationChange", handleAdFormValidation)
      document.removeEventListener("paymentFormValidationChange", handlePaymentFormValidation)
    }
  }, [formData])

  const handleAdDetailsNext = (data, errors?: Record<string, string>) => {
    const updatedData = { ...formData, ...data }
    setFormData(updatedData)
    formDataRef.current = updatedData

    if (!errors || Object.keys(errors).length === 0) {
      setCurrentStep(1)
    }
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

  const handlePaymentDetailsSubmit = async (data, errors?: Record<string, string>) => {
    const finalData = { ...formData, ...data }
    formDataRef.current = finalData

    if (errors && Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const selectedPaymentMethodIds = finalData.type === "sell" ? (window as any).adPaymentMethodIds || [] : []

        const payload = {
          type: finalData.type || "buy",
          account_currency: "USD",
          payment_currency: "IDR",
          minimum_order_amount: finalData.minAmount || 0,
          maximum_order_amount: finalData.maxAmount || 0,
          available_amount: finalData.totalAmount || 0,
          exchange_rate: finalData.fixedRate || 0,
          exchange_rate_type: "fixed" as const,
          description: finalData.instructions || "",
          is_active: 1,
          order_expiry_period: 15,
          ...(finalData.type === "buy"
            ? { payment_method_names: finalData.paymentMethods || [] }
            : { payment_method_ids: selectedPaymentMethodIds }),
        }

        const result = await createAd(payload)

        if (result.errors && result.errors.length > 0) {
          const errorMessage = formatErrorMessage(result.errors)
          throw new Error(errorMessage)
        } else {
          router.push("/ads");
        }
      
    } catch (error) {
      let errorInfo = {
        title: "",
        message: "Please try again.",
        type: "error" as "error" | "warning",
        actionButtonText: "Update ad",
      }

      if (error instanceof Error) {
        if (error.name === "AdvertExchangeRateDuplicate") {
          errorInfo = {
            title: "You already have an ad with this rate.",
            message:
              "You have another active ad with the same rate for this currency pair and order type. Set a different rate.",
            type: "warning",
            actionButtonText: "Update ad",
          }
        } else if (error.name === "AdvertOrderRangeOverlap") {
          errorInfo = {
            title: "You already have an ad with this range.",
            message:
              "Change the minimum and/or maximum order limit for this ad. The range between these limits must not overlap with another active ad you created for this currency pair and order type.",
            type: "warning",
            actionButtonText: "Update ad",
          }
        } else if (error.name === "AdvertLimitReached" || error.message === "ad_limit_reached") {
          errorInfo = {
            title: "Ad limit reached",
            message:
              "You can have only 3 active ads for this currency pair and order type. Delete one to create a new ad.",
            type: "error",
            actionButtonText: "Update ad",
          }
        } else if (error.name === "InsufficientBalance") {
          errorInfo = {
            title: "Insufficient balance",
            message: "You don't have enough balance to create this ad.",
            type: "error",
            actionButtonText: "Update ad",
          }
        } else if (error.name === "InvalidExchangeRate" || error.name === "InvalidOrderAmount") {
          errorInfo = {
            title: "Invalid values",
            message: error.message || "Please check your input values.",
            type: "error",
            actionButtonText: "Update ad",
          }
        } else if (error.name === "AdvertTotalAmountExceeded") {
          errorInfo = {
            title: "Amount exceeds balance",
            message: "The total amount exceeds your available balance. Please enter a smaller amount.",
            type: "error",
            actionButtonText: "Update ad",
          }
        } else {
          errorInfo.message = error.message || errorInfo.message
        }
      }

      showAlert({
        title: errorInfo.title,
        description: errorInfo.message,
        confirmText: errorInfo.actionButtonText,
        type: errorInfo.type,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBottomSheetOpenChange = (isOpen: boolean) => {
    setIsBottomSheetOpen(isOpen)
  }

  const handleButtonClick = () => {
    if (isBottomSheetOpen) {
      return
    }

    if (currentStep === 0 && !adFormValid) {
      return
    }

    if (currentStep === 1) {
      if (formData.type === "buy" && !paymentFormValid) {
        return
      }

      if (formData.type === "sell" && !hasSelectedPaymentMethods) {
        return
      }

      if (isSubmitting) {
        return
      }
    }

    if (currentStep === 0) {
      const adDetailsFormData = document.getElementById("ad-details-form") as HTMLFormElement
      if (adDetailsFormData) {
        adDetailsFormData.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
      }
    } else {
      const paymentDetailsFormData = document.getElementById("payment-details-form") as HTMLFormElement
      if (paymentDetailsFormData) {
        paymentDetailsFormData.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
      }
    }
  }

  const handleClose = () => {
    router.push("/ads")
  }

  const isButtonDisabled =
    isSubmitting ||
    (currentStep === 0 && !adFormValid) ||
    (currentStep === 1 && formData.type === "buy" && !paymentFormValid) ||
    (currentStep === 1 && formData.type === "sell" && !hasSelectedPaymentMethods) ||
    isBottomSheetOpen

  return (
      <div className="fixed w-full h-full bg-white top-0 left-0 md:px-[24px]">
        <div className="md:max-w-[600px] mx-auto pb-12 mt-0 md:mt-8 progress-steps-container overflow-auto h-full pb-40 md:px-0">
          <Navigation
            isBackBtnVisible={currentStep != 0}
            isVisible={false}
            onBack={() => {
              const updatedStep = currentStep - 1;
              setCurrentStep(updatedStep)
            }}
            title="Create new ad"
          />

          <ProgressSteps currentStep={currentStep} steps={steps} className="mt-[40px]"/>

          {currentStep === 0 && (
            <div className="block md:hidden mt-4 mb-6 text-left">
              <div className="text-sm font-normal text-slate-1200">Step 1</div>
              <div className="text-lg font-bold text-slate-1200">Set Type and Price</div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="block md:hidden mt-4 mb-6 text-left">
              <div className="text-sm font-normal text-slate-1200">Step 2</div>
              <div className="text-lg font-bold text-slate-1200">Payment details</div>
            </div>
          )}

          <div className="relative mb-16 md:mb-0">
            {currentStep === 0 ? (
              <AdDetailsForm
                onNext={handleAdDetailsNext}
                onClose={handleClose}
                initialData={formData}
                isEditMode={false}
              />
            ) : (
              <PaymentDetailsForm
                onBack={() => setCurrentStep(0)}
                onSubmit={handlePaymentDetailsSubmit}
                onClose={handleClose}
                initialData={formData}
                isSubmitting={isSubmitting}
                isEditMode={false}
                onBottomSheetOpenChange={handleBottomSheetOpenChange}
              />
            )}
          </div>

          {isMobile ? (
            <div className="fixed bottom-0 left-0 w-full bg-white mt-4 py-4 md:mb-0 border-t border-gray-200">
              <div className="mx-6">
                <Button onClick={handleButtonClick} disabled={isButtonDisabled} className="w-full">
                  {getButtonText(isSubmitting, currentStep)}
                </Button>
              </div>
            </div>
          ) : (
            <div className="hidden md:block"></div>
          )}

          <div className="hidden md:flex justify-end mt-8">
            <Button onClick={handleButtonClick} disabled={isButtonDisabled}>
              {getButtonText(isSubmitting, currentStep)}
            </Button>
          </div>
        </div>
      </div>
  )
}
