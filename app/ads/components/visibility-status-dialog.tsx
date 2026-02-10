"use client"

import Image from "next/image"
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface VisibilityStatusDialogProps {
  id: string
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
    advert_inactive: { label: t("visibilityStatus.actions.editAd"), action: "edit" },
    advert_remaining: { label: t("visibilityStatus.actions.editAd"), action: "edit" },
    advertiser_daily_limit: { label: t("visibilityStatus.actions.editAd"), action: "edit" },
    advertiser_balance: { label: t("visibilityStatus.actions.editAd"), action: "edit" },
    advertiser_adverts_unlisted: { label: t("visibilityStatus.actions.editAd"), action: "edit" },
    advertiser_status: { label: t("visibilityStatus.actions.contactSupport"), action: "close" },
    advertiser_schedule_unavailable: { label: t("visibilityStatus.actions.editSchedule"), action: "view_profile" },
    advertiser_temp_ban: { label: t("visibilityStatus.actions.viewProfile"), action: "close" },
    advertiser_no_private_groups: { label: t("visibilityStatus.actions.editAd"), action: "edit_ad_visibility" },
    advert_float_rate_disabled: { label: t("visibilityStatus.actions.editAd"), action: "edit" },
    advert_no_payment_methods: { label: t("visibilityStatus.actions.addPaymentMethod"), action: "add_payment" },
  }

  return actionMap[reason]
}

export function VisibilityStatusDialog({
  id,
  open,
  onOpenChange,
  reasons,
}: VisibilityStatusDialogProps) {
  const isMobile = useIsMobile()
  const { t } = useTranslations()
  const router = useRouter()

  const handleAction = (actionType: string) => {
    switch (actionType) {
      case "edit":
      case "edit_schedule":
      case "edit_ad_visibility":
        router.push(`/ads/edit/${id}`)
        onOpenChange(false)
        break
      case "view_profile":
        onOpenChange(false)
        break
      default:
         onOpenChange(false)
    }
  }

  const content = (
    <div className="space-y-4">
      {reasons.includes("advertiser_no_private_groups") ? (
        <div className="mt-2">
          <p className="text-base text-grayscale-600">{getReasonContent("advertiser_no_private_groups", t).description}</p>
          <Button onClick={() => handleAction(getReasonAction("advertiser_no_private_groups", t).action)} className="w-full mt-8" variant="default">
            {getReasonAction("advertiser_no_private_groups", t).label}
          </Button>
        </div>
      ) : (
        <>
          {reasons.length > 1 && (
            <p className="text-base text-grayscale-600 mt-2">{t("myAds.visibilityStatusMultipleReasons")}</p>
          )}
          <ol className={cn("space-y-3", reasons.length > 1 ? "list-decimal list-inside" : "")}>
            {reasons.map((reason, index) => {
              const reasonContent = getReasonContent(reason, t)
              const actionInfo = getReasonAction(reason, t)

              return (
                <li key={index} className={cn("flex flex-col", reasons.length > 1 ? "text-base text-grayscale-600" : "")}>
                  <p className={cn(reasons.length === 1 ? "text-base text-grayscale-600" : "")}>{reasonContent.description}</p>
                  {reasons.length == 1 && actionInfo && (
                    <Button onClick={() => handleAction(actionInfo.action)} className="w-full mt-8" variant="default">
                      {actionInfo.label}
                    </Button>
                  )}
                </li>
              )
            })}
          </ol>
          {reasons.length > 1 && (
            <Button onClick={() => onOpenChange(false)} className="w-full mt-8" variant="default">
              {t("common.gotIt")}
            </Button>
          )}
        </>
      )}
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
          <DialogClose> 
            <Button variant="ghost" className="bg-slate-75 min-w-[48px] px-0 absolute right-[32px] top-4">
              <Image src="/icons/close-icon.png" alt="Close" width={24} height={24} />
            </Button>
          </DialogClose>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
