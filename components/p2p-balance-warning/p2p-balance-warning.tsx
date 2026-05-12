"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/i18n/use-translations"

export function P2PBalanceWarning() {
  const { t } = useTranslations()
  const router = useRouter()

  const title = t("market.noBalanceTitle")
  const description = t("market.noBalanceDescription")
  const transferLabel = t("market.noBalanceTransfer")

  return (
    <Alert
      aria-live="polite"
      className="flex items-center gap-4 bg-error-light border-transparent text-grayscale-100 px-6 pt-6 pb-12"
    >
      <Image
        src="/icons/warning-triangle-red.svg"
        alt=""
        height={32}
        width={32}
        className="flex-shrink-0"
        aria-hidden="true"
      />
      <div className="flex-1 flex flex-col gap-1">
        <div className="text-sm font-bold leading-tight">{title}</div>
        <div className="text-sm leading-snug">{description}</div>
      </div>
      <Button
        variant="destructive"
        size="sm"
        className="flex-shrink-0 rounded-full px-6"
        aria-label={`${transferLabel} — ${title}`}
        onClick={() => router.push("/wallet?operation=TRANSFER")}
      >
        {transferLabel}
      </Button>
    </Alert>
  )
}
