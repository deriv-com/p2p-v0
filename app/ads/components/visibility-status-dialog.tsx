"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslations } from "@/lib/i18n/use-translations"

interface VisibilityStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reasons: string[]
}

export function VisibilityStatusDialog({ open, onOpenChange, reasons }: VisibilityStatusDialogProps) {
  const isMobile = useIsMobile()
  const { t } = useTranslations()

  const content = (
    <div className="space-y-4 py-4">
      <p className="text-sm text-slate-600">
        {t("myAds.visibilityStatusDescription")}
      </p>
      <ul className="space-y-2">
        {reasons.map((reason, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-orange-600 mt-1">•</span>
            <span className="text-sm text-slate-900">{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="font-bold text-xl">{t("myAds.visibilityStatus")}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-bold text-xl">{t("myAds.visibilityStatus")}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
