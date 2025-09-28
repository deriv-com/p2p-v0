"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCurrencies, fetchBalance } from "@/services/api/api-wallets"
import { currencyLogoMapper } from "@/lib/utils"
import WalletSidebar from "./wallet-sidebar"
import FullScreenIframeModal from "./full-screen-iframe-modal"
import { useIsMobile } from "@/hooks/use-mobile"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet"

interface Currency {
  code: string
  name: string
  logo: string
}

type OperationType = "DEPOSIT" | "WITHDRAW" | "TRANSFER"

export default function WalletSummary() {
  const [isKycSheetOpen, setIsKycSheetOpen] = useState(false)
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

  const loadBalance = async () => {
    try {
      const balanceAmount = await fetchBalance(selectedCurrency)
      setBalance(balanceAmount)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching user balance:", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBalance()
    fetchCurrencies()
  }, [selectedCurrency])

  const handleDepositClick = () => {
    if(USER.id) {
      setCurrentOperation("DEPOSIT")
      setIsSidebarOpen(true)
    } else {
      setIsKycSheetOpen(true)
    }
  }

  const handleWithdrawClick = () => {
    if(USER.id) { 
      setCurrentOperation("WITHDRAW")
      setIsSidebarOpen(true)
    } else {
      setIsKycSheetOpen(true)
    }
  }

  const handleTransferClick = () => {
    if(USER.id) { 
      setCurrentOperation("TRANSFER")
      setIsSidebarOpen(true)
    } else {
      setIsKycSheetOpen(true)
    }
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
          isMobile ? "rounded-b-3xl flex-col gap-4 h-auto py-6" : "rounded-3xl",
        )}
      >
        <div className={cn("flex items-center gap-4", isMobile && "gap-2 flex-col text-center")}>
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

        <div className={cn("flex items-center gap-[66px] px-[33px]", isMobile && "flex-row justify-center w-full")}>
          <div className="flex flex-col items-center gap-2">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-[#FF444F] hover:bg-[#E63946] text-white p-0"
              onClick={handleDepositClick}
              aria-label="Deposit"
            >
              <Image src="/icons/plus-white.png" alt="Deposit" width={14} height={14} />
            </Button>
            <span className="text-white text-xs font-normal">Deposit</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full border border-white bg-transparent hover:bg-white/10 text-white p-0"
              onClick={handleTransferClick}
              aria-label="Transfer"
            >
              <Image src="/icons/transfer-white.png" alt="Transfer" width={14} height={14} />
            </Button>
            <span className="text-white text-xs font-normal">Transfer</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button
              size="icon"
              className="h-12 w-12 rounded-full border border-white bg-transparent hover:bg-white/10 text-white p-0"
              onClick={handleWithdrawClick}
              aria-label="Withdraw"
            >
              <Image src="/icons/withdraw-white.png" alt="Withdraw" width={14} height={14} />
            </Button>
            <span className="text-white text-xs font-normal">Withdraw</span>
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
      <KycOnboardingSheet isSheetOpen={isKycSheetOpen} setSheetOpen={setIsKycSheetOpen} />
    </>
  )
}
