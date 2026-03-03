"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, currencyLogoMapper, formatAmountWithDecimals } from "@/lib/utils"
import { useUserDataStore } from "@/stores/user-data-store"
import { useCurrencies } from "@/hooks/use-api-queries"
import WalletSidebar from "./wallet-sidebar"
import FullScreenIframeModal from "./full-screen-iframe-modal"
import ChooseCurrencyStep from "./choose-currency-step"
import WalletActionStep from "./wallet-action-step"
import TransactionDetails from "./transaction-details"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet"
import { useTranslations } from "@/lib/i18n/use-translations"

interface Currency {
  code: string
  name: string
  logo: string
  label: string
}

interface Transaction {
  transaction_id: number
  timestamp: string
  metadata: {
    brand_name: string
    description: string
    destination_client_id: string
    destination_wallet_id: string
    destination_wallet_type: string
    is_reversible: string
    payout_method: string
    requester_platform: string
    source_client_id: string
    source_wallet_id: string
    source_wallet_type: string
    transaction_currency: string
    transaction_gross_amount: string
    transaction_net_amount: string
    transaction_status: string
    wallet_transaction_type: string
  }
}

type OperationType = "DEPOSIT" | "WITHDRAW" | "TRANSFER"
type WalletStep = "summary" | "chooseCurrency" | "walletAction" | "transactionDetails"

interface WalletSummaryProps {
  isBalancesView?: boolean
  selectedCurrency?: string | null
  onBack?: () => void
  balance?: string
  currency?: string
  isLoading?: boolean
  hasBalance?: boolean
  selectedTransaction?: Transaction | null
  onTransactionSelect?: (transaction: Transaction | null) => void
}

export default function WalletSummary({
  isBalancesView = true,
  selectedCurrency: externalSelectedCurrency = null,
  onBack,
  balance: propBalance = "0.00",
  currency: propCurrency = "USD",
  isLoading: propIsLoading = true,
  hasBalance = false,
  selectedTransaction: parentSelectedTransaction = null,
  onTransactionSelect,
}: WalletSummaryProps) {
  const { t } = useTranslations()
  const router = useRouter()
  const userId = useUserDataStore((state) => state.userId)
  const verificationStatus = useUserDataStore((state) => state.verificationStatus)
  const onboardingStatus = useUserDataStore((state) => state.onboardingStatus)
  const isPoiExpired = process.env.NEXT_PUBLIC_IS_KYC_MANDATORY == "1" && userId && onboardingStatus?.kyc?.poi_status !== "approved"
  const isPoaExpired = process.env.NEXT_PUBLIC_IS_KYC_MANDATORY == "1" && userId && onboardingStatus?.kyc?.poa_status !== "approved"
  const { data: currenciesResponse, isLoading: isCurrenciesLoading } = useCurrencies()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isIframeModalOpen, setIsIframeModalOpen] = useState(false)
  const [currentOperation, setCurrentOperation] = useState<OperationType>("DEPOSIT")
  const [currentStep, setCurrentStep] = useState<WalletStep>("summary")
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [localSelectedTransaction, setLocalSelectedTransaction] = useState<Transaction | null>(null)
  const isMobile = useIsMobile()
  const { hideAlert, showAlert } = useAlertDialog()

  // Use parent's transaction if provided, otherwise use local state
  const selectedTransaction = parentSelectedTransaction !== undefined ? parentSelectedTransaction : localSelectedTransaction

  const getTransactionType = (transaction: Transaction) => {
    const walletTransactionType = transaction.metadata.wallet_transaction_type
    if (walletTransactionType === "transfer_cashier_to_wallet") {
      return t("wallet.deposit")
    } else if (walletTransactionType === "transfer_cashier_from_wallet") {
      return t("wallet.withdraw")
    } else if (walletTransactionType === "transfer_between_wallets") {
      return t("wallet.transfer")
    }
    return walletTransactionType
  }

  const formatTransactionType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const getFromWalletName = (transaction: Transaction) => {
    const sourceWalletType = transaction.metadata.source_wallet_type
    const transactionCurrency = transaction.metadata.transaction_currency

    if (sourceWalletType === "main") {
      return t("wallet.walletName", { currency: transactionCurrency })
    } else if (sourceWalletType === "system") {
      return transaction.metadata.payout_method || t("wallet.external")
    } else if (sourceWalletType === "p2p") {
      return `P2P ${transactionCurrency}`
    }
    return formatTransactionType(sourceWalletType)
  }

  const getToWalletName = (transaction: Transaction) => {
    const destinationWalletType = transaction.metadata.destination_wallet_type
    const transactionCurrency = transaction.metadata.transaction_currency

    if (destinationWalletType === "main") {
      return t("wallet.walletName", { currency: transactionCurrency })
    } else if (destinationWalletType === "system") {
      return transaction.metadata.payout_method || t("wallet.external")
    } else if (destinationWalletType === "p2p") {
      return `P2P ${transactionCurrency}`
    }
    return formatTransactionType(destinationWalletType)
  }

  const formatAmount = (amount: string, currency: string) => {
    const numAmount = Number.parseFloat(amount)
    return `${numAmount.toFixed(2)} ${currency}`
  }

  const getTransactionDisplay = (transaction: Transaction) => {
    const type = getTransactionType(transaction)
    const amount = formatAmount(transaction.metadata.transaction_net_amount, transaction.metadata.transaction_currency)

    switch (type) {
      case t("wallet.deposit"):
        return {
          icon: "/icons/add-green.png",
          iconBg: "bg-success-light",
          amount: amount,
          amountColor: "text-success-text",
          subtitle: t("wallet.deposit"),
          subtitleColor: "text-grayscale-text-muted",
        }
      case t("wallet.withdraw"):
        return {
          icon: "/icons/withdraw-red.png",
          iconBg: "bg-error-light",
          amount: amount,
          amountColor: "text-error-text",
          subtitle: t("wallet.withdraw"),
          subtitleColor: "text-grayscale-text-muted",
        }
      case t("wallet.transfer"):
        return {
          icon: "/icons/transfer-bold.png",
          iconBg: "bg-slate-1200/[0.08]",
          amount: amount,
          amountColor: "text-slate-1200",
          subtitle: `${getFromWalletName(transaction)} → ${getToWalletName(transaction)}`,
          subtitleColor: "text-grayscale-text-muted",
        }
      default:
        return {
          icon: "/icons/add-green.png",
          iconBg: "bg-slate-100",
          amount: amount,
          amountColor: "text-slate-1200",
          subtitle: type,
          subtitleColor: "text-grayscale-text-muted",
        }
    }
  }

  const displayCurrency = externalSelectedCurrency || propCurrency
  const formattedBalance = formatAmountWithDecimals(propBalance)
  const displayCurrencyLabel = currencies.find((c) => c.code === displayCurrency)?.label || displayCurrency

  const fetchCurrencies = () => {
    if (currenciesResponse?.data) {
      const currencyList = Object.entries(currenciesResponse.data).map(([code, data]: [string, any]) => ({
        code,
        name: data.label,
        logo: currencyLogoMapper[code as keyof typeof currencyLogoMapper],
        label: data.label,
      }))
      setCurrencies(currencyList)
    }
  }

  useEffect(() => {
    fetchCurrencies()
  }, [currenciesResponse])

  const handleDepositClick = () => {
    if (userId && verificationStatus?.phone_verified && !isPoiExpired && !isPoaExpired) {
      setCurrentOperation("DEPOSIT")
      setCurrentStep("chooseCurrency")
    } else {
      let title = t("profile.gettingStarted")

      if (isPoiExpired && isPoaExpired) title = t("profile.verificationExpired")
      else if (isPoiExpired) title = t("profile.identityVerificationExpired")
      else if (isPoaExpired) title = t("profile.addressVerificationExpired")

      showAlert({
        title,
        description: (
          <div className="space-y-4 my-2">
            <KycOnboardingSheet route="wallets" onClose={hideAlert} />
          </div>
        ),
        confirmText: undefined,
        cancelText: undefined,
      })
    }
  }

  const handleWithdrawClick = () => {
    if (userId && verificationStatus?.phone_verified && !isPoiExpired && !isPoaExpired) {
      setCurrentOperation("WITHDRAW")
      setCurrentStep("chooseCurrency")
    } else {
      let title = t("profile.gettingStarted")

      if (isPoiExpired && isPoaExpired) title = t("profile.verificationExpired")
      else if (isPoiExpired) title = t("profile.identityVerificationExpired")
      else if (isPoaExpired) title = t("profile.addressVerificationExpired")

      showAlert({
        title,
        description: (
          <div className="space-y-4 my-2">
            <KycOnboardingSheet route="wallets" onClose={hideAlert} />
          </div>
        ),
        confirmText: undefined,
        cancelText: undefined,
      })
    }
  }

  const handleTransferClick = () => {
    if (!hasBalance) return

    if (userId && verificationStatus?.phone_verified && !isPoiExpired && !isPoaExpired) {
      setCurrentOperation("TRANSFER")
      setIsSidebarOpen(true)
    } else {
      let title = t("profile.gettingStarted")

      if (isPoiExpired && isPoaExpired) title = t("profile.verificationExpired")
      else if (isPoiExpired) title = t("profile.identityVerificationExpired")
      else if (isPoaExpired) title = t("profile.addressVerificationExpired")

      showAlert({
        title,
        description: (
          <div className="space-y-4 my-2">
            <KycOnboardingSheet route="wallets" onClose={hideAlert} />
          </div>
        ),
        confirmText: undefined,
        cancelText: undefined,
      })
    }
  }

  const handleBuyClick = () => {
    router.push("/?operation=buy")
  }

  const handleSellClick = () => {
    router.push("/?operation=sell")
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

  const handleTransactionSelect = (transaction: Transaction | null) => {
    if (transaction) {
      setCurrentStep("transactionDetails")
      if (onTransactionSelect) {
        onTransactionSelect(transaction)
      } else {
        setLocalSelectedTransaction(transaction)
      }
    } else {
      handleCloseTransactionDetails()
    }
  }

  const handleCloseTransactionDetails = () => {
    setCurrentStep("summary")
    if (onTransactionSelect) {
      onTransactionSelect(null)
    } else {
      setLocalSelectedTransaction(null)
    }
  }

  const handleDirectDepositClick = () => {
    setCurrentStep("summary")
    setIsIframeModalOpen(true)
  }

  const handleDirectWithdrawClick = () => {
    setCurrentStep("summary")
    setIsIframeModalOpen(true)
  }

  const handleSendTransferClick = () => { }
  const handleReceiveTransferClick = () => { }

  const handleGoBackToCurrency = () => {
    setCurrentStep("chooseCurrency")
  }

  const currencyLogo = currencyLogoMapper[displayCurrency as keyof typeof currencyLogoMapper]

  const isShowingTransactionDetails = selectedTransaction !== null

  return (
    <>
      <div
        className={cn(
          "w-full p-6 flex flex-col",
          isBalancesView && !isShowingTransactionDetails ? "bg-slate-1200 md:h-[140px] h-auto" : "bg-slate-75 md:h-[180px] h-auto",
          isMobile ? (isBalancesView && !isShowingTransactionDetails ? "rounded-b-3xl" : "rounded-b-none") : "rounded-3xl",
        )}
      >
        {!isBalancesView && (
          <div className="flex justify-start items-center h-8 mb-6">
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center" aria-label="Back to balances">
              <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
            </button>
          </div>
        )}

        {isShowingTransactionDetails && selectedTransaction && (
          <div className="flex justify-start items-center h-8 mb-6">
            <button onClick={handleCloseTransactionDetails} className="w-8 h-8 flex items-center justify-center" aria-label="Back to transaction list">
              <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
            </button>
          </div>
        )}

        {isShowingTransactionDetails && selectedTransaction ? (
          <div className={cn("flex items-center gap-4", isMobile && "gap-2 flex-col text-center")}>
            <div className="flex-shrink-0">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getTransactionDisplay(selectedTransaction).iconBg}`}>
                <Image
                  src={getTransactionDisplay(selectedTransaction).icon}
                  alt="Transaction"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
            </div>
            <div className={cn("flex flex-col", isMobile && "items-center")}>
              <p className={`text-[28px] font-extrabold ${getTransactionDisplay(selectedTransaction).amountColor}`}>
                {getTransactionDisplay(selectedTransaction).amount}
              </p>
              <p className={`text-sm font-normal ${getTransactionDisplay(selectedTransaction).subtitleColor}`}>
                {getTransactionDisplay(selectedTransaction).subtitle}
              </p>
            </div>
          </div>
        ) : (
          <div className={cn("flex items-center justify-between", isMobile && "flex-col gap-4")}>
            <div className={cn("flex items-center gap-4", isMobile && "gap-2 flex-col text-center")}>
              <div className="flex-shrink-0">
                {isBalancesView ? (<Image
                  src="/icons/dp2p-wallet.png"
                  alt="P2P Logo"
                  width={92}
                  height={92}
                  className="w-18 h-18 md:w-24 md:h-24"
                />) :
                  (<div className="flex-shrink-0 relative w-16 h-16">
                    <Image src="/icons/icon-p2p.svg" alt="P2P" width={64} height={64} className="w-16 h-16 rounded-full" />
                    <div className="absolute -bottom-[0.5rem] left-1/2 -translate-x-1/2">
                      <Image
                        src={currencyLogo}
                        alt={`${externalSelectedCurrency} Logo`}
                        width={24}
                        height={24}
                        className="w-6 h-6 rounded-full bg-white p-[2px]"
                      />
                    </div>
                  </div>)}
              </div>

              <div className={cn("flex flex-col", isMobile && "items-center")}>
                {isBalancesView ? (
                  <>
                    <p className="text-xs font-normal text-white/72 mb-1">{t("wallet.estTotalValue")}</p>
                    {propIsLoading ? (
                      <Skeleton className="h-7 w-32 bg-white/20" />
                    ) : (
                      <p className="text-xl font-extrabold text-white">{`${formattedBalance} ${displayCurrency}`}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-[28px] font-extrabold text-slate-1200">
                      {propIsLoading ? "Loading..." : `${formattedBalance} ${displayCurrency}`}
                    </p>
                    <p className="text-sm font-normal text-grayscale-100">{displayCurrencyLabel}</p>
                  </>
                )}
              </div>
            </div>

            <div className={cn("flex items-center gap-[66px] px-[33px]", isMobile && "flex-row justify-center w-full")}>
              <div className="hidden flex-col items-center gap-2">
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full bg-[#FF444F] hover:bg-[#E63946] text-white p-0"
                  onClick={handleDepositClick}
                  aria-label="Deposit"
                >
                  <Image src="/icons/plus-white.png" alt="Deposit" width={14} height={14} />
                </Button>
                <span className={cn("text-xs font-normal", isBalancesView ? "text-white" : "text-slate-1200")}>
                  {t("wallet.deposit")}
                </span>
              </div>

              {!isBalancesView && (
                <div className="flex flex-col items-center gap-2">
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full bg-[#FF444F] hover:bg-[#E63946] text-white p-0"
                    onClick={handleBuyClick}
                    aria-label="Buy"
                  >
                    <Image src="/icons/plus-white.png" alt="Buy" width={14} height={14} />
                  </Button>
                  <span className="text-xs font-normal text-slate-1200">
                    {t("wallet.buy") || "Buy"}
                  </span>
                </div>
              )}

              <div className="flex flex-col items-center gap-2">
                <Button
                  size="icon"
                  className="h-12 w-12 rounded-full p-0 bg-[#FF444F] hover:bg-[#E63946] text-white"
                  onClick={handleTransferClick}
                  disabled={!hasBalance}
                  aria-label="Transfer"
                >
                  <Image src="/icons/transfer-white.png" alt="Transfer" width={14} height={14} />
                </Button>
                <span className={cn("text-xs font-normal", isBalancesView ? "text-white" : "text-slate-1200")}>
                  {t("wallet.transfer")}
                </span>
              </div>

              {!isBalancesView && (
                <div className="flex flex-col items-center gap-2">
                  <Button
                    size="icon"
                    className="h-12 w-12 rounded-full text-white p-0 border border-white"
                    onClick={handleSellClick}
                    aria-label="Sell"
                    variant="ghost"
                  >
                    <Image src="/icons/withdraw-white.svg" alt="Sell" width={14} height={24} />
                  </Button>
                  <span className="text-xs font-normal text-slate-1200">
                    {t("wallet.sell") || "Sell"}
                  </span>
                </div>
              )}

              <div className="hidden flex-col items-center gap-2">
                <Button
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-full p-0",
                    isBalancesView
                      ? propBalance === "0.00"
                        ? "border border-[#FFFFFF3D] bg-transparent text-[#FFFFFF3D]"
                        : "border border-white bg-transparent hover:bg-white/10 text-white"
                      : "border border-slate-1200 bg-transparent hover:bg-black/10 text-slate-1200",
                  )}
                  onClick={handleWithdrawClick}
                  disabled={isBalancesView && propBalance === "0.00"}
                  aria-label="Withdraw"
                >
                  <Image
                    src={isBalancesView ? "/icons/withdraw-white.png" : "/icons/withdraw-black.png"}
                    alt="Withdraw"
                    width={14}
                    height={14}
                    className={cn(isBalancesView && propBalance === "0.00" && "opacity-25")}
                  />
                </Button>
                <span
                  className={cn(
                    "text-xs font-normal",
                    isBalancesView ? (propBalance === "0.00" ? "text-[#FFFFFF3D]" : "text-white") : "text-slate-1200",
                  )}
                >
                  {t("wallet.withdraw")}
                </span>
              </div>
            </div>
          </div>
        )}
        {currentStep === "chooseCurrency" && (
          <div className="fixed inset-0 z-50 bg-white">
            <ChooseCurrencyStep
              title={currentOperation === "DEPOSIT" ? t("wallet.deposit") : t("wallet.withdraw")}
              description={t("wallet.chooseCurrencyDescription", {
                action: currentOperation === "DEPOSIT" ? "deposit" : "withdraw",
              })}
              currencies={currencies}
              onClose={handleClose}
              onCurrencySelect={handleCurrencySelect}
            />
          </div>
        )}

        {currentStep === "walletAction" && (
          <div className="fixed inset-0 z-50 bg-white">
            <WalletActionStep
              title={currentOperation === "DEPOSIT" ? t("wallet.depositWith") : t("wallet.withdrawWith")}
              actionType={currentOperation.toLowerCase() as "deposit" | "withdraw"}
              onClose={handleClose}
              onGoBack={handleGoBackToCurrency}
              onDirectDepositClick={handleDirectDepositClick}
              onDirectWithdrawClick={handleDirectWithdrawClick}
              selectedCurrency={selectedCurrency}
            />
          </div>
        )}

        {currentStep === "transactionDetails" && selectedTransaction && (
          <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-start items-center mb-6">
                <button
                  onClick={handleCloseTransactionDetails}
                  className="w-8 h-8 flex items-center justify-center"
                  aria-label="Back to transactions"
                >
                  <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
                </button>
              </div>
              <TransactionDetails transaction={selectedTransaction} onClose={handleCloseTransactionDetails} />
            </div>
          </div>
        )}
        <WalletSidebar
          currencySelected={selectedCurrency}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onDirectDepositClick={currentOperation === "DEPOSIT" ? handleDirectDepositClick : handleDirectWithdrawClick}
          operation={currentOperation}
          onP2PTransferClick={handleSendTransferClick}
          onAccountTransferClick={handleReceiveTransferClick}
          currencies={currencies}
          transferStep={"enterAmount"}
        />

        <FullScreenIframeModal
          isOpen={isIframeModalOpen}
          onClose={() => setIsIframeModalOpen(false)}
          operation={currentOperation}
          currency={displayCurrency}
        />
      </div>
    </>
  )
}
