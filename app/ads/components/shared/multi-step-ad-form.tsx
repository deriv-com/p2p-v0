"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdDetailsForm from "../ad-details-form"
import PaymentDetailsForm from "../payment-details-form"
import { createAd, updateAd, getAdvert } from "../../api/api-ads"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { ProgressSteps } from "./progress-steps"
import Navigation from "@/components/navigation"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import OrderTimeLimitSelector from "./order-time-limit-selector"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import CountrySelection from "./country-selection"

interface MultiStepAdFormProps {
  mode: "create" | "edit"
  adId?: string
}

const getButtonText = (isSubmitting: boolean, currentStep: number, mode: "create" | "edit") => {
  if (isSubmitting) {
    return mode === "create" ? "Creating..." : "Saving..."
  }

  if (currentStep === 0) {
    return "Next"
  }

  if (currentStep === 1) {
    return "Next"
  }

  if (currentStep === 2) {
    return mode === "create" ? "Create Ad" : "Save Details"
  }

  return mode === "create" ? "Create Ad" : "Save Details"
}

const getPageTitle = (mode: "create" | "edit", adType?: string) => {
  if (mode === "create") {
    return "Create new ad"
  }
  return `Edit ${adType === "sell" ? "Sell" : "Buy"} ad`
}

export default function MultiStepAdForm({ mode, adId }: MultiStepAdFormProps) {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adFormValid, setAdFormValid] = useState(false)
  const [paymentFormValid, setPaymentFormValid] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [hasSelectedPaymentMethods, setHasSelectedPaymentMethods] = useState(false)
  const { showAlert } = useAlertDialog()
  const [orderTimeLimit, setOrderTimeLimit] = useState(15)
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])

  const formDataRef = useRef({})

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
    if (mode === "edit" && adId) {
      const loadInitialData = async () => {
        try {
          const advertData = await getAdvert(adId)
          const { data } = advertData

          if (data) {
            let paymentMethodNames: string[] = []
            let paymentMethodIds: number[] = []

            if (data.payment_methods && Array.isArray(data.payment_methods)) {
              if (data.type === "buy") {
                paymentMethodNames = data.payment_methods.map((methodName: string) => {
                  if (methodName.includes("_") || methodName === methodName.toLowerCase()) {
                    return methodName
                  }
                  return convertToSnakeCase(methodName)
                })
              } else {
                paymentMethodIds = data.payment_method_ids
                  .map((id: any) => Number(id))
                  .filter((id: number) => !isNaN(id))

                if (typeof window !== "undefined") {
                  ;(window as any).adPaymentMethodIds = paymentMethodIds
                }
              }
            }

            const formattedData = {
              ...data,
              totalAmount: data.available_amount,
              fixedRate: Number.parseFloat(data.exchange_rate),
              minAmount: data.minimum_order_amount,
              maxAmount: data.maximum_order_amount,
              paymentMethods: paymentMethodNames,
              payment_method_ids: paymentMethodIds,
              instructions: data.description || "",
            }

            setFormData(formattedData)
            formDataRef.current = formattedData

            if (data.order_expiry_period) {
              setOrderTimeLimit(data.order_expiry_period)
            }

            if (data.available_countries) {
              setSelectedCountries(data.available_countries)
            }
          }
        } catch (error) {
          console.log(error)
        }
      }

      loadInitialData()
    }
  }, [mode, adId])

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

  const handleFinalSubmit = async () => {
    const finalData = { ...formDataRef.current }

    setIsSubmitting(true)

    try {
      const selectedPaymentMethodIds = finalData.type === "sell" ? (window as any).adPaymentMethodIds || [] : []

      if (mode === "create") {
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
          order_expiry_period: orderTimeLimit,
          available_countries: selectedCountries.length > 0 ? selectedCountries : undefined,
          ...(finalData.type === "buy"
            ? { payment_method_names: finalData.paymentMethods || [] }
            : { payment_method_ids: selectedPaymentMethodIds }),
        }

        const result = await createAd(payload)

        if (result.errors && result.errors.length > 0) {
          const errorMessage = formatErrorMessage(result.errors)
          throw new Error(errorMessage)
        }
      } else {
        const payload = {
          is_active: true,
          minimum_order_amount: finalData.minAmount || 0,
          maximum_order_amount: finalData.maxAmount || 0,
          available_amount: finalData.totalAmount || 0,
          exchange_rate: finalData.fixedRate || 0,
          exchange_rate_type: "fixed",
          order_expiry_period: orderTimeLimit,
          available_countries: selectedCountries.length > 0 ? selectedCountries : undefined,
          description: finalData.instructions || "",
          ...(finalData.type === "buy"
            ? { payment_method_names: finalData.paymentMethods || [] }
            : { payment_method_ids: selectedPaymentMethodIds }),
        }

        const updateResult = await updateAd(finalData.id, payload)

        if (updateResult.errors && updateResult.errors.length > 0) {
          const errorMessage = formatErrorMessage(updateResult.errors)
          throw new Error(errorMessage)
        }
      }

      router.push("/ads")
    } catch (error) {
      let errorInfo = {
        title: mode === "create" ? "" : "Failed to update ad",
        message: "Please try again.",
        type: "error" as "error" | "warning",
        actionButtonText: mode === "create" ? "Update ad" : "Update ad",
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

    // Step 0: Validate and proceed to next step
    if (currentStep === 0) {
      if (!adFormValid) {
        return
      }

      setCurrentStep(1)
      return
    }

    // Step 1: Validate and proceed to next step
    if (currentStep === 1) {
      if (mode === "create" && formData.type === "buy" && !paymentFormValid) {
        return
      }

      if (formData.type === "sell" && !hasSelectedPaymentMethods) {
        return
      }

      setCurrentStep(2)
      return
    }

    // Step 2: Validate and submit the entire form
    if (currentStep === 2) {
      if (mode === "edit" && !adFormValid) {
        return
      }

      if (isSubmitting) {
        return
      }

      handleFinalSubmit()
      return
    }
  }

  const handleClose = () => {
    router.push("/ads")
  }

  const isButtonDisabled =
    isSubmitting ||
    (currentStep === 0 && !adFormValid) ||
    (currentStep === 1 && mode === "create" && formData.type === "buy" && !paymentFormValid) ||
    (currentStep === 1 && formData.type === "sell" && !hasSelectedPaymentMethods) ||
    (currentStep === 2 && mode === "edit" && !adFormValid) ||
    isBottomSheetOpen

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="fixed w-full h-full bg-white top-0 left-0 md:px-[24px]">
        <div className="md:max-w-[620px] mx-auto pb-12 mt-0 md:mt-8 progress-steps-container overflow-auto h-full md:px-0">
          <Navigation
            isBackBtnVisible={currentStep != 0}
            isVisible={false}
            onBack={() => {
              const updatedStep = currentStep - 1
              setCurrentStep(updatedStep)
            }}
            onClose={handleClose}
            title={isMobile ? getPageTitle(mode, formData.type) : ""}
          />
          <div className="hidden md:block text-2xl font-bold m-6 mb-10">{getPageTitle(mode, formData.type)}</div>
          <ProgressSteps currentStep={currentStep} steps={steps} className="mt-[40px]" />

          {currentStep === 0 && (
            <div className="block md:hidden m-6 text-left">
              <div className="text-sm font-normal text-slate-1200">Step 1</div>
              <div className="text-lg font-bold text-slate-1200">Set Type and Price</div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="block md:hidden m-6 text-left">
              <div className="text-sm font-normal text-slate-1200">Step 2</div>
              <div className="text-lg font-bold text-slate-1200">Payment details</div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="block md:hidden m-6 text-left">
              <div className="text-sm font-normal text-slate-1200">Step 3</div>
              <div className="text-lg font-bold text-slate-1200">Set ad conditions</div>
            </div>
          )}

          <div className="relative mb-16 md:mb-0 mx-6">
            {currentStep === 0 ? (
              <AdDetailsForm
                onNext={handleAdDetailsNext}
                onClose={handleClose}
                initialData={formData}
                setFormData={setFormData}
                isEditMode={mode === "edit"}
              />
            ) : currentStep === 1 ? (
              <PaymentDetailsForm
                onBack={() => setCurrentStep(0)}
                onClose={handleClose}
                initialData={formData}
                setFormData={setFormData}
                isSubmitting={isSubmitting}
                isEditMode={mode === "edit"}
                onBottomSheetOpenChange={handleBottomSheetOpenChange}
              />
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex gap-[4px] items-center mb-4">
                    <h3 className="text-base font-bold leading-6 tracking-normal">Order time limit</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Image
                            src="/icons/info-circle.png"
                            alt="Info"
                            width={12}
                            height={12}
                            className="ml-1 cursor-pointer"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Orders will expire if they aren't completed within this timeframe.</p>
                          <TooltipArrow className="fill-black" />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <OrderTimeLimitSelector value={orderTimeLimit} onValueChange={setOrderTimeLimit} />
                </div>

                <div className="w-[70%]">
                  <h3 className="text-base font-bold mb-2">Choose your audience</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    You can filter who interacts with your ads based on their location or P2P history. Stricter filters
                    may reduce ad visibility.
                  </p>
                  <div>
                    <CountrySelection selectedCountries={selectedCountries} onCountriesChange={setSelectedCountries} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {isMobile ? (
            <div className="fixed bottom-0 left-0 w-full bg-white mt-4 py-4 md:mb-0 border-t border-gray-200">
              <div className="mx-6">
                <Button type="button" onClick={handleButtonClick} disabled={isButtonDisabled} className="w-full">
                  {getButtonText(isSubmitting, currentStep, mode)}
                </Button>
              </div>
            </div>
          ) : (
            <div className="hidden md:block"></div>
          )}

          <div className="hidden md:flex justify-end mt-8">
            <Button type="button" onClick={handleButtonClick} disabled={isButtonDisabled}>
              {getButtonText(isSubmitting, currentStep, mode)}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
