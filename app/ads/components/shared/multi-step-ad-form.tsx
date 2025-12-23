"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdDetailsForm from "../ad-details-form"
import PaymentDetailsForm from "../payment-details-form"
import { AdsAPI, ProfileAPI, BuySellAPI } from "@/services/api"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { ProgressSteps } from "./progress-steps"
import Navigation from "@/components/navigation"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import OrderTimeLimitSelector from "./order-time-limit-selector"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import CountrySelection from "./country-selection"
import { PaymentSelectionProvider, usePaymentSelection } from "../payment-selection-context"
import { useToast } from "@/hooks/use-toast"
import { getSettings, type Country } from "@/services/api/api-auth"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useWebSocketContext } from "@/contexts/websocket-context"

interface MultiStepAdFormProps {
  mode: "create" | "edit"
  adId?: string
  initialType?: "buy" | "sell"
}

interface UserPaymentMethod {
  id: string
  type: string
  display_name: string
  fields: Record<string, any>
  is_enabled: number
  method: string
}

interface AvailablePaymentMethod {
  display_name: string
  type: string
  method: string
}

function MultiStepAdFormInner({ mode, adId, initialType }: MultiStepAdFormProps) {
  const { t } = useTranslations()
  const router = useRouter()
  const isMobile = useIsMobile()

  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(initialType ? { type: initialType } : {})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adFormValid, setAdFormValid] = useState(false)
  const [paymentFormValid, setPaymentFormValid] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false)
  const { selectedPaymentMethodIds, setSelectedPaymentMethodIds } = usePaymentSelection()
  const { showAlert } = useAlertDialog()
  const [orderTimeLimit, setOrderTimeLimit] = useState(15)
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(true)
  const [currencies, setCurrencies] = useState<Array<{ code: string }>>([])
  const [userPaymentMethods, setUserPaymentMethods] = useState<UserPaymentMethod[]>([])
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<AvailablePaymentMethod[]>([])
  const { leaveExchangeRatesChannel } = useWebSocketContext()

  const formDataRef = useRef({})
  const previousTypeRef = useRef<"buy" | "sell" | undefined>(initialType)

  const steps = [
    { title: t("adForm.setTypeAndPrice"), completed: currentStep > 0 },
    { title: t("adForm.setPaymentDetails"), completed: currentStep > 1 },
    { title: t("adForm.setAdConditions"), completed: currentStep > 2 },
  ]

  const convertToSnakeCase = (str: string): string => {
    return str
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")
  }

  const fetchUserPaymentMethods = async () => {
    try {
      const response = await ProfileAPI.getUserPaymentMethods()

      if (response.error) {
        return
      }

      setUserPaymentMethods(response || [])
    } catch (error) {
      console.error("Error fetching payment methods:", error)
    }
  }

  const fetchAvailablePaymentMethods = async () => {
    try {
      const methods = await BuySellAPI.getPaymentMethods()
      setAvailablePaymentMethods(methods || [])
    } catch (error) {
      console.error("Error fetching available payment methods:", error)
    }
  }

  useEffect(() => {
    fetchUserPaymentMethods()
    fetchAvailablePaymentMethods()
  }, [])

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingCountries(true)
        const response = await getSettings()
        const countriesData = response.countries || []
        setCountries(countriesData)

        const uniqueCurrencies = Array.from(
          new Set(
            countriesData
              .map((country: Country) => country.currency)
              .filter((currency): currency is string => !!currency),
          ),
        )
          .map((code) => ({ code }))
          .sort((a, b) => a.code.localeCompare(b.code))

        setCurrencies(uniqueCurrencies)
      } catch (error) {
        setCountries([])
        setCurrencies([])
      } finally {
        setIsLoadingCountries(false)
      }
    }

    fetchCountries()
  }, [])

  useEffect(() => {
    if (mode === "edit" && adId) {
      setIsLoadingInitialData(true)
      const loadInitialData = async () => {
        try {
          const advertData = await AdsAPI.getAdvert(adId)
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

                setSelectedPaymentMethodIds(paymentMethodNames)
              } else {
                paymentMethodIds = data.payment_method_ids
                  .map((id: any) => Number(id))
                  .filter((id: number) => !isNaN(id))

                setSelectedPaymentMethodIds(paymentMethodIds)
              }
            }

            const formattedData = {
              ...data,
              totalAmount:
                Number.parseFloat(data.available_amount) +
                Number.parseFloat(data.completed_order_amount) +
                Number.parseFloat(data.open_order_amount),
              fixedRate: Number.parseFloat(data.exchange_rate),
              minAmount: data.minimum_order_amount,
              maxAmount: data.maximum_order_amount,
              paymentMethods: paymentMethodNames,
              payment_method_ids: paymentMethodIds,
              instructions: data.description || "",
              forCurrency: data.payment_currency,
              buyCurrency: data.account_currency,
              priceType: data.exchange_rate_type,
              floatingRate: Number.parseFloat(data.exchange_rate) || "",
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

          setIsLoadingInitialData(false)
        } catch (error) {}
      }

      loadInitialData()
    }
  }, [mode, adId, setSelectedPaymentMethodIds])

  useEffect(() => {
    if (mode === "create" && formData.type && previousTypeRef.current && formData.type !== previousTypeRef.current) {
      setSelectedPaymentMethodIds([])
    }
    previousTypeRef.current = formData.type as "buy" | "sell" | undefined
  }, [formData.type, mode, setSelectedPaymentMethodIds])

  const hasSelectedPaymentMethods = selectedPaymentMethodIds.length > 0

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
      return t("adForm.genericProcessingErrorMessage")
    }

    if (errors[0].code) {
      const errorCodeMap: Record<string, string> = {
        AdvertLimitReached: t("adForm.adLimitReachedMessage"),
        InvalidExchangeRate: t("adForm.invalidExchangeRateMessage"),
        InvalidOrderAmount: t("adForm.invalidOrderAmountMessage"),
        InsufficientBalance: t("adForm.insufficientBalanceMessage"),
        AdvertTotalAmountExceeded: t("adForm.amountExceedsBalanceMessage"),
        AdvertActiveCountExceeded: t("adForm.adLimitReachedMessage"),
        AdvertFloatRateMaximum: t("adForm.advertFloatRateMaximumMessage"),
        AdvertExchangeRateDuplicate: t("adForm.duplicateRateMessage"),
        AdvertOrderRangeOverlap: t("adForm.rangeOverlapMessage")
      }

      if (errorCodeMap[errors[0].code]) {
        const error = new Error(errorCodeMap[errors[0].code])
        error.name = errors[0].code
        throw error
      }

      return t("adForm.genericErrorCodeMessage", { code: errors[0].code })
    }

    return t("adForm.genericProcessingErrorMessage")
  }

  const handleFinalSubmit = async () => {
    const finalData = { ...formDataRef.current }

    setIsSubmitting(true)

    try {
      const selectedPaymentMethodIdsForSubmit = finalData.type === "sell" ? selectedPaymentMethodIds : []

      if (mode === "create") {
        const exchangeRate =
          finalData.priceType === "float" ? Number(finalData.floatingRate) : Number(finalData.fixedRate)

        const payload = {
          type: finalData.type || "buy",
          account_currency: finalData.buyCurrency,
          payment_currency: finalData.forCurrency,
          minimum_order_amount: finalData.minAmount || 0,
          maximum_order_amount: finalData.maxAmount || 0,
          available_amount: finalData.totalAmount || 0,
          exchange_rate: exchangeRate || 0,
          exchange_rate_type: (finalData.priceType || "fixed") as "fixed" | "float",
          description: finalData.instructions || "",
          is_active: 1,
          order_expiry_period: orderTimeLimit,
          available_countries: selectedCountries.length > 0 ? selectedCountries : undefined,
          ...(finalData.type === "buy"
            ? { payment_method_names: finalData.paymentMethods || [] }
            : { payment_method_ids: selectedPaymentMethodIdsForSubmit }),
        }

        const result = await AdsAPI.createAd(payload)

        if (result.errors && result.errors.length > 0) {
          const errorMessage = formatErrorMessage(result.errors)
          throw new Error(errorMessage)
        } else {
          router.push("/ads")
          showAlert({
            title: t("myAds.adCreated"),
            description: t("adForm.adCreatedSuccess", { type: result.data.type }),
            confirmText: t("common.ok"),
            type: "success",
          })
        }
      } else {
        const exchangeRate =
          finalData.priceType === "float" ? Number(finalData.floatingRate) : Number(finalData.fixedRate)

        const payload = {
          is_active: true,
          minimum_order_amount: finalData.minAmount || 0,
          maximum_order_amount: finalData.maxAmount || 0,
          exchange_rate: exchangeRate || 0,
          exchange_rate_type: (finalData.priceType || "fixed") as "fixed" | "float",
          order_expiry_period: orderTimeLimit,
          available_countries: selectedCountries.length > 0 ? selectedCountries : undefined,
          description: finalData.instructions || "",
          ...(finalData.type === "buy"
            ? { payment_method_names: finalData.paymentMethods || [] }
            : { payment_method_ids: selectedPaymentMethodIdsForSubmit }),
        }

        const updateResult = await AdsAPI.updateAd(finalData.id, payload)

        if (updateResult.errors && updateResult.errors.length > 0) {
          const errorMessage = formatErrorMessage(updateResult.errors)
          throw new Error(errorMessage)
        } else {
          toast({
            description: (
              <div className="flex items-center gap-2">
                <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
                <span>{t("adForm.adUpdatedSuccess")}</span>
              </div>
            ),
            className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
            duration: 2500,
          })
        }
        router.push("/ads")
      }
    } catch (error) {
      let errorInfo = {
        title: mode === "create" ? t("adForm.failedToCreateAd") : t("adForm.failedToUpdateAd"),
        message: t("adForm.tryAgain"),
        type: "error" as "error" | "warning",
        actionButtonText: t("adForm.updateAd"),
      }

      if (error instanceof Error) {
        if (error.name === "AdvertExchangeRateDuplicate") {
          errorInfo = {
            title: t("adForm.duplicateRateTitle"),
            message: t("adForm.duplicateRateMessage"),
            type: "warning",
            actionButtonText: t("adForm.updateAd"),
          }
        } else if (error.name === "AdvertOrderRangeOverlap") {
          errorInfo = {
            title: t("adForm.rangeOverlapTitle"),
            message: t("adForm.rangeOverlapMessage"),
            type: "warning",
            actionButtonText: t("adForm.updateAd"),
          }
        } else if (error.name === "AdvertLimitReached" || error.message === "ad_limit_reached") {
          errorInfo = {
            title: t("adForm.adLimitReachedTitle"),
            message: t("adForm.adLimitReachedMessage"),
            type: "error",
            actionButtonText: t("adForm.updateAd"),
          }
        } else if (error.name === "InsufficientBalance") {
          errorInfo = {
            title: t("adForm.insufficientBalanceTitle"),
            message: t("adForm.insufficientBalanceMessage"),
            type: "error",
            actionButtonText: t("adForm.updateAd"),
          }
        } else if (error.name === "InvalidExchangeRate" || error.name === "InvalidOrderAmount") {
          errorInfo = {
            title: t("adForm.invalidValuesTitle"),
            message: error.message || t("adForm.invalidValuesMessage"),
            type: "error",
            actionButtonText: t("adForm.updateAd"),
          }
        } else if (error.name === "AdvertTotalAmountExceeded") {
          errorInfo = {
            title: t("adForm.amountExceedsBalanceTitle"),
            message: t("adForm.amountExceedsBalanceMessage"),
            type: "error",
            actionButtonText: t("common.ok"),
          }
        } else if (error.name === "AdvertActiveCountExceeded") {
          errorInfo = {
            title: t("adForm.adLimitReachedTitle"),
            message: t("adForm.adLimitReachedMessage"),
            type: "error",
            actionButtonText: "Go to my ads",
            onConfirm: () => {
              router.push("/ads")
            }
          }
        } else if (error.name === "AdvertFloatRateMaximum") {
          errorInfo = {
            title: t("adForm.advertFloatRateMaximumTitle"),
            message: t("adForm.advertFloatRateMaximumMessage"),
            type: "error",
            actionButtonText: t("common.ok"),
          }
        } else {
          errorInfo.message = t("adForm.genericErrorCodeMessage", { code: error.name })
        }
      }

      showAlert({
        title: errorInfo.title,
        description: errorInfo.message,
        confirmText: errorInfo.actionButtonText,
        type: errorInfo.type,
        onConfirm: () => {
          if(errorInfo.onConfirm) {
            errorInfo.onConfirm()
          } else {
            setCurrentStep(0)
          }
        },
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

    if (currentStep === 0) {
      if (!adFormValid) {
        return
      }

      setCurrentStep(1)
      return
    }

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
    const finalData = { ...formDataRef.current }
    const currency = finalData?.buyCurrency || "USD"
    leaveExchangeRatesChannel(currency)

    router.push("/ads")
  }

  const isButtonDisabled =
    (currentStep === 0 && !adFormValid) ||
    (currentStep === 1 && mode === "create" && formData.type === "buy" && !paymentFormValid) ||
    (currentStep === 1 && formData.type === "sell" && !hasSelectedPaymentMethods) ||
    (currentStep === 2 && mode === "edit" && !adFormValid) ||
    isBottomSheetOpen

  const getButtonText = () => {
    if (currentStep === 0 || currentStep === 1) {
      return t("adForm.next")
    }
    return mode === "create" ? t("adForm.createAd") : t("adForm.saveChanges")
  }

  const getPageTitle = () => {
    return mode === "create" ? t("adForm.createAd") : t("adForm.editAd")
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div className="fixed w-full h-full bg-white top-0 left-0 md:px-[24px] md:overflow-y-auto">
        <div className="md:max-w-[620px] mx-auto pb-12 mt-0 md:mt-8 progress-steps-container overflow-x-hidden h-full md:px-0">
          <Navigation
            isBackBtnVisible={currentStep != 0}
            isVisible={false}
            onBack={() => {
              const updatedStep = currentStep - 1
              setCurrentStep(updatedStep)
            }}
            onClose={handleClose}
            title=""
          />
          <ProgressSteps
            currentStep={currentStep}
            steps={steps}
            className="px-6 my-6"
            title={{
              label: getPageTitle(),
              stepTitle: steps[currentStep].title,
            }}
          />

          <div className="relative mb-16 md:mb-0 mx-6">
            {currentStep === 0 ? (
              <AdDetailsForm
                onNext={handleAdDetailsNext}
                onClose={handleClose}
                initialData={formData}
                setFormData={setFormData}
                isEditMode={mode === "edit"}
                currencies={currencies}
                isLoadingInitialData={isLoadingInitialData}
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
                userPaymentMethods={userPaymentMethods}
                availablePaymentMethods={availablePaymentMethods}
                onRefetchPaymentMethods={fetchUserPaymentMethods}
              />
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex gap-[4px] items-center mb-4">
                    <h3 className="text-base font-bold leading-6 tracking-normal">{t("adForm.orderTimeLimit")}</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Image
                            src="/icons/info-circle.svg"
                            alt="Info"
                            width={24}
                            height={24}
                            className="ml-1 cursor-pointer"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-white">{t("adForm.orderTimeLimitTooltip")}</p>
                          <TooltipArrow className="fill-black" />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <OrderTimeLimitSelector value={orderTimeLimit} onValueChange={setOrderTimeLimit} />
                </div>

                <div className="w-full md:w-[100%]">
                  <div className="flex gap-[4px] items-center mb-4">
                    <h3 className="text-base font-bold">{t("adForm.chooseYourAudience")}</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Image
                            src="/icons/info-circle.svg"
                            alt="Info"
                            width={24}
                            height={24}
                            className="ml-1 cursor-pointer"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-white">{t("adForm.audienceTooltip")}</p>
                          <TooltipArrow className="fill-black" />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>{" "}
                  </div>
                  <div>
                    <CountrySelection
                      selectedCountries={selectedCountries}
                      onCountriesChange={setSelectedCountries}
                      countries={countries}
                      isLoading={isLoadingCountries}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {isMobile ? (
            <div className="fixed bottom-0 left-0 w-full bg-white mt-4 py-4 md:mb-0 border-t border-gray-200">
              <div className="mx-6">
                <Button
                  type="button"
                  onClick={handleButtonClick}
                  disabled={isButtonDisabled || isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <Image src="/icons/spinner.png" alt="Loading" width={20} height={20} className="animate-spin" />
                  ) : (
                    getButtonText()
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex justify-end mt-8 px-6">
              <Button type="button" onClick={handleButtonClick} disabled={isButtonDisabled || isSubmitting}>
                {isSubmitting ? (
                  <Image src="/icons/spinner.png" alt="Loading" width={20} height={20} className="animate-spin" />
                ) : (
                  getButtonText()
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </form>
  )
}

export default function MultiStepAdForm({ mode, adId, initialType }: MultiStepAdFormProps) {
  return (
    <PaymentSelectionProvider>
      <MultiStepAdFormInner mode={mode} adId={adId} initialType={initialType} />
    </PaymentSelectionProvider>
  )
}
