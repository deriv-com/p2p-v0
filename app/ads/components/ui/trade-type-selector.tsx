"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "@/lib/i18n/use-translations"

interface TradeTypeSelectorProps {
  value: "buy" | "sell"
  onChange: (value: "buy" | "sell") => void
}

export function TradeTypeSelector({ value, onChange }: TradeTypeSelectorProps) {
  const { t } = useTranslations()

  return (
    <Tabs
      className="w-full"
      defaultValue={value}
      onValueChange={(type) => onChange(type as "buy" | "sell")}
    >
      <TabsList className="w-full">
        <TabsTrigger className="w-full data-[state=active]:text-slate-1200 text-grayscale-600" value="buy">
          {t("market.iWantToBuy")}
        </TabsTrigger>
        <TabsTrigger className="w-full data-[state=active]:text-slate-1200 text-grayscale-600" value="sell">
          {t("market.iWantToSell")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
