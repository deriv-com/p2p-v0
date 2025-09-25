"use client"

import { useState, useEffect } from "react"
import { Minus, Plus } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { USER, API, AUTH } from "@/lib/local-variables"
import { getCurrencies } from "@/services/api/api-wallets"
import { currencyLogoMapper } from "@/lib/utils"
import WalletSidebar from "./wallet-sidebar"
import FullScreenIframeModal from "./full-screen-iframe-modal"
import { useIsMobile } from "@/hooks/use-mobile"

interface Currency {
  code: string
  name: string
  logo: string
}

type OperationType = "DEPOSIT" | "WITHDRAW" | "TRANSFER"

export default function WalletSummary() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isIframeModalOpen, setIsIframeModalOpen] = useState(false)
  const [currentOperation, setCurrentOperation] = useState<OperationType>("DEPOSIT")
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const isMobile = useIsMobile()

  const fetchCurrencies = async () => {
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

  const fetchBalance = async () => {
    try {
      const userId = USER.id
      const url = `${API.baseUrl}/users/${userId}`

      const response = await fetch(url, {
        credentials: "include",
        headers: {
          ...AUTH.getAuthHeader(),
          accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`)
      }

      const responseData = await response.json()

      if (responseData && responseData.data) {
        const data = responseData.data
        const balance = data.balances?.find((b: any) => b.currency === selectedCurrency)?.amount
        setBalance(balance ? Number.parseFloat(balance) : 0)
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching user balance:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()
    fetchCurrencies()
  }, [selectedCurrency])

  const handleDepositClick = () => {
    setCurrentOperation("DEPOSIT")
    setIsSidebarOpen(true)
  }

  const handleWithdrawClick = () => {
    setCurrentOperation("WITHDRAW")
    setIsSidebarOpen(true)
  }

  const handleTransferClick = () => {
    setCurrentOperation("TRANSFER")
    setIsSidebarOpen(true)
  }

  const handleDirectDepositClick = (currency: string) => {
    setIsSidebarOpen(false)
    setSelectedCurrency(currency)
    setCurrentOperation("DEPOSIT")
    setIsIframeModalOpen(true)
  }

  const handleDirectWithdrawClick = (currency: string) => {
    setIsSidebarOpen(false)
    setSelectedCurrency(currency)
    setCurrentOperation("WITHDRAW")
    setIsIframeModalOpen(true)
  }

  const handleSendTransferClick = () => {}
  const handleReceiveTransferClick = () => {}

  return (
    <>
      <div
        className={cn(
          "bg-slate-1200 w-full h-[140px] p-6 flex items-center justify-between",
          isMobile ? "rounded-b-4 flex-col gap-4 h-auto py-6" : "rounded-2xl",
        )}
      >
        {/* Left side - Image and balance info */}
        <div className={cn("flex items-center gap-4", isMobile && "flex-col text-center")}>
          <div className="flex-shrink-0">
            <Image
  src="/icons/p2p-3d.png"
  alt="P2P Logo"
  width={92}
  height={92}
  className="w-16 h-16 md:w-24 md:h-24"
/>
          </div>

          <div className={cn("flex flex-col", isMobile && "items-center")}>
            <p className="text-[rgba(255,255,255,0.72)] text-xs font-normal">Total value</p>
            <p className="text-white text-xl font-extrabold">
              {isLoading ? "Loading..." : `${Number(balance).toFixed(2)} ${selectedCurrency}`}
            </p>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className={cn("flex items-center gap-[66px]", isMobile && "flex-row justify-center w-full")}>
          {/* Deposit Button */}
          <div className="flex flex-col items-center gap-2">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-[#FF444F] hover:bg-[#E63946] text-white p-0"
              onClick={handleDepositClick}
              aria-label="Deposit"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <span className="text-white text-sm font-normal">Deposit</span>
          </div>

          {/* Transfer Button */}
          <div className="flex flex-col items-center gap-2">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full border-2 border-white bg-transparent hover:bg-white/10 text-white p-0"
              onClick={handleTransferClick}
              aria-label="Transfer"
            >
              <Image src="/icons/exchange-icon.png" alt="Transfer" width={16} height={16} />
            </Button>
            <span className="text-white text-sm font-normal">Transfer</span>
          </div>

          {/* Withdraw Button */}
          <div className="flex flex-col items-center gap-2">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full border-2 border-white bg-transparent hover:bg-white/10 text-white p-0"
              onClick={handleWithdrawClick}
              aria-label="Withdraw"
            >
              <Minus className="h-5 w-5" />
            </Button>
            <span className="text-white text-sm font-normal">Withdraw</span>
          </div>
        </div>
      </div>

      <WalletSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onDirectDepositClick={currentOperation === "DEPOSIT" ? handleDirectDepositClick : handleDirectWithdrawClick}
        operation={currentOperation}
        onP2PTransferClick={handleSendTransferClick}
        onAccountTransferClick={handleReceiveTransferClick}
        currencies={currencies}
      />

      <FullScreenIframeModal
        isOpen={isIframeModalOpen}
        onClose={() => setIsIframeModalOpen(false)}
        operation={currentOperation}
        currency={selectedCurrency}
      />
    </>
  )
}
