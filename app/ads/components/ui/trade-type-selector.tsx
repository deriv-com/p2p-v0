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
      className="w-full md:w-[272px]"
      defaultValue={value}
      onValueChange={(type) => !isEditMode && onChange(type as "buy" | "sell")}
    >
      <TabsList className="w-full md:min-w-[270px]">
        <TabsTrigger className="w-full" value="buy">
          {t("market.iWantToBuy")}
        </TabsTrigger>
        <TabsTrigger className="w-full" value="sell">
          {t("market.iWantToSell")}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
