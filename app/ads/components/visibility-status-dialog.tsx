"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslations } from "@/lib/i18n/use-translations"
import { AlertCircle } from "lucide-react"

interface VisibilityStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reasons: string[]
  onActivateAd?: () => void
  onEditAd?: () => void
  onAddPaymentMethod?: () => void
  onContactSupport?: () => void
}

const getReasonContent = (reason: string, t: (key: string) => string) => {
  const reasonKeyMap: Record<string, string> = {
    advert_inactive: "advertInactive",
    advert_remaining: "advertRemaining",
    advertiser_daily_limit: "advertiserDailyLimit",
    advertiser_balance: "advertiserBalance",
    advertiser_adverts_unlisted: "advertiserAdvertsUnlisted",
    advertiser_status: "advertiserStatus",
    advertiser_schedule_unavailable: "advertiserScheduleUnavailable",
    advertiser_temp_ban: "advertiserTempBan",
    advertiser_no_private_groups: "advertiserNoPrivateGroups",
    advert_float_rate_disabled: "advertFloatRateDisabled",
    advert_no_payment_methods: "advertNoPaymentMethods",
  }

  const reasonKey = reasonKeyMap[reason]

  if (reasonKey) {
    return {
      title: t(`visibilityStatus.${reasonKey}.title`),
      description: t(`visibilityStatus.${reasonKey}.description`),
    }
  }

  return {
    title: reason,
    description: t("visibilityStatus.unknownReason"),
  }
}

const getReasonAction = (reason: string, t: (key: string) => string) => {
  const actionMap: Record<string, { label: string; action: string }> = {
    advert_inactive: { label: t("visibilityStatus.actions.activateAd"), action: "activate" },
    advert_remaining: { label: t("visibilityStatus.actions.editAd"), action: "edit" },
    advertiser_daily_limit: { label: t("visibilityStatus.actions.editAd"), action: "edit" },
    advertiser_balance: { label: t("visibilityStatus.actions.addFunds"), action: "edit" },
    advertiser_adverts_unlisted: { label: t("visibilityStatus.actions.activateAds"), action: "edit" },
    advertiser_status: { label: t("visibilityStatus.actions.contactSupport"), action: "close" },
    advertiser_schedule_unavailable: { label: t("visibilityStatus.actions.editSchedule"), action: "edit" },
    advertiser_temp_ban: { label: t("visibilityStatus.actions.viewProfile"), action: "view_profile" },
    advertiser_no_private_groups: { label: t("visibilityStatus.actions.editAd"), action: "edit" },
    advert_float_rate_disabled: { label: t("visibilityStatus.actions.editAd"), action: "edit" },
    advert_no_payment_methods: { label: t("visibilityStatus.actions.addPaymentMethod"), action: "add_payment" },
  }

  return actionMap[reason]
}

export function VisibilityStatusDialog({
  open,
  onOpenChange,
  reasons,
  onActivateAd,
  onEditAd,
  onAddPaymentMethod,
  onContactSupport,
}: VisibilityStatusDialogProps) {
  const isMobile = useIsMobile()
  const { t } = useTranslations()

  const handleAction = (actionType: string) => {
    switch (actionType) {
      case "activate":
        onActivateAd?.()
        break
      case "edit":
      case "edit_schedule":
      case "view_profile":
        onEditAd?.()
        break
      case "add_payment":
        onAddPaymentMethod?.()
        break
      case "add_funds":
        // Navigate to wallet or trigger deposit flow
        window.location.href = "/wallet"
        break
      case "contact_support":
        onContactSupport?.()
        break
    }
    onOpenChange(false)
  }

  const content = (
    <div className="space-y-4 py-4">
      <ul className="space-y-3">
        {reasons.map((reason, index) => {
          const reasonContent = getReasonContent(reason, t)
          const actionInfo = getReasonAction(reason, t)
          return (
            <li key={index} className="flex flex-col gap-3 rounded-lg border border-grayscale-200 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-status-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-slate-1200 mb-1">{reasonContent.title}</h4>
                  <p className="text-sm text-grayscale-600">{reasonContent.description}</p>
                </div>
              </div>
              {actionInfo && (
                <Button onClick={() => handleAction(actionInfo.action)} className="w-full" variant="default">
                  {actionInfo.label}
                </Button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="font-bold text-2xl text-slate-1200 text-left">
              {t("myAds.visibilityStatus")}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md sm:rounded-[32px]">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl text-slate-1200">{t("myAds.visibilityStatus")}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
