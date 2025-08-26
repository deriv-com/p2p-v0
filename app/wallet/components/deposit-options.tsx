"use client"

import type React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DepositOptionProps {
  onClose: () => void
  onDirectDepositClick: () => void
}

export default function DepositOptions({ onClose, onDirectDepositClic}: DepositOptionProps) {
  const router = useRouter()
  const [selectedCurrency, setSelectedCurrency] = useState("USD")

  const currencies = [
    { code: "USD", name: "US dollar", flag: "https://flagcdn.com/w40/us.png" },
    { code: "EUR", name: "Euro", flag: "https://flagcdn.com/w40/eu.png" },
    { code: "GBP", name: "British pound", flag: "https://flagcdn.com/w40/gb.png" },
    { code: "JPY", name: "Japanese yen", flag: "https://flagcdn.com/w40/jp.png" },
  ]

  const selectedCurrencyData = currencies.find((c) => c.code === selectedCurrency) || currencies[0]

  const handleDirectDepositClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    onDirectDepositClick()
  }

  const handleP2PTradingClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    router.push("/")
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-base font-bold mb-4">Choose currency</h2>
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="w-full h-14 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-2xl overflow-hidden flex-shrink-0">
                <img
                  src={selectedCurrencyData.flag || "/placeholder.svg"}
                  alt={`${selectedCurrencyData.name} Flag`}
                  className="w-full h-full object-cover"
                />
              </div>
              <SelectValue>
                <span className="text-base font-medium text-black">
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
                    <img
                      src={currency.flag || "/placeholder.svg"}
                      alt={`${currency.name} Flag`}
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

      <div className="mb-4">
        <h2 className="text-base font-bold">Deposit with</h2>
      </div>

      <div className="space-y-3">
        <div
          className={cn(
            "flex min-h-[56px] p-4 justify-center items-center gap-4 self-stretch",
            "rounded-xl bg-accent cursor-pointer hover:bg-accent/80",
          )}
          onClick={handleP2PTradingClick}
        >
          <div className="flex-shrink-0 w-12 h-12 bg-background rounded-full flex items-center justify-center">
            <Image src="/icons/up-down-arrows.png" alt="Trade" className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-black leading-6 mb-1">
              {operation === "DEPOSIT" ? "P2P Trading" : "Marketplace"}
            </h3>
            <p className="text-muted-foreground text-sm font-normal leading-[22px]">
              {operation === "DEPOSIT"
                ? "Buy USD directly from other users on the P2P marketplace."
                : "Trade USD directly with other users on the marketplace."}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex min-h-[56px] p-4 justify-center items-center gap-4 self-stretch",
            "rounded-xl bg-accent cursor-pointer hover:bg-accent/80",
          )}
          onClick={handleDirectDepositClick}
        >
          <div className="flex-shrink-0 w-12 h-12 bg-background rounded-full flex items-center justify-center">
            <Image src="/icons/bank-icon.png" alt="Bank" width={24} height={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-black leading-6 mb-1">
              {operation === "DEPOSIT" ? "Direct deposit" : "Direct withdrawal"}
            </h3>
            <p className="text-muted-foreground text-sm font-normal leading-[22px]">
              {operation === "DEPOSIT"
                ? "Deposit funds directly from your bank account, e-wallet, or other payment methods."
                : "Withdraw funds directly to your bank account, e-wallet, or other payment methods."}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
