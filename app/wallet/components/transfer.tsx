"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchWalletsList, walletTransfer, getCurrencies } from "@/services/api/api-wallets"
import { currencyLogoMapper } from "@/lib/utils"
import WalletDisplay from "./wallet-display"

interface TransferProps {
  onClose: () => void
}

interface Currency {
  code: string
  name: string
  logo: string
}

interface ProcessedWallet {
  id: string
  name: string
  amount: string
  currency: string
  icon: string
  type: string
}

interface WalletData {
  id: string
  name: string
  currency: string
}

type TransferStep = "chooseCurrency" | "enterAmount" | "confirm" | "success"
type WalletSelectorType = "from" | "to" | null

export default function Transfer({ onClose }: TransferProps) {
  const [step, setStep] = useState<TransferStep>("chooseCurrency")
  const [wallets, setWallets] = useState<ProcessedWallet[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [showDropdown, setShowDropdown] = useState<WalletSelectorType>(null)
  const [showMobileSheet, setShowMobileSheet] = useState<WalletSelectorType>(null)

  const [transferAmount, setTransferAmount] = useState<string | null>(null)
  const [sourceWalletData, setSourceWalletData] = useState<WalletData | null>(null)
  const [destinationWalletData, setDestinationWalletData] = useState<WalletData | null>(null)

  const toEnterAmount = () => setStep("enterAmount")
  const toConfirm = () => setStep("confirm")
  const toSuccess = () => setStep("success")
  const goBack = () => {
    if (step === "enterAmount") setStep("chooseCurrency")
    else if (step === "confirm") setStep("enterAmount")
    else if (step === "chooseCurrency") onClose()
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

    const loadWallets = async () => {
      try {
        const response = await fetchWalletsList()

        if (response?.data?.wallets) {
          const processedWallets: ProcessedWallet[] = []

          response.data.wallets.forEach((wallet: any) => {
            wallet.balances.forEach((balance: any) => {
              processedWallets.push({
                id: wallet.wallet_id,
                name: (wallet.type || "").toLowerCase() === "p2p" ? "P2P Wallet" : `${balance.currency} Wallet`,
                amount: balance.balance,
                currency: balance.currency,
                icon: "/icons/usd-flag.png",
                type: wallet.type,
              })
            })
          })

          setWallets(processedWallets)

          const p2pWallet = processedWallets.find((w) => w.type?.toLowerCase() === "p2p")
          if (p2pWallet) {
            setSourceWalletData({ id: p2pWallet.id, name: p2pWallet.name, currency: p2pWallet.currency })
          }
        }
      } catch (error) {
        console.error("Error fetching wallets:", error)
      }
    }

    loadCurrencies()
    loadWallets()
  }, [])

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
        net_amount: transferAmount,
        currency: "USD",
        destination_wallet_id: destinationWalletData.id,
        request_id: requestId,
        source_wallet_id: sourceWalletData.id,
      }

      const result = await walletTransfer(transferParams)

      if (result?.data?.message === "Transaction completed successfully.") {
        console.log("Transfer successful:", result)
        toSuccess()
      } else {
        console.error("Transfer failed")
      }
    } catch (error) {
      console.error("Error during transfer:", error)
    }
  }

  const handleDoneClick = () => {
    setStep("chooseCurrency")
    setTransferAmount(null)
    setSourceWalletData(null)
    setDestinationWalletData(null)

    onClose()
  }

  const handleCurrencySelect = () => {
    toEnterAmount()
  }

  const handleWalletSelect = (wallet: ProcessedWallet, type: WalletSelectorType) => {
    if (type === "from") {
      setSourceWalletData({ id: wallet.id, name: wallet.name, currency: wallet.currency })
    } else if (type === "to") {
      setDestinationWalletData({ id: wallet.id, name: wallet.name, currency: wallet.currency })
    }
    setShowDropdown(null)
    setShowMobileSheet(null)
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
    const wallet = wallets.find((w) => w.id === sourceWalletData?.id)
    return wallet ? Number.parseFloat(wallet.amount) : 0
  }

  const isAmountValid = (amount: string): boolean => {
    const numAmount = Number.parseFloat(amount)
    const sourceBalance = getSourceWalletBalance()
    return !isNaN(numAmount) && numAmount > 0 && numAmount <= sourceBalance
  }

  const getSourceWalletAmount = () => {
    const wallet = wallets.find((w) => w.id === sourceWalletData?.id)
    return wallet ? `${formatBalance(wallet.amount)} ${wallet.currency}` : ""
  }

  const getDestinationWalletAmount = () => {
    const wallet = wallets.find((w) => w.id === destinationWalletData?.id)
    return wallet ? `${formatBalance(wallet.amount)} ${wallet.currency}` : ""
  }

  const getFilteredWallets = (type: WalletSelectorType) => {
    if (type === "from" && destinationWalletData) {
      const destinationWallet = wallets.find((w) => w.id === destinationWalletData.id)
      if (destinationWallet?.type?.toLowerCase() === "p2p") {
        return wallets.filter((w) => w.type?.toLowerCase() !== "p2p")
      } else {
        return wallets.filter((w) => w.type?.toLowerCase() === "p2p")
      }
    }

    if (type === "to" && sourceWalletData) {
      const sourceWallet = wallets.find((w) => w.id === sourceWalletData.id)
      if (sourceWallet?.type?.toLowerCase() === "p2p") {
        return wallets.filter((w) => w.type?.toLowerCase() !== "p2p")
      } else {
        return wallets.filter((w) => w.type?.toLowerCase() === "p2p")
      }
    }

    return wallets
  }

  const renderDropdown = (type: WalletSelectorType) => {
    if (showDropdown !== type) return null

    return (
      <div className="hidden md:block absolute top-full left-2 right-2 mt-2 bg-white rounded-lg shadow-[0_16px_24px_4px_rgba(0,0,0,0.04),0_16px_24px_4px_rgba(0,0,0,0.02)] z-20 max-h-60 overflow-y-auto border border-grayscale-border-light">
        {getFilteredWallets(type).map((wallet) => (
          <div
            key={wallet.id}
            className="p-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => handleWalletSelect(wallet, type)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image src={wallet.icon || "/placeholder.svg"} alt={wallet.name} width={32} height={32} />
              </div>
              <div className="flex-1">
                <div className="text-grayscale-text-secondary text-base font-normal">{wallet.name}</div>
                <div className="text-grayscale-text-muted text-sm font-normal">
                  {formatBalance(wallet.amount)} {wallet.currency}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderMobileSheet = (type: WalletSelectorType) => {
    if (showMobileSheet !== type) return null

    const title = type === "from" ? "From" : "To"
    const selectedWalletId = type === "from" ? sourceWalletData?.id : destinationWalletData?.id

    return (
      <div className="fixed inset-0 bg-black/50 z-50 md:hidden">
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-hidden">
          <div className="p-6">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <h2 className="text-grayscale-text-primary text-xl font-extrabold mb-6 text-center">{title}</h2>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {getFilteredWallets(type).map((wallet) => (
                <div
                  key={wallet.id}
                  className="cursor-pointer"
                  onClick={() => {
                    handleWalletSelect(wallet, type)
                    setShowMobileSheet(null)
                  }}
                >
                  <WalletDisplay
                    name={wallet.name}
                    amount={formatBalance(wallet.amount)}
                    currency={wallet.currency}
                    icon={wallet.icon}
                    isSelected={selectedWalletId === wallet.id}
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

  const getCurrencyImage = (walletName: string, currency: string) => {
    if (walletName === "P2P Wallet") {
      return "/icons/p2p-logo.png"
    }
    return currencyLogoMapper[currency as keyof typeof currencyLogoMapper] || "/placeholder.svg"
  }

  if (step === "chooseCurrency") {
    return (
      <>
        <div className="flex justify-end items-center mb-6">
          <Button variant="ghost" size="sm" className="px-0" onClick={onClose} aria-label="Close">
            <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} height={32} />
          </Button>
        </div>
        <div className="px-2">
          <h1 className="text-grayscale-text-primary text-xl font-extrabold mb-2">Transfer</h1>

          <p className="text-grayscale-text-secondary text-base font-normal mb-6">
            Choose which currency you would like to transfer.
          </p>

          <div className="space-y-0">
            {currencies.map((currency, index) => (
              <div key={currency.code}>
                <div
                  className="flex items-center justify-between h-[72px] cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleCurrencySelect()}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
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
                    <span className="text-grayscale-text-primary text-base font-normal">{currency.name}</span>
                  </div>
                </div>
                {index < currencies.length - 1 && <div className="h-px bg-gray-200"></div>}
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  if (step === "enterAmount") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" className="px-0" onClick={goBack} aria-label="Go back">
            <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
          </Button>
          <Button variant="ghost" size="sm" className="px-0" onClick={onClose} aria-label="Close">
            <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} height={32} />
          </Button>
        </div>

        <div className="flex-1 flex flex-col">
          <h1 className="text-grayscale-text-primary text-xl font-extrabold mt-6 mb-6 px-2">Transfer</h1>

          <div className="relative mb-6 px-2">
            <div
              className="bg-grayscale-bg-card p-4 px-6 flex items-center gap-4 rounded-2xl cursor-pointer h-[100px]"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setShowMobileSheet("from")
                } else {
                  setShowDropdown(showDropdown === "from" ? null : "from")
                }
              }}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="text-grayscale-text-muted text-base font-normal">From</div>
                {sourceWalletData && (
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0  mb-2 mt-2">
                    <Image
                      src={getCurrencyImage(sourceWalletData.name, sourceWalletData.currency) || "/placeholder.svg"}
                      alt={sourceWalletData.currency}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 mt-6">
                <div className="text-grayscale-text-primary text-base font-bold">
                  {sourceWalletData?.name || "Select wallet"}
                </div>
                <div className="text-grayscale-text-secondary text-sm font-normal">{getSourceWalletAmount()}</div>
              </div>
              <Image src="/icons/chevron-down.png" alt="Dropdown" width={24} height={24} />
            </div>

            <div className="h-2"></div>

            <div
              className="bg-grayscale-bg-card p-4 px-6 flex items-center gap-4 rounded-2xl cursor-pointer h-[100px]"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setShowMobileSheet("to")
                } else {
                  setShowDropdown(showDropdown === "to" ? null : "to")
                }
              }}
            >
              <div className="flex flex-col items-start gap-1">
                <div className="text-grayscale-text-muted text-base font-normal">To</div>
                {destinationWalletData && (
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0  mb-2 mt-2">
                    <Image
                      src={
                        getCurrencyImage(destinationWalletData.name, destinationWalletData.currency) ||
                        "/placeholder.svg"
                      }
                      alt={destinationWalletData.currency}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="flex-1 mt-6">
                <div className="text-grayscale-text-primary text-base font-bold">
                  {destinationWalletData?.name || (
                    <span className="text-grayscale-text-placeholder text-base font-normal">Select</span>
                  )}
                </div>
                {destinationWalletData && (
                  <div className="text-grayscale-text-secondary text-sm font-normal">
                    {getDestinationWalletAmount()}
                  </div>
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

            {renderDropdown("from")}
            {renderDropdown("to")}
          </div>

          <div className="mb-6 px-2">
            <h2 className="text-grayscale-text-primary text-base font-normal mb-2">Amount</h2>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={transferAmount || ""}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="h-12 px-4 border border-gray-200 rounded-lg text-base appearance-none"
                max={getSourceWalletBalance()}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">USD</span>
            </div>
            {transferAmount && !isAmountValid(transferAmount) && (
              <p className="text-red-500 text-sm mt-1">
                Amount cannot exceed available balance ({formatBalance(getSourceWalletBalance().toString())} USD)
              </p>
            )}
          </div>

          <div className="flex-1"></div>

          <div className="mt-auto ">
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
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-10">
          <Button variant="ghost" size="sm" className="px-0" onClick={goBack} aria-label="Go back">
            <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
          </Button>
          <Button variant="ghost" size="sm" className="px-0" onClick={onClose} aria-label="Close">
            <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} height={32} />
          </Button>
        </div>

        <h1 className="text-2xl font-black text-black mb-10">Confirm transfer</h1>

        <div className="mb-6">
          <div className="mb-4">
            <span className="block text-base font-normal text-gray-400">From</span>
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
              <span className="block text-base font-normal text-slate-800">{sourceWalletData?.name}</span>
            </div>
          </div>
          <div className="h-px bg-gray-200 mb-4"></div>

          <div className="mb-4">
            <span className="block text-base font-normal text-gray-400">To</span>
            <div className="flex items-center gap-3">
              {destinationWalletData && (
                <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={
                      getCurrencyImage(destinationWalletData.name, destinationWalletData.currency) || "/placeholder.svg"
                    }
                    alt={destinationWalletData.currency}
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <span className="block text-base font-normal text-slate-800">{destinationWalletData?.name}</span>
            </div>
          </div>
          <div className="h-px bg-gray-200 mb-4"></div>

          <div className="mb-4">
            <span className="block text-base font-normal text-gray-400">Amount</span>
            <span className="block text-base font-normal text-slate-800">
              {formatBalance(transferAmount || "0")} USD
            </span>
          </div>
          <div className="h-px bg-gray-200 mb-4"></div>
        </div>

        <div className="flex-1"></div>

        <div className="mt-auto">
          <Button
            onClick={handleConfirmTransfer}
            className="w-full h-12 min-w-24 min-h-12 max-h-12 px-7 flex justify-center items-center gap-2"
          >
            Confirm
          </Button>
        </div>
      </div>
    )
  }

  if (step === "success") {
    const transferText = `${formatBalance(transferAmount || "0")} USD transferred from your ${sourceWalletData?.name} to your ${destinationWalletData?.name}`

    return (
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

          <h1 className="text-white text-center text-xl font-bold mb-4">Transfer successful</h1>

          <p className="text-white text-center text-base font-normal">{transferText}</p>

          <div className="hidden md:block mt-6">
            <Button onClick={handleDoneClick} className="w-[276px] h-12 px-7 flex justify-center items-center gap-2">
              Got it
            </Button>
          </div>
        </div>

        <div className="block md:hidden w-full">
          <Button
            onClick={handleDoneClick}
            className="w-full h-12 min-w-24 min-h-12 max-h-12 px-7 flex justify-center items-center gap-2"
          >
            Got it
          </Button>
        </div>
      </div>
    )
  }

  return null
}
