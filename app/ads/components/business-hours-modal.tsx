"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslations } from "@/lib/i18n/use-translations"
import { BusinessHoursForm } from "./business-hours-form"

export interface BusinessHoursModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Responsive container — Dialog on desktop, bottom Sheet on mobile.
 * The form lives in a single component; only the surrounding chrome differs.
 */
export function BusinessHoursModal({ open, onOpenChange }: BusinessHoursModalProps) {
  const isMobile = useIsMobile()
  const { t } = useTranslations()
  const close = () => onOpenChange(false)

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          hideCloseButton
          className="rounded-t-2xl max-h-[92vh] overflow-y-auto p-6"
        >
          <SheetTitle className="sr-only">{t("myAds.businessHours.title")}</SheetTitle>
          <BusinessHoursForm onClose={close} />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogTitle className="sr-only">{t("myAds.businessHours.title")}</DialogTitle>
        <BusinessHoursForm onClose={close} />
      </DialogContent>
    </Dialog>
  )
}
