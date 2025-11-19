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
  const reasonMap: Record<string, { title: string; description: string }> = {
    advert_inactive: {
      title: t("visibilityStatus.advertInactive.title"),
      description: t("visibilityStatus.advertInactive.description"),
    },
    advert_remaining: {
      title: t("visibilityStatus.advertRemaining.title"),
      description: t("visibilityStatus.advertRemaining.description"),
    },
    advertiser_daily_limit: {
      title: t("visibilityStatus.advertiserDailyLimit.title"),
      description: t("visibilityStatus.advertiserDailyLimit.description"),
    },
    advertiser_balance: {
      title: t("visibilityStatus.advertiserBalance.title"),
      description: t("visibilityStatus.advertiserBalance.description"),
    },
    advertiser_adverts_unlisted: {
      title: t("visibilityStatus.advertiserAdvertsUnlisted.title"),
      description: t("visibilityStatus.advertiserAdvertsUnlisted.description"),
    },
    advertiser_status: {
      title: t("visibilityStatus.advertiserStatus.title"),
      description: t("visibilityStatus.advertiserStatus.description"),
    },
    advertiser_schedule_unavailable: {
      title: t("visibilityStatus.advertiserScheduleUnavailable.title"),
      description: t("visibilityStatus.advertiserScheduleUnavailable.description"),
    },
    advertiser_temp_ban: {
      title: t("visibilityStatus.advertiserTempBan.title"),
      description: t("visibilityStatus.advertiserTempBan.description"),
    },
    advertiser_no_private_groups: {
      title: t("visibilityStatus.advertiserNoPrivateGroups.title"),
      description: t("visibilityStatus.advertiserNoPrivateGroups.description"),
    },
    advert_float_rate_disabled: {
      title: t("visibilityStatus.advertFloatRateDisabled.title"),
      description: t("visibilityStatus.advertFloatRateDisabled.description"),
    },
    advert_no_payment_methods: {
      title: t("visibilityStatus.advertNoPaymentMethods.title"),
      description: t("visibilityStatus.advertNoPaymentMethods.description"),
    },
  }

  return reasonMap[reason] || { title: reason, description: t("visibilityStatus.unknownReason") }
}

export function VisibilityStatusDialog({ open, onOpenChange, reasons }: VisibilityStatusDialogProps) {
  const isMobile = useIsMobile()
  const { t } = useTranslations()

  const content = (
    <div className="space-y-4 py-4">
      <p className="text-sm text-slate-600">
        {t("myAds.visibilityStatusDescription")}
      </p>
      <ul className="space-y-4">
        {reasons.map((reason, index) => {
          const reasonContent = getReasonContent(reason, t)
          return (
            <li key={index} className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
              <span className="text-orange-600 mt-1 text-lg">⚠</span>
              <div className="space-y-1 flex-1">
                <p className="text-sm font-semibold text-slate-900">{reasonContent.title}</p>
                <p className="text-sm text-slate-600">{reasonContent.description}</p>
              </div>
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
