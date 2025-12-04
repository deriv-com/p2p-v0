"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import { OrdersAPI } from "@/services/api"
import { useTranslations } from "@/lib/i18n/use-translations"
import { type ComplaintProps, COMPLAINT_OPTIONS } from "./types"

export function ComplaintForm({ isOpen, onClose, onSubmit, orderId, type }: ComplaintProps) {
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMobile = useIsMobile()
  const { t } = useTranslations()

  const handleSubmit = async () => {
    if (selectedOption && !isSubmitting) {
      setIsSubmitting(true)
      try {
        const result = await OrdersAPI.disputeOrder(orderId, selectedOption)
        if (result.errors?.length === 0 || result.success) {
          onSubmit?.()
        }
        setSelectedOption("")
        onClose()
      } catch (error) {
        console.error("Error submitting complaint:", error)
        onClose()
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleClose = () => {
    setSelectedOption("")
    onClose()
  }

  const ComplaintContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 md:px-0 space-y-6">
        <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
          {COMPLAINT_OPTIONS.filter((option) => option.type === type).map((option) => (
            <div key={option.id} className="flex items-start space-x-3">
              <RadioGroupItem value={option.value} id={option.id} className="mt-1 border-grayscale-100 text-black" />
              <Label
                htmlFor={option.id}
                className="font-normal text-base leading-relaxed cursor-pointer flex-1 text-grayscale-100"
              >
                {t(`complaint.${option.value}`)}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <div className="text-base">{t("complaint.helpText")}</div>
      </div>

      <div className="p-4 md:px-0">
        <Button
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitting}
          className="w-full disabled:opacity-[0.24]"
        >
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
        <DrawerContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl px-0">
          <DrawerHeader className="pb-4">
            <DrawerTitle className="text-xl font-bold text-center">{t("complaint.title")}</DrawerTitle>
          </DrawerHeader>
          <ComplaintContent />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md sm:rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="tracking-normal font-bold text-2xl">{t("complaint.title")}</DialogTitle>
        </DialogHeader>
        <ComplaintContent />
      </DialogContent>
    </Dialog>
  )
}
