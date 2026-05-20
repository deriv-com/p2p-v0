"use client"

import { CircleAlert, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { useTranslations } from "@/lib/i18n/use-translations"

import {
  HIGH_BLOCK_COUNT_THRESHOLD,
  type RiskWarningResult,
} from "./risk-warning-rules"

interface RiskWarningModalProps {
  isOpen: boolean
  result: RiskWarningResult
  advertiserNickname: string
  onContinue: () => void
  onClose: () => void
}

export default function RiskWarningModal({
  isOpen,
  result,
  advertiserNickname,
  onContinue,
  onClose,
}: RiskWarningModalProps) {
  const isMobile = useIsMobile()
  const { t } = useTranslations()

  if (!isOpen) return null

  const title =
    result.type === "high_block_count"
      ? t("market.riskWarning.highBlockCount.title")
      : t("market.riskWarning.lowCompletion.title")

  const body =
    result.type === "high_block_count"
      ? t("market.riskWarning.highBlockCount.body", {
          threshold: HIGH_BLOCK_COUNT_THRESHOLD,
        })
      : t("market.riskWarning.lowCompletion.body", {
          rate: (result.completionRate ?? 0).toFixed(2),
        })

  const completionRateLabel = result.isBuyAdvert
    ? t("market.riskWarning.sellCompletionRateLabel")
    : t("market.riskWarning.buyCompletionRateLabel")

  const fieldRows = (
    <div className="rounded-xl border p-6 space-y-4">
      <FieldRow
        label={t("market.riskWarning.advertiserLabel")}
        value={advertiserNickname}
      />
      {result.type === "low_completion_rate" && (
        <>
          <FieldRow
            label={completionRateLabel}
            trailing={
              <ValueWithWarningIcon
                text={`${(result.completionRate ?? 0).toFixed(2)}%`}
              />
            }
          />
          <FieldRow
            label={t("market.riskWarning.orderCompletedLabel")}
            value={String(result.orderCount ?? 0)}
          />
        </>
      )}
      {result.type === "high_block_count" && (
        <FieldRow
          label={t("market.riskWarning.blockCountLabel")}
          trailing={
            <ValueWithWarningIcon text={String(result.blockCount ?? 0)} />
          }
        />
      )}
    </div>
  )

  const buttons = (
    <div className="flex flex-col gap-3">
      <Button
        onClick={onContinue}
        variant="destructive"
        className="w-full"
      >
        {t("market.riskWarning.continueAnyway")}
      </Button>
      <Button
        onClick={onClose}
        variant="outline"
        className="w-full hover:bg-slate-50"
      >
        {t("market.riskWarning.goBack")}
      </Button>
    </div>
  )

  const body_block = (
    <div className="flex flex-col gap-6">
      <p className="text-grayscale-100 text-base">{body}</p>
      {fieldRows}
      {buttons}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="px-6 pb-8">
          <DrawerTitle className="text-2xl font-bold my-4">{title}</DrawerTitle>
          {body_block}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-8 sm:rounded-2xl">
        <DialogClose
          aria-label={t("market.riskWarning.goBack")}
          className="absolute right-4 top-4 rounded-full p-2 hover:bg-slate-100 focus:outline-none focus-visible:ring-2"
        >
          <X size={20} />
        </DialogClose>
        <DialogTitle className="text-2xl font-bold mb-2 pr-10">
          {title}
        </DialogTitle>
        {body_block}
      </DialogContent>
    </Dialog>
  )
}

function FieldRow({
  label,
  value,
  trailing,
}: {
  label: string
  value?: string
  trailing?: React.ReactNode
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-grayscale-300 text-sm">{label}</span>
      {trailing ?? <span className="text-grayscale-100 text-sm">{value}</span>}
    </div>
  )
}

function ValueWithWarningIcon({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-grayscale-100 text-sm">{text}</span>
      <CircleAlert size={16} className="text-warning-icon" />
    </div>
  )
}
