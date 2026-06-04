"use client"

import { isRtlLocale } from "@/lib/i18n/config"
import { buildExchangeRateLine } from "@/lib/exchange-rate-display"
import { useTranslations } from "@/lib/i18n/use-translations"
import { cn } from "@/lib/utils"

export { formatEffectiveRateDisplay, buildExchangeRateLine } from "@/lib/exchange-rate-display"

type ExchangeRateDisplayProps = {
  rate: number | null | undefined
  paymentCurrency: string
  accountCurrency: string
  className?: string
  mutedClassName?: string
  formatRate?: boolean
}

/**
 * Exchange rate line: payment currency + rate vs account currency (muted).
 * RTL: account currency first (e.g. "USD/ AMD 374.00").
 * LTR: rate + payment first (e.g. "374.00 AMD /USD").
 */
export function ExchangeRateDisplay({
  rate,
  paymentCurrency,
  accountCurrency,
  className,
  mutedClassName = "text-grayscale-text-muted",
  formatRate = true,
}: ExchangeRateDisplayProps) {
  const { locale } = useTranslations()
  const rtl = isRtlLocale(locale)
  const line = buildExchangeRateLine(
    rate,
    paymentCurrency,
    accountCurrency,
    rtl,
    formatRate,
  )

  // Currency pairs use LTR typographic order; page `dir=rtl` would otherwise flip flex children.
  return (
    <span dir="ltr" className={cn("inline-flex items-baseline gap-1", className)}>
      {line.mutedPosition === "prefix" ? (
        <>
          <span className={mutedClassName}>{line.muted}</span>
          <span>{line.primary}</span>
        </>
      ) : (
        <>
          <span>{line.primary}</span>
          <span className={mutedClassName}>{line.muted}</span>
        </>
      )}
    </span>
  )
}
