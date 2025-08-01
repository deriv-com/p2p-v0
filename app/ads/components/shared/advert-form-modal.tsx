"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import Image from "next/image"
import AdDetailsForm from "../ad-details-form"
import PaymentDetailsForm from "../payment-details-form"
import StatusModal from "../ui/status-modal"
import StatusBottomSheet from "../ui/status-bottom-sheet"
import { ProgressSteps } from "../ui/progress-steps"
import type { AdFormData, StatusModalState } from "../../types"
import { createAd, updateAd } from "../../api/api-ads"

interface AdvertFormModalProps {
  isOpen: boolean
  onClose: () => void
  mode: "create" | "edit"
  initialData?: Partial<AdFormData>
  adId?: string
  onSuccess?: () => void
}

const getPageTitle = (mode: "create" | "edit", adType?: string) => {
  if (mode === "edit" && adType) {
    return `Edit ${adType === "sell" ? "Sell" : "Buy"} ad`
  }
  return "Create new ad"
}

const getButtonText = (mode: "create" | "edit", isSubmitting: boolean, currentStep: number) => {
  if (isSubmitting) {
    return mode === "edit" ? "Saving..." : "Creating..."
  }

  if (currentStep === 0) {
    return "Next"
  }

  return mode === "edit" ? "Save Details" : "Create Ad"
}

const getErrorTitle = (mode: "create" | "edit") => {
  return mode === "edit" ? "Failed to update ad" : "Failed to create ad"
}

export default function AdvertFormModal({
  isOpen,
  onClose,
  mode,
  initialData = {},
  adId,
  onSuccess,
}: AdvertFormModalProps) {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<AdFormData>>(initialData)
  const [statusModal, setStatusModal] = useState<StatusModalState>({
    show: false,
    type: "success",
    title: "",
    message: "",
    subMessage: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const convertToSnakeCase = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
  }

  useEffect(() => {
    if (isOpen && mode === "edit" && initialData) {
      // Process initial data for edit mode
      let rateValue = 0
      if (initialData.rate && typeof initialData.rate === "object" && "value" in initialData.rate) {
        const rateMatch = initialData.rate.value.match(/([A-Z]+)\s+(\d+(?:\.\d+)?)/)
        if (rateMatch && rateMatch[2]) {
          rateValue = Number.parseFloat(rateMatch[2])
        }
      }

      let minAmount = 0
      let maxAmount = 0

      if (initialData.limits) {
        if (typeof initialData.limits === "string") {
          const limitsMatch = initialData.limits.match(/([A-Z]+)\s+(\d+(?:\.\d+)?)\s+-\s+(\d+(?:\.\d+)?)/)
          if (limitsMatch) {
            minAmount = Number.parseFloat(limitsMatch[2])
            maxAmount = Number.parseFloat(limitsMatch[3])
          }
        } else if (typeof initialData.limits === "object") {
          minAmount = initialData.limits.min || 0
          maxAmount = initialData.limits.max || 0
        }
      }

      let paymentMethodNames: string[] = []
      let paymentMethodIds: number[] = []

      if (initialData.paymentMethods && Array.isArray(initialData.paymentMethods)) {
        if (initialData.type?.toLowerCase() === "buy") {
          paymentMethodNames = initialData.paymentMethods.map((methodName: string) => {
            if (methodName.includes("_") || methodName === methodName.toLowerCase()) {
              return methodName
            }
            return convertToSnakeCase(methodName)
          })
        } else {
          paymentMethodIds = initialData.paymentMethods.map((id: any) => Number(id)).filter((id: number) => !isNaN(id))

          if (typeof window !== "undefined") {
            ;(window as any).adPaymentMethodIds = paymentMethodIds
          }
        }
      }

      const formattedData: Partial<AdFormData> = {
        type: initialData.type?.toLowerCase() === "sell" ? "sell" : "buy",
        totalAmount: initialData.available?.current || initialData.totalAmount || 0,
        fixedRate: rateValue || initialData.fixedRate || 0,
        minAmount: minAmount || initialData.minAmount || 0,
        maxAmount: maxAmount || initialData.maxAmount || 0,
        paymentMethods: paymentMethodNames,
        payment_method_ids: paymentMethodIds,
        instructions: initialData.description || initialData.instructions || "",
      }

      setFormData(formattedData)
      formDataRef.current = formattedData
    } else if (isOpen && mode === "create") {
      // Reset form for create mode
      setFormData({})
      formDataRef.current = {}
      setCurrentStep(0)
    }
  }, [isOpen, mode, initialData])

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

  const handleAdDetailsNext = (data: Partial<AdFormData>, errors?: Record<string, string>) => {
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

  const handlePaymentDetailsSubmit = async (data: Partial<AdFormData>, errors?: Record<string, string>) => {
    const finalData = { ...formData, ...data }
    formDataRef.current = finalData

    if (errors && Object.keys(errors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const selectedPaymentMethodIds = finalData.type === "sell" ? (window as any).adPaymentMethodIds || [] : []

      if (mode === "edit" && adId) {
        const payload = {
          is_active: true,
          minimum_order_amount: finalData.minAmount || 0,
          maximum_order_amount: finalData.maxAmount || 0,
          available_amount: finalData.totalAmount || 0,
          exchange_rate: finalData.fixedRate || 0,
          exchange_rate_type: "fixed",
          order_expiry_period: 15,
          description: finalData.instructions || "",
          ...(finalData.type === "buy"
            ? { payment_method_names: finalData.paymentMethods || [] }
            : { payment_method_ids: selectedPaymentMethodIds }),
        }

        const updateResult = await updateAd(adId, payload)

        if (updateResult.errors && updateResult.errors.length > 0) {
          const errorMessage = formatErrorMessage(updateResult.errors)
          throw new Error(errorMessage)
        }

        // Success - close modal and refresh data
        onClose()
        if (onSuccess) {
          onSuccess()
        }
      } else {
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
        }

        // Success - close modal and refresh data
        onClose()
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      let errorInfo = {
        title: getErrorTitle(mode),
        message: "Please try again.",
        type: "error" as "error" | "warning",
        actionButtonText: mode === "edit" ? "Update ad" : "Create ad",
      }

      if (error instanceof Error) {
        if (error.name === "AdvertExchangeRateDuplicate") {
          errorInfo = {
            title: "You already have an ad with this rate.",
            message:
              "You have another active ad with the same rate for this currency pair and order type. Set a different rate.",
            type: "warning",
            actionButtonText: mode === "edit" ? "Update ad" : "Create ad",
          }
        } else if (error.name === "AdvertOrderRangeOverlap") {
          errorInfo = {
            title: "You already have an ad with this range.",
            message:
              "Change the minimum and/or maximum order limit for this ad. The range between these limits must not overlap with another active ad you created for this currency pair and order type.",
            type: "warning",
            actionButtonText: mode === "edit" ? "Update ad" : "Create ad",
          }
        } else if (error.name === "AdvertLimitReached" || error.message === "ad_limit_reached") {
          errorInfo = {
            title: "Ad limit reached",
            message:
              "You can have only 3 active ads for this currency pair and order type. Delete one to create a new ad.",
            type: "error",
            actionButtonText: mode === "edit" ? "Update ad" : "Create ad",
          }
        } else if (error.name === "InsufficientBalance") {
          errorInfo = {
            title: "Insufficient balance",
            message: "You don't have enough balance to create this ad.",
            type: "error",
            actionButtonText: mode === "edit" ? "Update ad" : "Create ad",
          }
        } else if (error.name === "InvalidExchangeRate" || error.name === "InvalidOrderAmount") {
          errorInfo = {
            title: "Invalid values",
            message: error.message || "Please check your input values.",
            type: "error",
            actionButtonText: mode === "edit" ? "Update ad" : "Create ad",
          }
        } else if (error.name === "AdvertTotalAmountExceeded") {
          errorInfo = {
            title: "Amount exceeds balance",
            message: "The total amount exceeds your available balance. Please enter a smaller amount.",
            type: "error",
            actionButtonText: mode === "edit" ? "Update ad" : "Create ad",
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

    if (currentStep === 1 && mode === "create") {
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

    if (currentStep === 1 && mode === "edit") {
      if (!adFormValid || isSubmitting) {
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

  const handleModalClose = () => {
    setStatusModal((prev) => ({ ...prev, show: false }))
  }

  const handleClose = () => {
    setCurrentStep(0)
    setFormData({})
    formDataRef.current = {}
    onClose()
  }

  const isButtonDisabled =
    isSubmitting ||
    (currentStep === 0 && !adFormValid) ||
    (currentStep === 1 && formData.type === "buy" && !paymentFormValid && mode === "create") ||
    (currentStep === 1 && formData.type === "sell" && !hasSelectedPaymentMethods && mode === "create") ||
    (currentStep === 1 && mode === "edit" && !adFormValid) ||
    isBottomSheetOpen

  const ModalContent = () => (
    <div className="max-w-[600px] mx-auto pb-12 mt-8 progress-steps-container overflow-auto h-full pb-40 px-4 md:px-0">
      <div className="flex justify-between mb-7 md:mt-4 sticky top-0 z-20 bg-white py-1 relative items-center border-b md:border-b-0 -mx-4 px-4 md:mx-0 md:px-0 border-gray-200">
        {currentStep === 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep(0)}
            className="text-gray-700 hover:text-gray-900 p-2"
          >
            <Image src="/icons/back-circle.png" alt="Back" width={24} height={24} />
          </Button>
        )}
        {currentStep === 0 && <div></div>}
        <div className="block md:hidden text-xl-bold text-black text-left">{getPageTitle(mode, formData.type)}</div>
        <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-700 hover:text-gray-900 p-2">
          <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
        </Button>
      </div>

      <div className="hidden md:block text-left mb-[40px] text-2xl-bold text-[#00080a]">
        {getPageTitle(mode, formData.type)}
      </div>

      <ProgressSteps currentStep={currentStep} steps={steps} />

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
          <AdDetailsForm onNext={handleAdDetailsNext} initialData={formData} isEditMode={mode === "edit"} />
        ) : (
          <PaymentDetailsForm
            onSubmit={handlePaymentDetailsSubmit}
            initialData={formData}
            onBottomSheetOpenChange={handleBottomSheetOpenChange}
          />
        )}
      </div>

      {isMobile ? (
        <div className="fixed bottom-0 left-0 w-full bg-white mt-4 py-4 mb-16 md:mb-0 border-t border-gray-200">
          <div className="mx-6">
            <Button onClick={handleButtonClick} disabled={isButtonDisabled} className="w-full">
              {getButtonText(mode, isSubmitting, currentStep)}
            </Button>
          </div>
        </div>
      ) : (
        <div className="hidden md:block"></div>
      )}

      <div className="hidden md:flex justify-end mt-8">
        <Button onClick={handleButtonClick} disabled={isButtonDisabled}>
          {getButtonText(mode, isSubmitting, currentStep)}
        </Button>
      </div>

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

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent side="bottom" className="h-full">
          <SheetHeader>
            <SheetTitle className="sr-only">{getPageTitle(mode, formData.type)}</SheetTitle>
          </SheetHeader>
          <ModalContent />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="sr-only">{getPageTitle(mode, formData.type)}</DialogTitle>
        </DialogHeader>
        <ModalContent />
      </DialogContent>
    </Dialog>
  )
}
