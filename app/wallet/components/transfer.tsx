"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchWalletsList, walletTransfer, getCurrencies, fetchTransactions } from "@/services/api/api-wallets"
import { currencyLogoMapper } from "@/lib/utils"
import WalletDisplay from "./wallet-display"
import ChooseCurrencyStep from "./choose-currency-step"
import TransactionDetails from "./transaction-details"

interface TransferProps {
  onClose: () => void
}

interface Currency {
  code: string
  name: string
  logo: string
}

interface ProcessedWallet {
  wallet_id: string
  name: string
  balance: string
  currency: string
  icon: string
  type: string
}

interface WalletData {
  id: string
  name: string
  currency: string
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
    external_reference_id?: string
  }
}

type TransferStep = "chooseCurrency" | "enterAmount" | "success"
type WalletSelectorType = "from" | "to" | null

export default function Transfer({ onClose }: TransferProps) {
  const [step, setStep] = useState<TransferStep>("chooseCurrency")
  const [wallets, setWallets] = useState<ProcessedWallet[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null)
  const [showMobileSheet, setShowMobileSheet] = useState<WalletSelectorType>(null)
  const [showDesktopWalletPopup, setShowDesktopWalletPopup] = useState<WalletSelectorType>(null)
  const [showMobileConfirmSheet, setShowMobileConfirmSheet] = useState(false)
  const [showDesktopConfirmPopup, setShowDesktopConfirmPopup] = useState(false)

  const [transferAmount, setTransferAmount] = useState<string | null>(null)
  const [sourceWalletData, setSourceWalletData] = useState<WalletData | null>(null)
  const [destinationWalletData, setDestinationWalletData] = useState<WalletData | null>(null)

  const [externalReferenceId, setExternalReferenceId] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const toEnterAmount = () => setStep("enterAmount")
  const toConfirm = () => {
    if (window.innerWidth >= 768) {
      setShowDesktopConfirmPopup(true)
    } else {
      setShowMobileConfirmSheet(true)
    }
  }
  const toSuccess = () => setStep("success")
  const goBack = () => {
    if (step === "enterAmount") setStep("chooseCurrency")
    else if (step === "chooseCurrency") onClose()
  }

  const handleCurrencySelect = (currency: string) => {
    setSelectedCurrency(currency)
    toEnterAmount()
  }

  useEffect(() => {
    const loadCurrencies = async () => {
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

    loadCurrencies()
  }, [])

  useEffect(() => {
    if (!selectedCurrency) return

    const loadWallets = async () => {
      try {
        const response = await fetchWalletsList()

        if (response?.data?.wallets) {
          const processedWallets: ProcessedWallet[] = []

          response.data.wallets.forEach((wallet: any) => {
            const matchingBalance = wallet.balances.find((balance: any) => balance.currency === selectedCurrency)
            const balanceValue = matchingBalance ? matchingBalance.balance : "0"

            processedWallets.push({
              wallet_id: wallet.wallet_id,
              name: (wallet.type || "").toLowerCase() === "p2p" ? "P2P Wallet" : `Trading Wallet`,
              balance: balanceValue,
              currency: selectedCurrency,
              icon: "/icons/usd-flag.png",
              type: wallet.type,
            })
          })

          setWallets(processedWallets)

          const p2pWallet = processedWallets.find((w) => w.type?.toLowerCase() === "p2p")
          if (p2pWallet && !sourceWalletData) {
            setSourceWalletData({ id: p2pWallet.wallet_id, name: p2pWallet.name, currency: p2pWallet.currency })
          }
        }
      } catch (error) {
        console.error("Error fetching wallets:", error)
      }
    }

    loadWallets()
  }, [selectedCurrency])

  const handleTransferClick = () => {
    toConfirm()
  }

  const handleConfirmTransfer = async () => {
    if (!transferAmount || !sourceWalletData || !destinationWalletData) {
      console.error("Missing required transfer data")
      return
    }

    try {
      const requestId = crypto.randomUUID()

      const transferParams = {
        amount: transferAmount,
        currency: selectedCurrency || "USD",
        destination_wallet_id: destinationWalletData.id,
        request_id: requestId,
        source_wallet_id: sourceWalletData.id,
      }

      const result = await walletTransfer(transferParams)

      if (!result?.data?.errors || result.data.errors.length === 0) {
        console.log("Transfer successful:", result)
        if (result?.data?.external_reference_id) {
          setExternalReferenceId(result.data.external_reference_id)
        }
        setShowDesktopConfirmPopup(false)
        setShowMobileConfirmSheet(false)
        toSuccess()
      } else {
        console.error("Transfer failed with errors:", result.data.errors)
      }
    } catch (error) {
      console.error("Error during transfer:", error)
    }
  }

  const handleViewDetails = async () => {
    if (!externalReferenceId) {
      console.error("No external reference ID available")
      return
    }

    try {
      const response = await fetchTransactions()

      if (response?.data?.transactions) {
        const matchingTransaction = response.data.transactions.find(
          (transaction: Transaction) => transaction.metadata.external_reference_id === externalReferenceId,
        )

        if (matchingTransaction) {
          setSelectedTransaction(matchingTransaction)
        } else {
          console.error("Transaction not found with external_reference_id:", externalReferenceId)
        }
      }
    } catch (error) {
      console.error("Error fetching transaction details:", error)
    }
  }

  const handleCloseTransactionDetails = () => {
    setSelectedTransaction(null)
    onClose()
  }

  const handleDoneClick = () => {
    setStep("chooseCurrency")
    setTransferAmount(null)
    setSourceWalletData(null)
    setDestinationWalletData(null)
    setSelectedCurrency(null)
    setExternalReferenceId(null)

    onClose()
  }

  const handleWalletSelect = (wallet: ProcessedWallet, type: WalletSelectorType) => {
    if (type === "from") {
      setSourceWalletData({ id: wallet.wallet_id, name: wallet.name, currency: wallet.currency })
    } else if (type === "to") {
      setDestinationWalletData({ id: wallet.wallet_id, name: wallet.name, currency: wallet.currency })
    }

    setShowMobileSheet(null)
    setShowDesktopWalletPopup(null)
  }

  const handleInterchange = () => {
    const tempSource = sourceWalletData
    setSourceWalletData(destinationWalletData)
    setDestinationWalletData(tempSource)
  }

  const formatBalance = (amount: string): string => {
    const num = Number.parseFloat(amount)
    if (isNaN(num)) return "0.00"
    return num.toFixed(2)
  }

  const getSourceWalletBalance = (): number => {
    const wallet = wallets.find((w) => w.wallet_id === sourceWalletData?.id)
    return wallet ? Number.parseFloat(wallet.balance) : 0
  }

  const isAmountValid = (amount: string): boolean => {
    const numAmount = Number.parseFloat(amount)
    const sourceBalance = getSourceWalletBalance()
    return !isNaN(numAmount) && numAmount > 0 && numAmount <= sourceBalance
  }

  const getSourceWalletAmount = () => {
    const wallet = wallets.find((w) => w.wallet_id === sourceWalletData?.id)
    return wallet ? `${formatBalance(wallet.balance)} ${wallet.currency}` : ""
  }

  const getDestinationWalletAmount = () => {
    const wallet = wallets.find((w) => w.wallet_id === destinationWalletData?.id)
    return wallet ? `${formatBalance(wallet.balance)} ${wallet.currency}` : ""
  }

  const getFilteredWallets = (type: WalletSelectorType) => {
    if (type === "from" && destinationWalletData) {
      const destinationWallet = wallets.find((w) => w.wallet_id === destinationWalletData.id)
      if (destinationWallet?.type?.toLowerCase() === "p2p") {
        return wallets.filter((w) => w.type?.toLowerCase() !== "p2p")
      } else {
        return wallets.filter((w) => w.type?.toLowerCase() === "p2p")
      }
    }

    if (type === "to" && sourceWalletData) {
      const sourceWallet = wallets.find((w) => w.wallet_id === sourceWalletData.id)
      if (sourceWallet?.type?.toLowerCase() === "p2p") {
        return wallets.filter((w) => w.type?.toLowerCase() !== "p2p")
      } else {
        return wallets.filter((w) => w.type?.toLowerCase() === "p2p")
      }
    }

    return wallets
  }

  const renderMobileSheet = (type: WalletSelectorType) => {
    if (showMobileSheet !== type) return null

    const title = type === "from" ? "From" : "To"
    const selectedWalletId = type === "from" ? sourceWalletData?.id : destinationWalletData?.id

    return (
      <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setShowMobileSheet(null)}>
        <div
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <h2 className="text-slate-1200 text-[20px] font-extrabold mb-6 text-center">{title}</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {getFilteredWallets(type).map((wallet) => (
                <div
                  key={wallet.wallet_id}
                  className="cursor-pointer"
                  onClick={() => {
                    handleWalletSelect(wallet, type)
                    setShowMobileSheet(null)
                  }}
                >
                  <WalletDisplay
                    name={wallet.name}
                    amount={formatBalance(wallet.balance)}
                    currency={wallet.currency}
                    icon={wallet.icon}
                    isSelected={selectedWalletId === wallet.wallet_id}
                    onClick={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderDesktopWalletPopup = (type: WalletSelectorType) => {
    if (showDesktopWalletPopup !== type) return null

    const title = type === "from" ? "From" : "To"
    const selectedWalletId = type === "from" ? sourceWalletData?.id : destinationWalletData?.id

    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 hidden md:flex items-center justify-center"
        onClick={() => setShowDesktopWalletPopup(null)}
      >
        <div
          className="bg-white rounded-[32px] w-[512px] min-w-[512px] max-w-[512px] max-h-[80vh] overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="default"
            className="absolute top-4 right-4 min-w-0 px-0"
            onClick={() => setShowDesktopWalletPopup(null)}
            aria-label="Close"
          >
            <Image src="/icons/button-close.png" alt="Close" width={48} height={48} />
          </Button>
          <div className="p-8">
            <h2 className="text-slate-1200 text-[24px] font-extrabold mb-6">{title}</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {getFilteredWallets(type).map((wallet) => (
                <div
                  key={wallet.wallet_id}
                  className="cursor-pointer"
                  onClick={() => {
                    handleWalletSelect(wallet, type)
                    setShowDesktopWalletPopup(null)
                  }}
                >
                  <WalletDisplay
                    name={wallet.name}
                    amount={formatBalance(wallet.balance)}
                    currency={wallet.currency}
                    icon={getCurrencyImage(wallet.name, wallet.currency)}
                    isSelected={selectedWalletId === wallet.wallet_id}
                    onClick={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderDesktopConfirmPopup = () => {
    if (!showDesktopConfirmPopup) return null

    return (
      <div
        className="fixed inset-0 bg-black/50 z-50 hidden md:flex items-center justify-center"
        onClick={() => setShowDesktopConfirmPopup(false)}
      >
        <div
          className="bg-white rounded-[32px] w-[512px] min-w-[512px] max-w-[512px] overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="default"
            className="p-4 min-w-0 absolute top-4 right-4 h-0 px-0"
            onClick={() => setShowDesktopConfirmPopup(false)}
            aria-label="Close"
          >
            <Image src="/icons/button-close.png" alt="Close" width={48} height={48} />
          </Button>
          <div className="p-8">
            <h2 className="text-slate-1200 text-[24px] font-extrabold mb-6 text-left">Confirm transfer</h2>
            <div className="mb-6">
              <div className="mb-4">
                <span className="block text-base font-normal text-grayscale-text-muted mb-1">From</span>
                <div className="flex items-center gap-3">
                  {sourceWalletData && (
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={getCurrencyImage(sourceWalletData.name, sourceWalletData.currency)}
                        alt={sourceWalletData.currency}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <span className="block text-base font-normal text-slate-1200">{sourceWalletData?.name}</span>
                </div>
              </div>
              <div className="h-px bg-gray-200 mb-4"></div>
              <div className="mb-4">
                <span className="block text-base font-normal text-grayscale-text-muted mb-1">To</span>
                <div className="flex items-center gap-3">
                  {destinationWalletData && (
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          getCurrencyImage(destinationWalletData.name, destinationWalletData.currency) ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={destinationWalletData.currency}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <span className="block text-base font-normal text-slate-1200">{destinationWalletData?.name}</span>
                </div>
              </div>
              <div className="h-px bg-gray-200 mb-4"></div>
              <div className="mb-4">
                <span className="block text-base font-normal text-grayscale-text-muted mb-1">Amount</span>
                <span className="block text-base font-normal text-slate-1200">
                  {formatBalance(transferAmount || "0")} {selectedCurrency || "USD"}
                </span>
              </div>
              <div className="h-px bg-gray-200 mb-4"></div>
            </div>
            <div className="space-y-2 mt-12">
              <Button
                onClick={handleConfirmTransfer}
                className="w-full h-12 min-w-24 min-h-12 max-h-12 px-7 flex justify-center items-center gap-2"
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDesktopConfirmPopup(false)}
                className="w-full h-12 min-w-24 min-h-12 max-h-12 px-7 flex justify-center items-center gap-2"
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderMobileConfirmSheet = () => {
    if (!showMobileConfirmSheet) return null

    return (
      <div className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={() => setShowMobileConfirmSheet(false)}>
        <div
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="pt-2 px-4 pb-8">
            <div className="flex justify-center mb-10">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <h1 className="text-slate-1200 text-[20px] font-extrabold mb-6 text-center">Confirm transfer</h1>
            <div className="mb-6 px-4">
              <div className="mb-4">
                <span className="block text-base font-normal text-grayscale-text-muted mb-1">From</span>
                <div className="flex items-center gap-3">
                  {sourceWalletData && (
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={getCurrencyImage(sourceWalletData.name, sourceWalletData.currency) || "/placeholder.svg"}
                        alt={sourceWalletData.currency}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <span className="block text-base font-normal text-slate-1200">{sourceWalletData?.name}</span>
                </div>
              </div>
              <div className="h-px bg-gray-200 mb-4"></div>
              <div className="mb-4">
                <span className="block text-base font-normal text-grayscale-text-muted mb-1">To</span>
                <div className="flex items-center gap-3">
                  {destinationWalletData && (
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          getCurrencyImage(destinationWalletData.name, destinationWalletData.currency) ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={destinationWalletData.currency}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <span className="block text-base font-normal text-slate-1200">{destinationWalletData?.name}</span>
                </div>
              </div>
              <div className="h-px bg-gray-200 mb-4"></div>
              <div className="mb-4">
                <span className="block text-base font-normal text-grayscale-text-muted mb-1">Amount</span>
                <span className="block text-base font-normal text-slate-1200">
                  {formatBalance(transferAmount || "0")} {selectedCurrency || "USD"}
                </span>
              </div>
              <div className="h-px bg-gray-200 mb-4"></div>
            </div>
            <div className="space-y-3 mt-8">
              <Button
                onClick={handleConfirmTransfer}
                className="w-full h-12 min-w-24 min-h-12 max-h-12 px-7 flex justify-center items-center gap-2"
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getCurrencyImage = (walletName: string, currency: string) => {
    if (walletName === "P2P Wallet") {
      return "/icons/p2p-logo.png"
    }
    return currencyLogoMapper[currency as keyof typeof currencyLogoMapper]
  }

  if (step === "chooseCurrency") {
    return (
      <ChooseCurrencyStep
        title="Transfer"
        description="Choose which currency you would like to transfer."
        currencies={currencies}
        onClose={onClose}
        onCurrencySelect={handleCurrencySelect}
      />
    )
  }

  if (step === "enterAmount") {
    return (
      <div className="absolute inset-0 flex flex-col h-full p-4 md:pt-5">
        <div className="flex justify-between items-center mb-6 md:max-w-[608px] md:mx-auto md:w-full">
          <Button variant="ghost" size="sm" className="px-0 md:hidden" onClick={goBack} aria-label="Go back">
            <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
          </Button>
          <div className="hidden md:block w-8 h-8"></div>
          <Button variant="ghost" size="sm" className="px-0" onClick={onClose} aria-label="Close">
            <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} height={32} />
          </Button>
        </div>
        <div className="md:max-w-[608px] md:mx-auto md:w-full flex-1 flex flex-col">
          <h1 className="text-slate-1200 text-xl md:text-[32px] font-extrabold mt-6 mb-6 px-2">Transfer</h1>
          <div className="relative mb-6 px-2">
            <div
              className="bg-grayscale-500 p-4 px-6 flex items-center gap-1 rounded-2xl cursor-pointer h-[100px]"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setShowMobileSheet("from")
                } else {
                  setShowDesktopWalletPopup("from")
                }
              }}
            >
              <div className="flex flex-col items-start gap-1 w-10">
                <div className="text-grayscale-text-muted text-base font-normal">From</div>
                {sourceWalletData ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mb-3 mt-1">
                    <Image
                      src={getCurrencyImage(sourceWalletData.name, sourceWalletData.currency) || "/placeholder.svg"}
                      alt={sourceWalletData.currency}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-grayscale-text-placeholder text-base font-normal mb-3 mt-1">Select</div>
                )}
              </div>
              <div className="flex-1 mt-6">
                {sourceWalletData && (
                  <>
                    <div className="text-slate-1200 text-base font-bold">{sourceWalletData.name}</div>
                    <div className="text-grayscale-600 text-sm font-normal">{getSourceWalletAmount()}</div>
                  </>
                )}
              </div>
              <Image src="/icons/chevron-down.png" alt="Dropdown" width={24} height={24} />
            </div>
            <div className="h-2"></div>
            <div
              className="bg-grayscale-500 p-4 px-6 flex items-center gap-1 rounded-2xl cursor-pointer h-[100px]"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setShowMobileSheet("to")
                } else {
                  setShowDesktopWalletPopup("to")
                }
              }}
            >
              <div className="flex flex-col items-start gap-1 w-10">
                <div className="text-grayscale-text-muted text-base font-normal">To</div>
                {destinationWalletData ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mb-3 mt-1">
                    <Image
                      src={
                        getCurrencyImage(destinationWalletData.name, destinationWalletData.currency) ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={destinationWalletData.currency}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="text-grayscale-text-placeholder text-base font-normal mb-3 mt-1">Select</div>
                )}
              </div>
              <div className="flex-1 mt-6">
                {destinationWalletData && (
                  <>
                    <div className="text-slate-1200 text-base font-bold">{destinationWalletData.name}</div>
                    <div className="text-grayscale-600 text-sm font-normal">{getDestinationWalletAmount()}</div>
                  </>
                )}
              </div>
              <Image src="/icons/chevron-down.png" alt="Dropdown" width={24} height={24} />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleInterchange}
                className="p-0 bg-white rounded-full shadow-sm"
              >
                <Image src="/icons/button-switch.png" alt="Switch" width={48} height={48} />
              </Button>
            </div>
          </div>
          <div className="mb-6 px-2 relative">
            <h2 className="text-slate-1200 text-base font-normal mb-2">Amount</h2>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={transferAmount || ""}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="h-12 px-4 border border-grayscale-200 rounded-lg text-base placeholder:text-grayscale-text-placeholder appearance-none"
                max={getSourceWalletBalance()}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-grayscale-600">
                {selectedCurrency || "USD"}
              </span>
            </div>
            {transferAmount && !isAmountValid(transferAmount) && (
              <p className="text-red-500 text-sm mt-1">
                Amount cannot exceed available balance ({formatBalance(getSourceWalletBalance().toString())}{" "}
                {selectedCurrency || "USD"})
              </p>
            )}
            <div className="hidden md:block absolute top-full right-0 mt-6">
              <Button
                onClick={handleTransferClick}
                disabled={
                  !transferAmount ||
                  transferAmount.trim() === "" ||
                  !sourceWalletData ||
                  !destinationWalletData ||
                  !isAmountValid(transferAmount)
                }
                className="flex h-12 w-24 min-h-12 max-h-12 px-7 justify-center items-center gap-2"
              >
                Transfer
              </Button>
            </div>
          </div>
          <div className="flex-1"></div>
          <div className="mt-auto md:hidden">
            <Button
              onClick={handleTransferClick}
              disabled={
                !transferAmount ||
                transferAmount.trim() === "" ||
                !sourceWalletData ||
                !destinationWalletData ||
                !isAmountValid(transferAmount)
              }
              className="w-full h-12 min-w-24 min-h-12 max-h-12 px-7 flex justify-center items-center gap-2"
            >
              Transfer
            </Button>
          </div>
        </div>
        {renderMobileSheet("from")}
        {renderMobileSheet("to")}
        {renderDesktopWalletPopup("from")}
        {renderDesktopWalletPopup("to")}
        {renderMobileConfirmSheet()}
        {renderDesktopConfirmPopup()}
      </div>
    )
  }

  if (step === "success") {
    const transferText = `${formatBalance(transferAmount || "0")} ${selectedCurrency || "USD"} transferred from your ${sourceWalletData?.name} to your ${destinationWalletData?.name}`

    return (
      <>
        <div
          className="absolute inset-0 flex flex-col h-full p-6"
          style={{
            background:
              "radial-gradient(108.21% 50% at 52.05% 0%, rgba(255, 68, 79, 0.24) 0%, rgba(255, 68, 79, 0.00) 100%), #181C25",
          }}
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="mb-6">
              <Image src="/icons/success-transfer.png" alt="Success" width={256} height={256} />
            </div>
            <h1 className="text-white text-center text-2xl font-extrabold mb-4">Transfer successful</h1>
            <p className="text-white text-center text-base font-normal">{transferText}</p>
            <div className="hidden md:flex gap-4 mt-6">
              <Button
                onClick={handleViewDetails}
                className="w-[276px] h-12 px-7 flex justify-center items-center gap-2 bg-transparent border border-white rounded-3xl text-white text-base font-extrabold hover:bg-white/10"
              >
                View details
              </Button>
              <Button onClick={handleDoneClick} className="w-[276px] h-12 px-7 flex justify-center items-center gap-2">
                Got it
              </Button>
            </div>
          </div>
          <div className="block md:hidden w-full space-y-3">
            <Button
              onClick={handleDoneClick}
              className="w-full h-12 min-w-24 min-h-12 max-h-12 px-7 flex justify-center items-center gap-2"
            >
              Got it
            </Button>
            <Button
              onClick={handleViewDetails}
              className="w-full h-12 min-w-24 min-h-12 max-h-12 px-7 flex justify-center items-center gap-2 bg-transparent border border-white rounded-3xl text-white text-base font-extrabold hover:bg-white/10"
            >
              View details
            </Button>
          </div>
        </div>

        {selectedTransaction && (
          <TransactionDetails transaction={selectedTransaction} onClose={handleCloseTransactionDetails} />
        )}
      </>
    )
  }

  return null
}
