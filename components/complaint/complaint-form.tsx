"use client"

import { useState } from "react"
import Image from "next/image"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DialogClose } from "@/components/ui/dialog"
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
      <div className="flex-1 px-6 pt-2 pb-4 space-y-4 overflow-y-auto">
        {/* Subtitle */}
        <p className="text-grayscale-600">{t("complaint.subtitle")}</p>

        {/* Warning card */}
        <Alert variant="warning">
          <InfoCircleIcon />
          <AlertTitle className="font-bold text-slate-1200 mb-2">{t("complaint.warningTitle")}</AlertTitle>
          <AlertDescription className="text-sm text-slate-1200">
            {t("complaint.warningBodyPrefix")}
            <strong>{t("complaint.warningBodyBold")}</strong>
            {t("complaint.warningBodySuffix")}
          </AlertDescription>
        </Alert>

        {/* Reason tiles */}
        <div className="space-y-2">
          {/* What went wrong? */}
          <p className="text-slate-1200">{t("complaint.whatWentWrong")}</p>
          {filteredOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOption(option.value === selectedOption ? "" : option.value)}
              className={cn(
                "w-full text-left rounded-lg p-4 transition-colors bg-grayscale-500",
                selectedOption === option.value
                  ? "border border-slate-1400"
                  : "border border-transparent",
              )}
            >
              <p className="text-slate-1200">{t(`complaint.${option.value}`)}</p>
              <p className="text-xs text-grayscale-text-muted mt-0.5">{t(`complaint.${option.hintKey}`)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom: checkbox + label, button below on mobile / inline on desktop */}
      <div className="px-6 pb-6 pt-2 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Checkbox
            id="complaint-confirm"
            checked={confirmed}
            onCheckedChange={(v) => setConfirmed(v === true)}
            className="shrink-0 mt-0.5 w-[20px] h-[20px] rounded-sm border-[2px] border-neutral-7 data-[state=checked]:bg-black data-[state=checked]:border-black"
          />
          <Label htmlFor="complaint-confirm" className="font-normal text-grayscale-600 text-sm cursor-pointer leading-snug">
            {t("complaint.confirmCheckbox")}
          </Label>
        </div>
        <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="w-full md:w-auto shrink-0">
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
      <DialogContent className="sm:max-w-xl sm:rounded-[32px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="tracking-normal font-bold text-2xl text-left">
            {t("complaint.title")}
          </DialogTitle>
          <DialogClose
            aria-label={t("common.close")}
            className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100 focus:outline-none focus-visible:ring-2"
          >
            <Image src="/icons/close-icon.png" alt="" aria-hidden="true" width={24} height={24} />
          </DialogClose>
        </DialogHeader>
        <ComplaintContent />
      </DialogContent>
    </Dialog>
  )
}
