"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TransferProps {
  onSendClick: () => void
  onReceiveClick: () => void
}

export default function Transfer({ onSendClick, onReceiveClick }: TransferProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("USD")

  const currencies = [
    { code: "USD", name: "US dollar", logo: "/icons/usd-flag.png" },
    { code: "BTC", name: "Bitcoin", logo: "/icons/bitcoin-logo.png" },
    { code: "ETH", name: "Ethereum", logo: "/icons/ethereum-logo.png" },
    { code: "LTC", name: "Litecoin", logo: "/icons/litecoin-logo.png" },
    { code: "USDC", name: "USD Coin", logo: "/icons/usdc-logo.png" },
  ]

  const selectedCurrencyData = currencies.find((c) => c.code === selectedCurrency) || currencies[0]

  const handleSendClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSendClick()
  }

  const handleReceiveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onReceiveClick()
  }

  return (
    <>
      <div>
        <h2 className="text-base font-bold mb-2">Choose currency</h2>
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="w-full h-14 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-2xl overflow-hidden flex-shrink-0">
                <Image
                  src={selectedCurrencyData.logo || "/placeholder.svg"}
                  alt={selectedCurrencyData.name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <SelectValue>
                <span className="text-base">
                  {selectedCurrencyData.name} ({selectedCurrencyData.code})
                </span>
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={currency.logo || "/placeholder.svg"}
                      alt={currency.name}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>
                    {currency.name} ({currency.code})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-0">
        <h2 className="text-black text-base font-bold m-0">Choose transfer type</h2>
      </div>

      <div className="space-y-2">
        <div
          className="flex items-center gap-4 cursor-pointer bg-slate-75 rounded-2xl min-h-[56px] p-4 w-full transition-colors hover:bg-gray-200"
          onClick={handleSendClick}
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <Image src="/icons/arrow-up.png" alt="Send" width={23} height={22} />
          </div>
          <div>
            <h3 className="text-black text-base font-bold">Send</h3>
          </div>
        </div>

        <div
          className="flex items-center gap-4 cursor-pointer bg-slate-75 rounded-2xl min-h-[56px] p-4 w-full transition-colors hover:bg-gray-200"
          onClick={handleReceiveClick}
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <Image src="/icons/arrow-down.png" alt="Receive" width={23} height={22} />
          </div>
          <div>
            <h3 className="text-black text-base font-bold">Receive</h3>
          </div>
        </div>
      </div>
    </>
  )
}
