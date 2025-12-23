"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import type { AdFormData } from "../types"
import { useIsMobile } from "@/hooks/use-mobile"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { getCategoryDisplayName, formatPaymentMethodName, maskAccountNumber } from "@/lib/utils"
import { ProfileAPI } from "@/services/api"
import AddPaymentMethodPanel from "@/app/profile/components/add-payment-method-panel"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { usePaymentSelection } from "./payment-selection-context"
import { useTranslations } from "@/lib/i18n/use-translations"

interface PaymentMethod {
  display_name: string
  method: string
  type: string
  fields: Record<string, any>
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

interface PaymentDetailsFormProps {
  onSubmit: (data: Partial<AdFormData>, errors?: Record<string, string>) => void
  initialData: Partial<AdFormData>
  onBottomSheetOpenChange?: (isOpen: boolean) => void
  userPaymentMethods: UserPaymentMethod[]
  availablePaymentMethods: AvailablePaymentMethod[]
  onRefetchPaymentMethods: () => Promise<void>
}

const FullPagePaymentSelection = ({
  isOpen,
  onClose,
  paymentMethods,
  selectedPaymentMethods,
  onConfirm,
  onAddPaymentMethod,
}: {
  isOpen: boolean
  onClose: () => void
  paymentMethods: (UserPaymentMethod | AvailablePaymentMethod)[]
  selectedPaymentMethods: string[]
  onConfirm: (methods: string[]) => void
  onAddPaymentMethod: () => void
}) => {
  const { t } = useTranslations()
  const isMobile = useIsMobile()
  const [localSelected, setLocalSelected] = useState<string[]>(selectedPaymentMethods)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLocalSelected(selectedPaymentMethods)
      setSearchQuery("")
    }
  }, [isOpen, selectedPaymentMethods])

  const getMethodId = (method: UserPaymentMethod | AvailablePaymentMethod) => {
    return "id" in method ? method.id : method.method
  }

  const filteredMethods = paymentMethods.filter((method) => {
    const displayName = method.display_name.toLowerCase()
    const query = searchQuery.toLowerCase()
    return displayName.includes(query)
  })

  const handleToggle = (methodId: string) => {
    setLocalSelected((prev) => {
      if (prev.includes(methodId)) {
        return prev.filter((id) => id !== methodId)
      } else if (prev.length < 3) {
        return [...prev, methodId]
      }
      return prev
    })
  }

  const handleConfirm = () => {
    onConfirm(localSelected)
    onClose()
  }

  const content = (
    <>
      {isMobile && (
        <div className="px-4 pb-4 text-center">
          <p className="text-base text-grayscale-600">{t("paymentMethod.selectUpTo3")}</p>
        </div>
      )}
      <div className={isMobile ? "px-4 pb-6" : ""}>
        <div className="relative">
          <Image
            src="/icons/search-icon-custom.png"
            alt="Search"
            width={24}
            height={24}
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-10"
          />
          <Input
            type="text"
            placeholder={t("common.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`text-base pl-[40px] md:pl-[48px] pr-10 h-8 md:h-14 bg-grayscale-500 focus:ring-0 rounded-lg placeholder:text-grayscale-text-placeholder placeholder:text-base placeholder:font-normal ${
              searchQuery.length > 0 && isSearchFocused ? "border border-black" : "border-0 focus:border-0"
            }`}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 hover:bg-transparent p-0 h-auto"
            >
              <Image src="/icons/clear-search-icon.png" alt="Clear search" width={24} height={24} />
            </Button>
          )}
        </div>
      </div>
      {!isMobile && filteredMethods.length > 0 && (
        <div className="my-0">
          <p className="text-base text-slate-1200">{t("paymentMethod.selectUpTo3")}</p>
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4 md:px-0 space-y-2">
        {filteredMethods.length === 0 ? (
          <div className="text-center pt-0 pb-4 md:pt-4 md:pb-8 flex flex-col items-center">
            <Image src="/icons/magnifier.png" alt="No results" width={88} height={88} className="mb-0" />
            <p className="text-slate-1200 text-base font-bold text-center mb-2">
              {t("paymentMethod.noMatchingPayment")}
            </p>
            <p className="text-grayscale-text-muted text-base text-center">
              {t("profile.noResultForPrefix")} &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          filteredMethods.map((method) => {
            const methodId = getMethodId(method)
            const isSelected = localSelected.includes(methodId)
            const isDisabled = !isSelected && localSelected.length >= 3

            return (
              <div
                key={methodId}
                className={`bg-grayscale-500 rounded-lg p-4 flex items-center justify-between cursor-pointer ${
                  isSelected ? "border border-black" : "border border-transparent"
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={() => !isDisabled && handleToggle(methodId)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-[10px] w-[10px] rounded-full mx-[11px] ${method.type === "bank" ? "bg-[#26A44E]" : "bg-[#3DAAFF]"}`}
                  />
                  <span className="text-base text-slate-1200">{method.display_name}</span>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => !isDisabled && handleToggle(methodId)}
                    className="w-[14px] h-[14px] data-[state=checked]:bg-black border-2 border-grayscale-text-muted rounded-[2px]"
                  />
                </div>
              </div>
            )
          })
        )}
      </div>
      <div className={isMobile ? "p-4 pt-4" : "pt-4"}>
        <Button onClick={handleConfirm} disabled={localSelected.length === 0} variant="primary" className="w-full">
          {t("common.confirm")}
        </Button>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="pb-[10px]">
            <DrawerTitle className="text-[20px] font-bold">{t("paymentMethod.title")}</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-8 rounded-[32px]">
        <DialogHeader className="relative mb-4">
          <DialogTitle className="text-2xl font-extrabold mt-0">{t("paymentMethod.title")}</DialogTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute right-[-16px] top-[-16px] p-0 rounded-full hover:opacity-80 hover:bg-transparent transition-opacity w-12 h-12 pb-4"
            aria-label="Close"
          >
            <Image src="/icons/button-close.png" alt="Close" width={48} height={48} />
          </Button>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}

const PaymentSelectionContent = ({
  paymentMethods,
  tempSelectedPaymentMethods,
  setTempSelectedPaymentMethods,
  hideAlert,
  setSelectedPaymentMethods,
  handleAddPaymentMethodClick,
}: {
  paymentMethods: (UserPaymentMethod | PaymentMethod)[]
  tempSelectedPaymentMethods: string[]
  setTempSelectedPaymentMethods: (methods: string[]) => void
  hideAlert: () => void
  setSelectedPaymentMethods: (methods: string[]) => void
  handleAddPaymentMethodClick?: () => void
}) => {
  const { t } = useTranslations()
  const [selectedPMs, setSelectedPMs] = useState(tempSelectedPaymentMethods)

  useEffect(() => {
    setSelectedPMs(tempSelectedPaymentMethods)
  }, [tempSelectedPaymentMethods])

  const handlePaymentMethodToggle = (methodId: string) => {
    setSelectedPMs((prev) => {
      const newSelection = prev.includes(methodId)
        ? prev.filter((id) => id !== methodId)
        : prev.length < 3
          ? [...prev, methodId]
          : prev

      return newSelection
    })
  }

  const getMethodId = (method: UserPaymentMethod | PaymentMethod) => {
    return "id" in method ? method.id : method.method
  }

  const getMethodType = (method: UserPaymentMethod | PaymentMethod) => {
    return method.type
  }

  const getMethodDisplayName = (method: UserPaymentMethod | PaymentMethod) => {
    return method.display_name
  }

  const getMethodAccountInfo = (method: UserPaymentMethod | PaymentMethod) => {
    if ("fields" in method && method.fields?.account?.value) {
      return `${formatPaymentMethodName(method.display_name)} - ${maskAccountNumber(method.fields.account.value)}`
    }
    return formatPaymentMethodName(method.display_name)
  }

  return (
    <div className="flex flex-col h-full md:h-[60vh] md:max-h-[600px] pb-4">
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {paymentMethods && <div className="text-grayscale-600">{t("paymentMethod.selectUpTo3")}</div>}
        {paymentMethods.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">{t("adForm.noPaymentMethodsFound")}</p>
          </div>
        ) : (
          paymentMethods.map((method) => {
            const methodId = getMethodId(method)
            const isUserMethod = "id" in method

            return (
              <div
                key={methodId}
                className={`bg-grayscale-500 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-color ${
                  !selectedPMs?.includes(methodId) && selectedPMs?.length >= 3
                    ? "opacity-30 cursor-not-allowed hover:bg-white"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-[6px] gap-2">
                      <div
                        className={`h-2 w-2 rounded-full mr-2 ${
                          getMethodType(method) === "bank" ? "bg-paymentMethod-bank" : "bg-paymentMethod-ewallet"
                        }`}
                      />
                      <div className="flex- flex-col">
                        <span className="text-base text-slate-1200">
                          {getCategoryDisplayName(getMethodType(method))}
                        </span>
                        <div className="font-normal text-grayscale-text-muted text-xs">
                          {isUserMethod ? getMethodAccountInfo(method) : getMethodDisplayName(method)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Checkbox
                    checked={selectedPMs?.includes(methodId)}
                    onCheckedChange={() => handlePaymentMethodToggle(methodId)}
                    disabled={!selectedPMs?.includes(methodId) && selectedPMs?.length >= 3}
                    className="border-neutral-7 data-[state=checked]:bg-black data-[state=checked]:border-black w-[20px] h-[20px] rounded-sm border-[2px] disabled:opacity-30 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )
          })
        )}

        {handleAddPaymentMethodClick && (
          <div
            className="bg-grayscale-500 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => {
              handleAddPaymentMethodClick()
            }}
          >
            <div className="flex items-center">
              <Image src="/icons/plus_icon.png" alt="Plus" width={14} height={24} className="mr-2" />
              <span className="text-slate-1200 text-base">{t("paymentMethod.addPaymentMethod")}</span>
            </div>
          </div>
        )}
      </div>
      <div className="pt-4 md:py-4">
        <Button
          className="w-full"
          disabled={selectedPMs.length == 0}
          onClick={() => {
            setSelectedPaymentMethods(selectedPMs)
            hideAlert()
          }}
        >
          {t("common.confirm")}
        </Button>
      </div>
    </div>
  )
}

export default function PaymentDetailsForm({
  onSubmit,
  initialData,
  onBottomSheetOpenChange,
  userPaymentMethods,
  availablePaymentMethods,
  onRefetchPaymentMethods,
}: PaymentDetailsFormProps) {
  const { t } = useTranslations()
  const isMobile = useIsMobile()
  const [paymentMethods, setPaymentMethods] = useState<string[]>(initialData.paymentMethods || [])
  const [instructions, setInstructions] = useState(initialData.instructions || "")
  const [touched, setTouched] = useState(false)
  const [tempSelectedPaymentMethods, setTempSelectedPaymentMethods] = useState<string[]>([])
  const [showAddPaymentPanel, setShowAddPaymentPanel] = useState(false)
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)
  const [showFullPageModal, setShowFullPageModal] = useState(false)
  const { hideAlert, showAlert } = useAlertDialog()
  const { selectedPaymentMethodIds, setSelectedPaymentMethodIds } = usePaymentSelection()

  const isFormValid = () => {
    return selectedPaymentMethodIds.length > 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)

    const formValid = isFormValid()
    const errors = !formValid ? { paymentMethods: "At least one payment method is required" } : undefined

    let paymentMethodNames: string[] = []

    if (initialData.type === "buy") {
      paymentMethodNames = selectedPaymentMethodIds
    } else {
      paymentMethodNames = selectedPaymentMethodIds
        .map((id) => {
          const method = userPaymentMethods.find((m) => m.id === id)
          return method?.method || ""
        })
        .filter(Boolean)
    }

    const formData = {
      id: initialData.id,
      ...(initialData.type === "sell"
        ? { payment_method_ids: selectedPaymentMethodIds }
        : { paymentMethods: paymentMethodNames }),
      instructions,
    }

    if (formValid) {
      onSubmit(formData)
    } else {
      onSubmit(formData, errors)
    }
  }

  const handleShowPaymentSelection = () => {
    if (initialData.type === "buy") {
      setShowFullPageModal(true)
    } else {
      showAlert({
        title: "Payment method",
        description: (
          <PaymentSelectionContent
            paymentMethods={userPaymentMethods}
            tempSelectedPaymentMethods={selectedPaymentMethodIds}
            setTempSelectedPaymentMethods={setSelectedPaymentMethodIds}
            setSelectedPaymentMethods={setSelectedPaymentMethodIds}
            hideAlert={hideAlert}
            handleAddPaymentMethodClick={handleAddPaymentMethodClick}
          />
        ),
      })
    }
  }

  const handleAddPaymentMethodClick = () => {
    setShowAddPaymentPanel(true)
    hideAlert()
  }

  const handleAddPaymentMethod = async (method: string, fields: Record<string, string>) => {
    try {
      setIsAddingPaymentMethod(true)
      const response = await ProfileAPI.addPaymentMethod(method, fields)

      if (response.success) {
        await onRefetchPaymentMethods()
        setShowAddPaymentPanel(false)
      } else {
        let title = "Unable to add payment method"
        let description = "There was an error when adding the payment method. Please try again."

        if (response.errors.length > 0 && response.errors[0].code === "PaymentMethodDuplicate") {
          title = "Duplicate payment method"
          description = "A payment method with the same values already exists. Add a new one."
        }
        showAlert({
          title,
          description,
          confirmText: "OK",
          type: "warning",
        })
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsAddingPaymentMethod(false)
    }
  }

  const getSelectedPaymentMethodsText = () => {
    const selectedIds = selectedPaymentMethodIds
    const methods = initialData.type === "buy" ? availablePaymentMethods : userPaymentMethods

    if (selectedIds.length === 0) return t("adForm.selectPayment")
    return t("adForm.selected", { count: selectedIds.length })
  }

  useEffect(() => {
    let paymentMethodNames: string[] = []

    if (initialData.type === "buy") {
      paymentMethodNames = selectedPaymentMethodIds
    } else {
      paymentMethodNames = selectedPaymentMethodIds
        .map((id) => {
          const method = userPaymentMethods.find((m) => m.id === id)
          return method?.method || ""
        })
        .filter(Boolean)
    }

    const event = new CustomEvent("paymentFormValidationChange", {
      detail: {
        isValid: isFormValid(),
        formData: {
          payment_method_ids: selectedPaymentMethodIds,
          paymentMethods: paymentMethodNames,
          instructions,
        },
      },
      bubbles: true,
    })
    document.dispatchEvent(event)
  }, [paymentMethods, selectedPaymentMethodIds, instructions, userPaymentMethods, initialData.type])

  return (
    <>
      <div className="h-full flex flex-col">
        <form id="payment-details-form" onSubmit={handleSubmit} className="flex-1">
          <div className="max-w-[800px] mx-auto h-full flex flex-col">
            <div>
              <div className="mb-6">
                <Button
                  variant="outline"
                  className="w-full justify-between px-4 rounded-lg bg-transparent border-input hover:bg-transparent max-h-none h-[56px]"
                  onClick={() => handleShowPaymentSelection()}
                  type="button"
                >
                  <span className="text-left font-normal text-base text-black/[0.72]">
                    {getSelectedPaymentMethodsText()}
                  </span>
                  <Image src="/icons/chevron-down.png" alt="Dropdown icon" width={24} height={24} className="ml-2" />
                </Button>
              </div>

              <div>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={isBuy? t("adForm.sellerInstructions"): t("adForm.buyerInstructions")}
                  className="min-h-[120px] resize-none"
                  maxLength={300}
                />
                <div className="flex justify-between items-start mt-2 text-xs text-gray-500 mx-4">
                  <span>{t("adForm.instructionsDisclaimer")}</span>
                  <span>{instructions.length}/300</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <FullPagePaymentSelection
        isOpen={showFullPageModal}
        onClose={() => setShowFullPageModal(false)}
        paymentMethods={initialData.type === "buy" ? availablePaymentMethods : userPaymentMethods}
        selectedPaymentMethods={selectedPaymentMethodIds}
        onConfirm={(methods) => setSelectedPaymentMethodIds(methods)}
        onAddPaymentMethod={handleAddPaymentMethodClick}
      />

      {showAddPaymentPanel && (
        <AddPaymentMethodPanel
          onAdd={handleAddPaymentMethod}
          isLoading={isAddingPaymentMethod}
          onClose={() => setShowAddPaymentPanel(false)}
        />
      )}
    </>
  )
}
