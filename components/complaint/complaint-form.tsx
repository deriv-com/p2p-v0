"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { InfoCircleIcon } from "@/components/icons/info-circle"
import { useIsMobile } from "@/hooks/use-mobile"
import { OrdersAPI } from "@/services/api"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { cn } from "@/lib/utils"
import { type ComplaintProps, COMPLAINT_OPTIONS } from "./types"

export function ComplaintForm({ isOpen, onClose, onSubmit, orderId, type }: ComplaintProps) {
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [confirmed, setConfirmed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMobile = useIsMobile()
  const { t } = useTranslations()
  const { showAlert } = useAlertDialog()

  const canSubmit = !!selectedOption && confirmed

  const handleSubmit = async () => {
    if (canSubmit && !isSubmitting) {
      setIsSubmitting(true)
      try {
        const result = await OrdersAPI.disputeOrder(orderId, selectedOption)
        if (result.errors?.length === 0 || result.success) {
          onSubmit?.()
        }
        setSelectedOption("")
        setConfirmed(false)
        onClose()
      } catch (error) {
        const errorCode = error instanceof Error ? error.message : "UnknownError"
        if (errorCode === "OrderTempLocked") {
          showAlert({
            title: t("order.tempLockedTitle"),
            description: t("order.tempLockedDescription"),
            confirmText: t("order.tryAgain"),
            cancelText: t("order.goBack"),
            type: "warning",
            onCancel: () => handleClose(),
          })
        } else {
          console.error("Error submitting complaint:", error)
          onClose()
        }
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleClose = () => {
    setSelectedOption("")
    setConfirmed(false)
    onClose()
  }

  const filteredOptions = COMPLAINT_OPTIONS.filter((option) => option.type === type)

  const ComplaintContent = () => (
    <div className="flex flex-col">
      <div className="flex-1 px-6 pb-4 space-y-4 overflow-y-auto">
        {/* Subtitle */}
        <p className="text-sm text-slate-500">{t("complaint.subtitle")}</p>

        {/* Warning card */}
        <div className="rounded-xl bg-warning-bg px-4 py-3">
          <div className="flex items-start gap-2 mb-1">
            <InfoCircleIcon className="text-warning-icon shrink-0 mt-0.5" />
            <span className="text-sm font-bold text-slate-1200">{t("complaint.warningTitle")}</span>
          </div>
          <p className="text-sm text-slate-1200 pl-7">
            {t("complaint.warningBodyPrefix")}
            <strong>{t("complaint.warningBodyBold")}</strong>
            {t("complaint.warningBodySuffix")}
          </p>
        </div>

        {/* What went wrong? */}
        <p className="text-sm font-medium text-slate-1200">{t("complaint.whatWentWrong")}</p>

        {/* Reason tiles */}
        <div className="space-y-2">
          {filteredOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOption(option.value === selectedOption ? "" : option.value)}
              className={cn(
                "w-full text-left rounded-xl px-4 py-3 transition-colors",
                selectedOption === option.value
                  ? "bg-white border border-slate-1200"
                  : "bg-slate-75 border border-transparent hover:bg-slate-100",
              )}
            >
              <p className="text-sm font-medium text-slate-1200">{t(`complaint.${option.value}`)}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t(`complaint.${option.hintKey}`)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row: checkbox + submit button */}
      <div className="px-6 pb-6 pt-2 flex items-center gap-3">
        <Checkbox
          id="complaint-confirm"
          checked={confirmed}
          onCheckedChange={(v) => setConfirmed(v === true)}
          className="shrink-0"
        />
        <label htmlFor="complaint-confirm" className="text-sm text-slate-600 cursor-pointer flex-1 leading-snug">
          {t("complaint.confirmCheckbox")}
        </label>
        <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="shrink-0">
          {isSubmitting ? (
            <Image src="/icons/spinner.png" alt="Loading" width={20} height={20} className="animate-spin" />
          ) : (
            t("complaint.submit")
          )}
        </Button>
      </div>
    </div>
  )

  if (!isOpen) return null

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleClose}>
        <DrawerContent side="bottom" className="h-auto max-h-[90vh] rounded-t-2xl px-0">
          <DrawerHeader className="pb-2 px-6">
            <DrawerTitle className="text-xl font-bold text-left">{t("complaint.title")}</DrawerTitle>
          </DrawerHeader>
          <ComplaintContent />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md sm:rounded-[32px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="tracking-normal font-bold text-2xl text-left">
            {t("complaint.title")}
          </DialogTitle>
        </DialogHeader>
        <ComplaintContent />
      </DialogContent>
    </Dialog>
  )
}
