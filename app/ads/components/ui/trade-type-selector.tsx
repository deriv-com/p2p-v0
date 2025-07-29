"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TradeTypeSelectorProps {
  value: "buy" | "sell"
  onChange: (value: "buy" | "sell") => void
  isEditMode?: boolean
}

export function TradeTypeSelector({ value, onChange, isEditMode = false }: TradeTypeSelectorProps) {
  return (
    <div className="flex bg-gray-50 rounded-lg w-full md:w-[270px] h-10 min-h-10 max-h-10 px-1 py-0">
      <Tabs
        className="w-full md:w-[230px] md:min-w-[230px]"
        defaultValue={activeTab}
        onValueChange={(value) => !isEditMode && onChange("buy")}
      >
        <TabsList className="w-full md:min-w-[230px]">
          <TabsTrigger className="w-full data-[state=active]:font-bold" value="buy">
            I want to buy
          </TabsTrigger>
          <TabsTrigger className="w-full data-[state=active]:font-bold" value="sell">
            I want to sell
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}
