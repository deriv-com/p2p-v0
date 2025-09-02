"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrencies } from "@/services/api/api-wallets"
import { currencyLogoMapper } from "@/lib/utils"

interface TransferProps {
  onSendClick: () => void
  onReceiveClick: () => void
}

interface Currency {
  code: string
  name: string
  logo: string
}

export default function Transfer({ onSendClick, onReceiveClick }: TransferProps) {
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [currencies, setCurrencies] = useState<Currency[]>([])

  useEffect(() => {
    const fetchCurrenciesData = async () => {
      try {
        const response = await getCurrencies()
        if (response?.data) {
          const currencyList = Object.entries(response.data).map(([code, data]: [string, any]) => ({
            code,
            name: data.label,
            logo: currencyLogoMapper[code as keyof typeof currencyLogoMapper],
          }))
          setCurrencies(currencyList)
        }
      } catch (error) {
        console.error("Error fetching currencies:", error)
      }
    }

    fetchCurrenciesData()
  }, [])

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
                  src={selectedCurrencyData?.logo }
                  alt={selectedCurrencyData?.name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <SelectValue>
                <span className="text-base">
                  {selectedCurrencyData?.name} ({selectedCurrencyData?.code})
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
                      src={currency.logo}
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

      <h2 className="text-black text-base font-bold m-0">Choose transfer type</h2>

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
