"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { FeedbackSurvey } from "./feedback-survey"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { useSubmitFeedback } from "@/hooks/use-api-queries"
import { useUserDataStore } from "@/stores/user-data-store"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { useToast } from "@/hooks/use-toast"
import type { FeedbackError } from "@/services/api/api-auth"

interface FeedbackDialogProps {
  isOpen: boolean
  onClose: () => void
}

function FeedbackDialogContent({
  onClose,
  title,
}: {
  onClose: () => void
  title: string
}) {
  const { t } = useTranslations()
  const { toast } = useToast()
  const { showAlert } = useAlertDialog()
  const userId = useUserDataStore((state) => state.userId)
  const feedbackExist = useUserDataStore((state) => state.userData?.feedback_exist)
  const submitFeedback = useSubmitFeedback()

  const handleSubmit = async (npsScore: number, reviewText: string) => {
    if (!userId) return
    if (feedbackExist) {
      onClose()
      return
    }
    try {
      await submitFeedback.mutateAsync({ userId, nps_score: npsScore, review_text: reviewText })
      onClose()
      toast({
        description: (
          <div className="flex items-center gap-2">
            <Image src="/icons/tick.svg" alt="" width={24} height={24} />
            <span>{t("nps.successToast")}</span>
          </div>
        ),
        className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
        duration: 2500,
      })
    } catch (err) {
      const error = err as FeedbackError
      const rawCode = error?.errors?.[0]?.code ?? "unknown"
      const SAFE_CODE_RE = /^[a-zA-Z0-9_-]{1,64}$/
      const errorCode = SAFE_CODE_RE.test(rawCode) ? rawCode : "unknown"
      showAlert({
        title: t("nps.errorTitle"),
        description: t("nps.errorMessage", { errorCode }),
        confirmText: t("common.ok"),
        type: "warning",
      })
    }
  }

  return (
    <>
      <p className="px-6 pb-2 text-base font-bold">{title}</p>
      <FeedbackSurvey
        onSubmit={handleSubmit}
        onClose={onClose}
        isSubmitting={submitFeedback.isPending}
      />
    </>
  )
}

export function FeedbackDialog({ isOpen, onClose }: FeedbackDialogProps) {
  const { t } = useTranslations()
  const isMobile = useIsMobile()
  const title = t("nps.title")

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
        <DrawerContent className="max-h-[90vh] rounded-t-2xl pb-safe">
          <DrawerHeader className="pb-0">
            <DrawerTitle className="text-xl font-bold text-left">{title}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto">
            <FeedbackDialogContent onClose={onClose} title="" />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-[512px] sm:rounded-[32px] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex justify-between items-start">
            <DialogTitle className="tracking-normal font-bold text-2xl text-left pr-4">
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="px-1 min-w-[48px] shrink-0 hover:bg-transparent"
              onClick={onClose}
            >
              <Image src="/icons/close-icon.png" alt={t("common.close")} width={24} height={24} />
            </Button>
          </div>
        </DialogHeader>
        <FeedbackDialogContent onClose={onClose} title="" />
      </DialogContent>
    </Dialog>
  )
}
