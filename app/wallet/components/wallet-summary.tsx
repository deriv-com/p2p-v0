"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn, currencyLogoMapper } from "@/lib/utils"
import { useUserDataStore } from "@/stores/user-data-store"
import { getCurrencies, fetchBalance } from "@/services/api/api-wallets"
import WalletSidebar from "./wallet-sidebar"
import FullScreenIframeModal from "./full-screen-iframe-modal"
import ChooseCurrencyStep from "./choose-currency-step"
import WalletActionStep from "./wallet-action-step"
import { useIsMobile } from "@/hooks/use-mobile"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet"

interface Currency {
  code: string
  name: string
  logo: string
}

type OperationType = "DEPOSIT" | "WITHDRAW" | "TRANSFER"
type WalletStep = "summary" | "chooseCurrency" | "walletAction"

interface WalletSummaryProps {
  isBalancesView?: boolean
  selectedCurrency?: string | null
  onBack?: () => void
}

export default function WalletSummary({
  isBalancesView = true,
  selectedCurrency: externalSelectedCurrency = null,
  onBack,
}: WalletSummaryProps) {
  const userId = useUserDataStore((state) => state.userId)
  const [isKycSheetOpen, setIsKycSheetOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isIframeModalOpen, setIsIframeModalOpen] = useState(false)
  const [currentOperation, setCurrentOperation] = useState<OperationType>("DEPOSIT")
  const [currentStep, setCurrentStep] = useState<WalletStep>("summary")
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [balance, setBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const isMobile = useIsMobile()

  const displayCurrency = externalSelectedCurrency || selectedCurrency

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

  const loadBalance = useCallback(async () => {
    try {
      const balanceAmount = await fetchBalance(displayCurrency)
      setBalance(balanceAmount)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching user balance:", error)
      setIsLoading(false)
    }
  }, [displayCurrency])

  useEffect(() => {
    loadBalance()
    fetchCurrencies()
  }, [loadBalance])

  const handleDepositClick = () => {
    if (userId) {
      setCurrentOperation("DEPOSIT")
      setCurrentStep("chooseCurrency")
    } else {
      setIsKycSheetOpen(true)
    }
  }

  const handleWithdrawClick = () => {
    if (userId) {
      setCurrentOperation("WITHDRAW")
      setCurrentStep("chooseCurrency")
    } else {
      setIsKycSheetOpen(true)
    }
  }

  const handleTransferClick = () => {
    if (userId) {
      setCurrentOperation("TRANSFER")
      setIsSidebarOpen(true)
    } else {
      setIsKycSheetOpen(true)
    }
  }

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency)
    setCurrentStep("walletAction")
  }

  const handleClose = () => {
    setCurrentStep("summary")
    setIsSidebarOpen(false)
    setIsIframeModalOpen(false)
  }

  const handleDirectDepositClick = () => {
    setCurrentStep("summary")
    setIsIframeModalOpen(true)
  }

  const handleDirectWithdrawClick = () => {
    setCurrentStep("summary")
    setIsIframeModalOpen(true)
  }

  const handleSendTransferClick = () => {}
  const handleReceiveTransferClick = () => {}

  const handleGoBackToCurrency = () => {
    setCurrentStep("chooseCurrency")
  }

  const currencyLogo = currencyLogoMapper[displayCurrency as keyof typeof currencyLogoMapper]

  return (
    <>
      <div
        className={cn(
          "w-full p-6 flex flex-col",
          isBalancesView ? "bg-slate-1200 md:h-[140px] h-auto" : "bg-slate-75 md:h-[180px] h-auto",
          isMobile ? (isBalancesView ? "rounded-b-3xl" : "rounded-b-none") : "rounded-3xl",
        )}
      >
        {!isBalancesView && (
          <div className="flex justify-start items-center h-8 mb-6">
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center" aria-label="Back to balances">
              <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
            </button>
          </div>
        )}

        <div className={cn("flex items-center justify-between", isMobile && "flex-col gap-4")}>
          <div className={cn("flex items-center gap-4", isMobile && "gap-2 flex-col text-center")}>
            <div className="flex-shrink-0">
              <Image
                src={!isBalancesView && currencyLogo ? currencyLogo : "/icons/p2p-3d.png"}
                alt={!isBalancesView && externalSelectedCurrency ? `${externalSelectedCurrency} Logo` : "P2P Logo"}
                width={!isBalancesView ? 64 : 92}
                height={!isBalancesView ? 64 : 92}
                className={cn(!isBalancesView ? "w-16 h-16" : "w-16 h-16 md:w-24 md:h-24")}
              />
            </div>

            <div className={cn("flex flex-col", isMobile && "items-center")}>
              {isBalancesView ? (
                <>
                  <p className="text-xs font-normal text-white/72">Total value</p>
                  <p className="text-xl font-extrabold text-white">
                    {isLoading ? "Loading..." : `${Number(balance).toFixed(2)} ${displayCurrency}`}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[28px] font-extrabold text-slate-1200">
                    {isLoading ? "Loading..." : `${Number(balance).toFixed(2)} ${displayCurrency}`}
                  </p>
                  <p className="text-sm font-normal text-grayscale-100">{displayCurrency}</p>
                </>
              )}
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
              <span className={cn("text-xs font-normal", isBalancesView ? "text-white" : "text-slate-1200")}>
                Deposit
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full p-0",
                  isBalancesView
                    ? "border border-white bg-transparent hover:bg-white/10 text-white"
                    : "border border-slate-1200 bg-transparent hover:bg-black/10 text-slate-1200",
                )}
                onClick={handleTransferClick}
                aria-label="Transfer"
              >
                <Image
                  src={isBalancesView ? "/icons/transfer-white.png" : "/icons/transfer-black.png"}
                  alt="Transfer"
                  width={14}
                  height={14}
                />
              </Button>
              <span className={cn("text-xs font-normal", isBalancesView ? "text-white" : "text-slate-1200")}>
                Transfer
              </span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <Button
                size="icon"
                className={cn(
                  "h-12 w-12 rounded-full p-0",
                  isBalancesView
                    ? "border border-white bg-transparent hover:bg-white/10 text-white"
                    : "border border-slate-1200 bg-transparent hover:bg-black/10 text-slate-1200",
                )}
                onClick={handleWithdrawClick}
                aria-label="Withdraw"
              >
                <Image
                  src={isBalancesView ? "/icons/withdraw-white.png" : "/icons/withdraw-black.png"}
                  alt="Withdraw"
                  width={14}
                  height={14}
                />
              </Button>
              <span className={cn("text-xs font-normal", isBalancesView ? "text-white" : "text-slate-1200")}>
                Withdraw
              </span>
            </div>
          </div>
        </div>
      </div>

      {currentStep === "chooseCurrency" && (
        <div className="fixed inset-0 z-50 bg-white">
          <ChooseCurrencyStep
            title={currentOperation === "DEPOSIT" ? "Deposit" : "Withdrawal"}
            description={
              currentOperation === "DEPOSIT"
                ? "Choose which currency you would like to deposit."
                : "Choose which currency you would like to withdraw."
            }
            currencies={currencies}
            onClose={handleClose}
            onCurrencySelect={handleCurrencySelect}
          />
        </div>
      )}

      {currentStep === "walletAction" && (
        <div className="fixed inset-0 z-50 bg-white">
          <WalletActionStep
            title={currentOperation === "DEPOSIT" ? "Deposit with" : "Withdraw with"}
            actionType={currentOperation.toLowerCase() as "deposit" | "withdraw"}
            onClose={handleClose}
            onGoBack={handleGoBackToCurrency}
            onDirectDepositClick={handleDirectDepositClick}
            onDirectWithdrawClick={handleDirectWithdrawClick}
          />
        </div>
      )}

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
        currency={displayCurrency}
      />
      <KycOnboardingSheet isSheetOpen={isKycSheetOpen} setSheetOpen={setIsKycSheetOpen} />
    </>
  )
}
