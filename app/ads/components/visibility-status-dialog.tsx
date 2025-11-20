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

export function VisibilityStatusDialog({ open, onOpenChange, reasons }: VisibilityStatusDialogProps) {
  const isMobile = useIsMobile()
  const { t } = useTranslations()

  const content = (
    <div className="space-y-4 py-4">
      <ul>
        {reasons.map((reason, index) => {
          const reasonContent = getReasonContent(reason, t)
          return (
            <li key={index} className="flex items-start py-1">
              <p className="text-base text-grayscale-600">{reasonContent.description}</p>
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
            <DrawerTitle className="font-bold text-xl text-slate-1200">{t("myAds.visibilityStatus")}</DrawerTitle>
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
          <DialogTitle className="font-bold text-2xl text-slate-1200">{t("myAds.visibilityStatus")}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
