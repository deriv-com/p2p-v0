"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/i18n/use-translations"

export function P2PBalanceWarning() {
  const { t } = useTranslations()
  const router = useRouter()

  return (
    <Alert className="flex items-center gap-4 bg-error-light border-transparent text-grayscale-100 px-4 pt-4 pb-10">
      <Image
        src="/icons/warning-triangle-red.svg"
        alt="Warning"
        height={32}
        width={32}
        className="flex-shrink-0"
      />
      <div className="flex-1 flex flex-col gap-1">
        <div className="text-sm font-bold leading-tight">{t("market.noBalanceTitle")}</div>
        <div className="text-sm leading-snug">{t("market.noBalanceDescription")}</div>
      </div>
      <Button
        variant="destructive"
        size="sm"
        className="flex-shrink-0 rounded-full px-6"
        onClick={() => router.push("/wallet?operation=TRANSFER")}
      >
        {t("market.noBalanceTransfer")}
      </Button>
    </Alert>
  )
}
