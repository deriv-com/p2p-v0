"use client"

import { TooltipTrigger } from "@/components/ui/tooltip"

import { useState, useEffect } from "react"
import { Minus } from "lucide-react"
import Image from "next/image"
import WalletSidebar from "./wallet-sidebar"
import FullScreenIframeModal from "./full-screen-iframe-modal"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { useUserDataStore } from "@/stores/user-data-store"
import { getCurrencies } from "@/services/api/api-wallets"
import { currencyLogoMapper } from "@/lib/utils"

interface WalletBalanceProps {
  className?: string
}

interface Currency {
  code: string
  name: string
  logo: string
}

type OperationType = "DEPOSIT" | "WITHDRAW" | "TRANSFER"

export default function WalletBalance({ className }: WalletBalanceProps) {
  const userId = useUserDataStore((state) => state.userId)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isIframeModalOpen, setIsIframeModalOpen] = useState(false)
  const [currentOperation, setCurrentOperation] = useState<OperationType>("DEPOSIT")
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [currencies, setCurrencies] = useState<Currency[]>([])

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
      setIsRefreshing(true)

      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}`

      const response = await fetch(url, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json"
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
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchBalance()
    fetchCurrencies()
  }, [selectedCurrency])

  const handleRefresh = () => {
    fetchBalance()
  }

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
    <TooltipProvider>
      <div className={cn("flex flex-col items-center justify-center py-8", className)}>
        <div className="mb-6 h-14 w-14">
          <Image src="/icons/p2p-logo.png" alt="P2P Logo" width={56} height={56} className="rounded-full" />
        </div>

        <div className="flex items-center justify-center gap-2">
          <h1 className="text-[32px] font-black text-black text-center leading-normal">
            {isLoading ? "Loading..." : `${balance} ${selectedCurrency}`}
          </h1>
          <Button variant="ghost" size="sm" onClick={handleRefresh} aria-label="Refresh balance">
            <Image
              src="/icons/refresh-icon.png"
              alt="Refresh"
              width={16}
              height={16}
              className={cn("text-gray-400", isRefreshing && "animate-spin")}
            />
          </Button>
        </div>

        <div className="mt-1 flex items-center justify-center gap-1">
          <p className="text-sm font-normal text-muted-foreground text-center leading-[22px]">Est total assets</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Image
                src="/icons/info-circle.svg"
                alt="Info"
                width={24}
                height={24}
                className="ml-1 cursor-pointer flex-shrink-0"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>This is your estimated combined balance across all P2P wallets, shown in USD.</p>
              <TooltipArrow className="fill-black" />
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="mt-[50px] md:mt-12 flex w-full max-w-md justify-center md:justify-between gap-[50px] md:gap-0 px-4">
          <div className="flex flex-col items-center">
            <Button
              size="icon"
              className="h-14 w-14 !rounded-full rounded-[9999px] aspect-square overflow-hidden flex-shrink-0 min-h-[56px] min-w-[56px] max-h-[56px] max-w-[56px] bg-[#00D0FF] text-black hover:bg-[#00B8E6] transition-colors p-0"
              aria-label="Deposit"
              onClick={handleDepositClick}
            >
              <Image src="/icons/plus_icon.png" alt="Plus" width={14} height={24} />
            </Button>
            <span className="mt-2 text-sm font-normal text-[rgba(0,0,0,0.96)] text-center leading-[22px]">Deposit</span>
          </div>

          <div className="flex flex-col items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 !rounded-full rounded-[9999px] aspect-square overflow-hidden flex-shrink-0 min-h-[56px] min-w-[56px] max-h-[56px] max-w-[56px] border-2 border-[#00080A] bg-white hover:bg-gray-50 transition-colors p-0"
              aria-label="Withdraw"
              onClick={handleWithdrawClick}
            >
              <Minus className="h-6 w-6" />
            </Button>
            <span className="mt-2 text-sm font-normal text-[rgba(0,0,0,0.96)] text-center leading-[22px]">
              Withdraw
            </span>
          </div>

          <div className="flex flex-col items-center">
            <Button
              variant="outline"
              size="icon"
              className="h-14 w-14 !rounded-full rounded-[9999px] aspect-square overflow-hidden flex-shrink-0 min-h-[56px] min-w-[56px] max-h-[56px] max-w-[56px] border-2 border-[#00080A] bg-white hover:bg-gray-50 transition-colors p-0"
              aria-label="Transfer"
              onClick={handleTransferClick}
            >
              <Image src="/icons/exchange-icon.png" alt="Transfer" width={20} height={20} />
            </Button>
            <span className="mt-2 text-sm font-normal text-[rgba(0,0,0,0.96)] text-center leading-[22px]">
              Transfer
            </span>
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
      </div>
    </TooltipProvider>
  )
}
