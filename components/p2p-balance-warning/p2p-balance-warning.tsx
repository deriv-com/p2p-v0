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
    <Alert className="flex items-start gap-3 bg-error-light border-transparent text-grayscale-100">
      <Image src="/icons/warning-icon-new.png" alt="Warning" height={24} width={24} />
      <div className="flex-1 flex flex-col gap-2">
        <div className="text-sm font-bold leading-tight">{t("market.noBalanceTitle")}</div>
        <div className="text-sm leading-snug">{t("market.noBalanceDescription")}</div>
        <div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => router.push("/wallet?operation=TRANSFER")}
          >
            {t("market.noBalanceTransfer")}
          </Button>
        </div>
      </div>
    </Alert>
  )
}
