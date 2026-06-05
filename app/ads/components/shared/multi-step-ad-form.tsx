"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import AdDetailsForm from "../ad-details-form"
import PaymentDetailsForm from "../payment-details-form"
import ShareAdPage from "../share-ad-page"
import AdSuccessScreen from "../ad-success-screen"
import { AdsAPI, ProfileAPI } from "@/services/api"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { ProgressSteps } from "./progress-steps"
import Navigation from "@/components/navigation"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import OrderTimeLimitSelector from "./order-time-limit-selector"
import AdVisibilitySelector from "./ad-visibility-selector"
import MinimumTierSelector, { type MinimumTradeBand } from "./minimum-tier-selector"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import CountrySelection from "./country-selection"
import { PaymentSelectionProvider, usePaymentSelection } from "../payment-selection-context"
import { useToast } from "@/hooks/use-toast"
import { type Country } from "@/services/api/api-auth"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useWebSocketContext } from "@/contexts/websocket-context"
import { useUserDataStore } from "@/stores/user-data-store"
import { useCreateAd, useUpdateAd, useSettings, useUserPaymentMethods, usePaymentMethods } from "@/hooks/use-api-queries"
import type { Ad } from "@/types"
import { useTrackers } from "@/analytics/useTrackers"
import type { AdFormData } from "@/app/ads/types"
import {
  buildAdvertEditPatch,
  buildCurrentEditState,
  createAdvertEditSnapshot,
  hasAdvertEditChanges,
  type AdvertEditSnapshot,
} from "@/lib/ads/advert-edit-patch"

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
  const { track } = useTrackers()
  const router = useRouter()
  const isMobile = useIsMobile()
  const localCurrency = useUserDataStore((state) => state.localCurrency)

  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<AdFormData>>(
    initialType ? { type: initialType } : {},
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adFormValid, setAdFormValid] = useState(false)
  const [paymentFormValid, setPaymentFormValid] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(false)
  const { selectedPaymentMethodIds, setSelectedPaymentMethodIds } = usePaymentSelection()
  const { showAlert, hideAlert } = useAlertDialog()
  const [orderTimeLimit, setOrderTimeLimit] = useState(15)
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [currencies, setCurrencies] = useState<Array<{ code: string, name: string }>>([])
  const [userPaymentMethods, setUserPaymentMethods] = useState<UserPaymentMethod[]>([])
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<AvailablePaymentMethod[]>([])
  const [adVisibility, setAdVisibility] = useState<string>("everyone")
  const [minimumTradeBand, setMinimumTradeBand] = useState<MinimumTradeBand>(null)
  const { leaveExchangeRatesChannel } = useWebSocketContext()
  const { userData } = useUserDataStore()
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [successAd, setSuccessAd] = useState<Ad | null>(null)
  const [showSharePage, setShowSharePage] = useState(false)
  const [originalEditSnapshot, setOriginalEditSnapshot] = useState<AdvertEditSnapshot | null>(null)

  const createAdMutation = useCreateAd()
  const updateAdMutation = useUpdateAd()
  const { data: settingsData, isLoading: isLoadingSettings } = useSettings()
  const { data: userPaymentMethodsData, refetch: refetchUserPaymentMethods } = useUserPaymentMethods()
  const { data: paymentMethodsData } = usePaymentMethods()

  const formDataRef = useRef<Partial<AdFormData>>({})
  const previousTypeRef = useRef<"buy" | "sell" | undefined>(initialType)

  const isLoadingCountries = isLoadingSettings

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

  useEffect(() => {
    if (userPaymentMethodsData) {
      setUserPaymentMethods(userPaymentMethodsData.data || [])
    }

    if (paymentMethodsData) {
      const methods = Array.isArray(paymentMethodsData) ? paymentMethodsData : []
      setAvailablePaymentMethods(methods)
    }
  }, [userPaymentMethodsData, paymentMethodsData])

  useEffect(() => {
    if (!settingsData) return

    try {
      const countriesData = settingsData.countries || []
      setCountries(countriesData)

      const uniqueCurrencies = countriesData
        .filter((c: Country) => c.currency)
        .reduce((acc, country) => {
          if (!acc.some(c => c.code === country.currency)) {
            acc.push({ code: country.currency, name: country.currency_name });
          }
          return acc;
        }, [] as { code: string; name: string }[])
        .sort((a, b) => a.code.localeCompare(b.code));
      setCurrencies(uniqueCurrencies)
    } catch (error) {
      setCountries([])
      setCurrencies([])
    }
  }, [settingsData])

  useEffect(() => {
    if (mode !== "create") return
    if (!localCurrency) return
    if (formData?.forCurrency) return
    if (currencies.length === 0) return
    if (!currencies.some((c: { code: string }) => c.code === localCurrency)) return

    setFormData((prev: any) => {
      const next = { ...prev, forCurrency: localCurrency }
      formDataRef.current = { ...formDataRef.current, forCurrency: localCurrency }
      return next
    })
  }, [mode, localCurrency, currencies, formData?.forCurrency])

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
              instructions: (data.description || "").trim(),
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

            if (data.is_private) {
              setAdVisibility("closed-group")
            } else {
              setAdVisibility("everyone")
            }

            const apiBand = data.minimum_trade_band as string | null | undefined
            const KNOWN_TIERS = new Set(["silver", "gold", "diamond"])
            const normalizedBand =
              apiBand && KNOWN_TIERS.has(apiBand) ? (apiBand as MinimumTradeBand) : null
            setMinimumTradeBand(normalizedBand)

            setOriginalEditSnapshot(
              createAdvertEditSnapshot({
                type: data.type,
                minimumOrderAmount: data.minimum_order_amount,
                maximumOrderAmount: data.maximum_order_amount,
                exchangeRate: Number.parseFloat(data.exchange_rate),
                exchangeRateType: data.exchange_rate_type,
                orderExpiryPeriod: data.order_expiry_period ?? 15,
                availableCountries: data.available_countries,
                minimumTradeBand: apiBand,
                isPrivate: !!data.is_private,
                description: data.description,
                paymentMethodNames: paymentMethodNames,
                paymentMethodIds: paymentMethodIds,
              }),
            )
          }

        } catch (error) {
          toast({
            description: t("adForm.failedToLoadAd"),
            className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
            duration: 2500,
          })
        } finally {
          setIsLoadingInitialData(false)
        }
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

  const hasEditChanges = useMemo(() => {
    if (mode !== "edit" || !originalEditSnapshot) {
      return false
    }

    const current = buildCurrentEditState(formData, {
      orderTimeLimit,
      selectedCountries,
      minimumTradeBand,
      isPrivate: adVisibility === "closed-group",
      selectedPaymentMethodIds:
        formData.type === "sell" ? selectedPaymentMethodIds : [],
    })

    return hasAdvertEditChanges(originalEditSnapshot, current)
  }, [
    mode,
    originalEditSnapshot,
    formData,
    orderTimeLimit,
    selectedCountries,
    minimumTradeBand,
    adVisibility,
    selectedPaymentMethodIds,
  ])

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
        AdvertFixedRateMinimum: t("adForm.advertFixedRateMinimumMessage"),
        AdvertFixedRateMaximum: t("adForm.advertFixedRateMaximumMessage"),
        AdvertFloatRateMaximum: t("adForm.advertFloatRateMaximumMessage"),
        AdvertExchangeRateDuplicate: t("adForm.duplicateRateMessage"),
        AdvertOrderRangeOverlap: t("adForm.rangeOverlapMessage"),
        AdvertPaymentMethodDuplicate: t("adForm.duplicatePaymentMethodMessage"),
        AdvertPaymentMethodRemoveOpenOrder: t("adForm.paymentMethodRemoveOpenOrderMessage")
      }

      if (errorCodeMap[errors[0].code]) {
        return errorCodeMap[errors[0].code]
      }

      return t("adForm.genericErrorCodeMessage", { code: errors[0].code })
    }

    return t("adForm.genericProcessingErrorMessage")
  }

  const handleFinalSubmit = () => {
    const finalData = { ...formDataRef.current }

    const selectedPaymentMethodIdsForSubmit = finalData.type === "sell" ? selectedPaymentMethodIds : []
    const isPrivate = adVisibility === "closed-group"

    if (!isPrivate && isDowngradedPrivate) {
      showAlert({
        title: t("adForm.adVisibilityUpdate"),
        description: t("adForm.adVisibilityUpdateDescription"),
        confirmText: t("common.confirm"),
        type: "warning",
        onConfirm: () => {
          proceedWithSubmit(finalData, selectedPaymentMethodIdsForSubmit, isPrivate)
        },
      })
      return
    }

    proceedWithSubmit(finalData, selectedPaymentMethodIdsForSubmit, isPrivate)
  }

  const proceedWithSubmit = (
    finalData: any,
    selectedPaymentMethodIdsForSubmit: string[],
    isPrivate: boolean
  ) => {
    setIsSubmitting(true)

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
        is_private: isPrivate,
        ...(minimumTradeBand ? { minimum_trade_band: minimumTradeBand } : {}),
        ...(finalData.type === "buy"
          ? { payment_method_names: finalData.paymentMethods || [] }
          : { payment_method_ids: selectedPaymentMethodIdsForSubmit }),
      }

      createAdMutation.mutate(payload, {
        onSuccess: (result) => {
          track("ek_ad_created_create_ad_step_3")
          setIsSubmitting(false)
          const successAdData = {
            ...result.data,
            limits: {
              min: result.data.minimum_order_amount,
              max: result.data.maximum_order_amount,
              currency: result.data.account_currency
            },
            rate: {
              value: result.data.exchange_rate_type === "float"
                ? `${result.data.exchange_rate > 0 ? "+" : ""}${result.data.exchange_rate}%`
                : result.data.exchange_rate,
              percentage: result.data.exchange_rate || "0",
              currency: result.data.payment_currency
            }
          }
          setSuccessAd(successAdData)
          setShowSuccessScreen(true)
        },
        onError: (error: any) => {
          setIsSubmitting(false)
          handleAdError(error, "create")
        },
      })
    } else {
      if (!originalEditSnapshot) {
        setIsSubmitting(false)
        return
      }

      const current = buildCurrentEditState(finalData, {
        orderTimeLimit,
        selectedCountries,
        minimumTradeBand,
        isPrivate,
        selectedPaymentMethodIds: selectedPaymentMethodIdsForSubmit,
      })

      const patch = buildAdvertEditPatch(originalEditSnapshot, current)

      if (Object.keys(patch).length === 0) {
        setIsSubmitting(false)
        router.push("/ads")
        return
      }

      updateAdMutation.mutate(
        { id: finalData.id, adData: patch },
        {
          onSuccess: () => {
            track("ek_ad_updated_create_ad_step_3")
            setIsSubmitting(false)
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
            router.push("/ads")
          },
          onError: (error: any) => {
            setIsSubmitting(false)
            handleAdError(error, "update")
          },
        }
      )
    }
  }

  const getErrorConfirmText = (errorName: string): string => {
    const confirmTextMap: Record<string, string> = {
      AdvertOrderRangeOverlap: t("adForm.editLimitsForRangeOverlap"),
      AdvertFixedRateMinimum: t("adForm.updateRate"),
      AdvertFixedRateMaximum: t("adForm.updateRate"),
      AdvertFloatRateMaximum: t("adForm.updateRate"),
      AdvertPaymentMethodDuplicate: t("adForm.updatePaymentMethods"),
      AdvertPaymentMethodRemoveOpenOrder: t("common.gotIt"),
    }
    return confirmTextMap[errorName] || t("adForm.updateAd")
  }

  const handleAdError = (error: any, mode: "create" | "update") => {
    let errorMessage = t("adForm.genericProcessingErrorMessage")
    let errorName = "GenericError"

    if (error?.errors && Array.isArray(error.errors)) {
      errorMessage = formatErrorMessage(error.errors)
      if (error.errors[0]?.code) {
        errorName = error.errors[0].code
      }
    } else if (error?.response?.data?.errors) {
      errorMessage = formatErrorMessage(error.response.data.errors)
      if (error.response.data.errors[0]?.code) {
        errorName = error.response.data.errors[0].code
      }
    }

    const errorInfoMap: Record<string, { title: string; type: "error" | "warning"; onConfirm?: () => void }> = {
      AdvertExchangeRateDuplicate: {
        title: t("adForm.duplicateRateTitle"),
        type: "warning",
      },
      AdvertOrderRangeOverlap: {
        title: t("adForm.rangeOverlapTitle"),
        type: "warning",
      },
      AdvertLimitReached: {
        title: t("adForm.adLimitReachedTitle"),
        type: "error",
      },
      AdvertActiveCountExceeded: {
        title: t("adForm.adLimitReachedTitle"),
        type: "error",
        onConfirm: () => {
          router.push("/ads")
        },
      },
      InsufficientBalance: {
        title: t("adForm.insufficientBalanceTitle"),
        type: "error",
      },
      InvalidExchangeRate: {
        title: t("adForm.invalidValuesTitle"),
        type: "error",
      },
      InvalidOrderAmount: {
        title: t("adForm.invalidValuesTitle"),
        type: "error",
      },
      AdvertTotalAmountExceeded: {
        title: t("adForm.amountExceedsBalanceTitle"),
        type: "error",
      },
      AdvertFixedRateMinimum: {
        title: t("adForm.advertFixedRateMinimumTitle"),
        type: "error",
      },
      AdvertFixedRateMaximum: {
        title: t("adForm.advertFixedRateMaximumTitle"),
        type: "error",
      },
      AdvertFloatRateMaximum: {
        title: t("adForm.advertFloatRateMaximumTitle"),
        type: "error",
      },
      AdvertPaymentMethodDuplicate: {
        title: t("adForm.duplicatePaymentMethodTitle"),
        type: "error",
        onConfirm: () => {
          router.push("/profile?tab=payment")
        },
      },
      AdvertPaymentMethodRemoveOpenOrder: {
        title: t("adForm.paymentMethodRemoveOpenOrderTitle"),
        type: "error",
        onConfirm: () => {},
      },
    }

    const errorInfo = errorInfoMap[errorName] || {
      title: mode === "create" ? t("adForm.failedToCreateAd") : t("adForm.failedToUpdateAd"),
      type: "error" as "error" | "warning",
    }

    track("ek_ad_submission_failed_create_ad_step_3", { error_code: errorName, error_message: errorMessage })
    showAlert({
      title: errorInfo.title,
      description: errorMessage,
      confirmText: getErrorConfirmText(errorName),
      type: errorInfo.type,
      onConfirm: () => {
        if (errorInfo.onConfirm) {
          errorInfo.onConfirm()
        } else {
          setCurrentStep(0)
        }
      },
    })
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

      track("ek_next_create_ad_step_1")
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

      track("ek_next_create_ad_step_2")
      setCurrentStep(2)
      return
    }

    if (currentStep === 2) {
      if (mode === "edit" && (!adFormValid || !hasEditChanges)) {
        return
      }

      if (isSubmitting) {
        return
      }

      track("ek_submit_ad_create_ad_step_3", {
        submit_ad_action: mode === "create" ? "create_ad" : "save_changes",
      })
      handleFinalSubmit()
      return
    }
  }

  const handleClose = () => {
    track(`ek_close_create_ad_step_${currentStep + 1}`)
    if (mode === "create") {
      showAlert({
        title: t("adForm.cancelAdCreation"),
        description: t("adForm.cancelAdCreationDescription"),
        cancelText: t("adForm.continueAdCreation"),
        confirmText: t("common.cancel"),
        type: "warning",
        onCancel: () => {
          track("ek_continue_editing_cancel_ad_sheet")
          hideAlert()
        },
        onConfirm: () => {
          track("ek_confirm_cancel_ad_cancel_ad_sheet")
          const finalData = { ...formDataRef.current }
          const currency = finalData?.buyCurrency || "USD"
          leaveExchangeRatesChannel(currency)
          router.push("/ads")
        },
      })
    } else {
      const finalData = { ...formDataRef.current }
      const currency = finalData?.buyCurrency || "USD"
      leaveExchangeRatesChannel(currency)
      router.push("/ads")
    }
  }

  const isDiamond = userData.trade_band === "diamond"
  const initialIsPrivate = originalEditSnapshot?.isPrivate ?? false
  const isDowngradedPrivate = mode === "edit" && initialIsPrivate && !isDiamond
  const showVisibility = isDiamond || isDowngradedPrivate
  const mustSwitchEveryone = isDowngradedPrivate && adVisibility === "closed-group"

  const isButtonDisabled =
    (currentStep === 0 && !adFormValid) ||
    (currentStep === 1 && mode === "create" && formData.type === "buy" && !paymentFormValid) ||
    (currentStep === 1 && formData.type === "sell" && !hasSelectedPaymentMethods) ||
    (currentStep === 2 && mode === "edit" && (!adFormValid || !hasEditChanges)) ||
    (currentStep === 2 && mustSwitchEveryone) ||
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
    <>
      {showSuccessScreen && successAd ? (
        <>
          <AdSuccessScreen
            ad={successAd}
            onShareClick={() => {
              track("ek_share_ad_ad_created_sucess")
              setShowSharePage(true)
            }}
          />
          {showSharePage && (
            <ShareAdPage
              ad={successAd}
              onClose={() => {
                setShowSharePage(false)
                setShowSuccessScreen(false)
                router.push("/ads")
              }}
            />
          )}
        </>
      ) : (
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="fixed w-full h-full bg-white top-0 left-0 md:px-[24px] md:overflow-y-auto">
            <div className="md:max-w-[620px] mx-auto pb-12 md:pb-0 mt-0 progress-steps-container overflow-x-hidden md:overflow-visible h-full md:h-auto md:px-0">
              <div className="sticky top-0 z-10 bg-white">
                <Navigation
                  isBackBtnVisible={currentStep != 0}
                  isVisible={false}
                  onBack={() => {
                    track(`ek_back_create_ad_step_${currentStep + 1}`)
                    const updatedStep = currentStep - 1
                    setCurrentStep(updatedStep)
                  }}
                  onClose={handleClose}
                  title=""
                  className="md:h-16 md:pt-8"
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
              </div>

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
                    onRefetchPaymentMethods={refetchUserPaymentMethods}
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
                                className="cursor-pointer"
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
                                className="cursor-pointer"
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

                    <div className="w-full md:w-[100%]">
                      <div className="flex gap-[4px] items-center mb-4">
                        <h3 className="text-base font-bold leading-6 tracking-normal">
                          {formData.type === "sell"
                            ? t("adForm.minimumBuyerTier")
                            : t("adForm.minimumSellerTier")}
                        </h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Image
                                src="/icons/info-circle.svg"
                                alt="Info"
                                width={24}
                                height={24}
                                className="cursor-pointer"
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-white">
                                {formData.type === "sell"
                                  ? t("adForm.minimumBuyerTierHelper")
                                  : t("adForm.minimumSellerTierHelper")}
                              </p>
                              <TooltipArrow className="fill-black" />
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <MinimumTierSelector
                        value={minimumTradeBand}
                        onValueChange={setMinimumTradeBand}
                        adType={(formData.type as "buy" | "sell") || "buy"}
                      />
                    </div>
                    {showVisibility && (<div>
                      <div className="flex gap-[4px] items-center mb-4">
                        <h3 className="text-base font-bold leading-6 tracking-normal">{t("adForm.adVisibility")}</h3>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Image
                                src="/icons/info-circle.svg"
                                alt="Info"
                                width={24}
                                height={24}
                                className="cursor-pointer"
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-white">{t("adForm.adVisibilityTooltip")}</p>
                              <TooltipArrow className="fill-black" />
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <AdVisibilitySelector value={adVisibility} onValueChange={setAdVisibility} closedGroupDisabled={isDowngradedPrivate} />
                    </div>)}
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
                <div className="hidden md:block w-full bg-white h-24 md:sticky md:bottom-0">
                  <div className="flex justify-end px-6 pt-6">
                    <Button type="button" onClick={handleButtonClick} disabled={isButtonDisabled || isSubmitting}>
                      {isSubmitting ? (
                        <Image src="/icons/spinner.png" alt="Loading" width={20} height={20} className="animate-spin" />
                      ) : (
                        getButtonText()
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </>
  )
}

export default function MultiStepAdForm({ mode, adId, initialType }: MultiStepAdFormProps) {
  return (
    <PaymentSelectionProvider>
      <MultiStepAdFormInner mode={mode} adId={adId} initialType={initialType} />
    </PaymentSelectionProvider>
  )
}
