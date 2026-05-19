"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/i18n/use-translations"

/**
 * Two visual variants driven by the `md:` breakpoint:
 *
 * - **Mobile** (< md): dark wine background with white text, stacked
 *   layout (icon+title row, description indented below, button under
 *   description). Mirrors the mobile app's banner inside the dark
 *   Markets header.
 *
 * - **Desktop** (md+): light pink background with dark text, horizontal
 *   layout (icon, title+description block, Transfer button on the right).
 *   Tucks visually under the dark balance card via a negative margin set
 *   at the mount site in `app/page.tsx`.
 */
export function P2PBalanceWarning() {
  const { t } = useTranslations()
  const router = useRouter()

  const title = t("market.noBalanceTitle")
  const description = t("market.noBalanceDescription")
  const transferLabel = t("market.noBalanceTransfer")

  return (
    <Alert
      aria-live="polite"
      className="flex flex-col gap-3 rounded-none border-transparent px-4 pt-4 pb-4 bg-[#2d1820] text-white md:flex-row md:items-center md:gap-4 md:rounded-2xl md:bg-error-light md:text-grayscale-100 md:px-6 md:pt-6 md:pb-12"
    >
      <div className="flex items-start gap-3 md:flex-1 md:items-center md:gap-4">
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
          <div className="text-sm leading-snug text-white/70 md:text-grayscale-100">
            {description}
          </div>
        </div>
      </div>
      <Button
        variant="destructive"
        size="sm"
        className="flex-shrink-0 self-start ml-11 rounded-full px-6 md:ml-0 md:self-auto"
        aria-label={`${transferLabel} — ${title}`}
        onClick={() => router.push("/wallet?operation=TRANSFER")}
      >
        {transferLabel}
      </Button>
    </Alert>
  )
}
