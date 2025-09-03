"use client"

import type React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrencies } from "@/services/api/api-wallets"
import { currencyLogoMapper } from "@/lib/utils"

interface WithdrawOptionProps {
  onClose: () => void
  onDirectWithdrawClick: (currency: string) => void
}

interface Currency {
  code: string
  name: string
  logo: string
}

export default function WithdrawOptions({ onClose, onDirectWithdrawClick }: WithdrawOptionProps) {
  const router = useRouter()
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

  const handleDirectWithdrawClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    onDirectWithdrawClick(selectedCurrency)
  }

  const handleMarketplaceClick = (e: React.MouseEvent) => {
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
            {selectedCurrencyData ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-2xl overflow-hidden flex-shrink-0">
                  {selectedCurrencyData.logo && (
                    <Image
                      src={selectedCurrencyData.logo || "/placeholder.svg"}
                      alt={selectedCurrencyData.name}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <SelectValue>
                  <span className="text-base">{selectedCurrencyData.name}</span>
                </SelectValue>
              </div>
            ) : (
              <div></div>
            )}
          </SelectTrigger>
          <SelectContent>
            {currencies.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    {currency.logo && (
                      <Image
                        src={currency.logo || "/placeholder.svg"}
                        alt={currency.name}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span>{currency.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-2">
        <h2 className="text-base font-bold">Withdraw with</h2>
      </div>

      <div className="space-y-3">
        <div
          className={cn(
            "flex p-4 justify-center items-center gap-4 self-stretch",
            "rounded-2xl bg-slate-75 cursor-pointer hover:bg-accent/80",
          )}
          onClick={handleMarketplaceClick}
        >
          <div className="flex-shrink-0 w-12 h-12 bg-slate-75 rounded-full flex items-center justify-center">
            <Image src="/icons/up-down-arrows.png" alt="Trade" width={48} height={48} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-black leading-6 mb-1">P2P Trading</h3>
            <p className="text-muted-foreground text-sm font-normal leading-[22px]">
              {`Trade ${selectedCurrencyData?.code} directly to other users on the P2P marketplace.`}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex p-4 justify-center items-center gap-4 self-stretch",
            "rounded-2xl bg-slate-75 cursor-pointer hover:bg-accent/80",
          )}
          onClick={handleDirectWithdrawClick}
        >
          <div className="flex-shrink-0 w-12 h-12 bg-slate-75 rounded-full flex items-center justify-center">
            <Image src="/icons/bank-icon.png" alt="Bank" width={48} height={48} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-black leading-6 mb-1">Direct withdrawal</h3>
            <p className="text-muted-foreground text-sm font-normal leading-[22px]">
              Withdraw funds directly to your bank account, e-wallet, or other payment methods.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
