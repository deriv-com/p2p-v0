"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from "@/lib/i18n/use-translations"

interface TradeTypeSelectorProps {
  value: "buy" | "sell"
  onChange: (value: "buy" | "sell") => void
  isEditMode?: boolean
}

export function TradeTypeSelector({ value, onChange, isEditMode = false }: TradeTypeSelectorProps) {
  const { t } = useTranslations()

  return (
    <Tabs
      className="w-full"
      defaultValue={value}
      onValueChange={(type) => !isEditMode && onChange(type as "buy" | "sell")}
    >
      <TabsList className="w-full">
        <TabsTrigger className="w-full data-[state=active]:text-gray-900 text-black/70" value="buy">
          {t("market.iWantToBuy")}
        </TabsTrigger>
        <TabsTrigger className="w-full data-[state=active]:text-gray-900 text-black/70" value="sell">
          {t("market.iWantToSell")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
