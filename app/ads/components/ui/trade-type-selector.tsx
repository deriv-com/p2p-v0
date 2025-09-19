"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TradeTypeSelectorProps {
  value: "buy" | "sell"
  onChange: (value: "buy" | "sell") => void
  isEditMode?: boolean
}

export function TradeTypeSelector({ value, onChange, isEditMode = false }: TradeTypeSelectorProps) {
  return (
    <Tabs
        className="w-full md:w-[250px] md:min-w-[270px]"
        defaultValue={value}
        onValueChange={(type) => !isEditMode && onChange(type)}
      >
        <TabsList className="w-full md:min-w-[270px]">
          <TabsTrigger className="w-full data-[state=active]:font-bold" value="buy">
            Buy USD
          </TabsTrigger>
          <TabsTrigger className="w-full data-[state=active]:font-bold" value="sell">
            I want to sell
          </TabsTrigger>
        </TabsList>
      </Tabs>
  )
}
