"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchWalletsList, walletTransfer, getCurrencies } from "@/services/api/api-wallets"
import { currencyLogoMapper } from "@/lib/utils"

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
}

type TransferStep = "chooseCurrency" | "enterAmount" | "confirm" | "success"
type TransferType = "Send" | "Receive" | null

export default function Transfer({ onClose }: TransferProps) {
  const [step, setStep] = useState<TransferStep>("chooseCurrency")
  const [transferType, setTransferType] = useState<TransferType>(null)
  const [wallets, setWallets] = useState<ProcessedWallet[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)

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
            setSourceWalletData({ id: p2pWallet.id, name: p2pWallet.name })
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
    setTransferType(null)
    onClose()
  }

  const handleCurrencySelect = () => {
    setTransferType("Send")
    toEnterAmount()
  }

  const handleFromWalletSelect = (wallet: ProcessedWallet) => {
    setSourceWalletData({ id: wallet.id, name: wallet.name })
    setShowFromDropdown(false)
  }

  const handleToWalletSelect = (wallet: ProcessedWallet) => {
    setDestinationWalletData({ id: wallet.id, name: wallet.name })
    setShowToDropdown(false)
  }

  const handleInterchange = () => {
    const tempSource = sourceWalletData
    setSourceWalletData(destinationWalletData)
    setDestinationWalletData(tempSource)
  }

  const getSourceWalletAmount = () => {
    const wallet = wallets.find((w) => w.id === sourceWalletData?.id)
    return wallet ? `${wallet.amount} ${wallet.currency}` : ""
  }

  const getDestinationWalletAmount = () => {
    const wallet = wallets.find((w) => w.id === destinationWalletData?.id)
    return wallet ? `${wallet.amount} ${wallet.currency}` : ""
  }

  if (step === "chooseCurrency") {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" size="sm" className="px-0" onClick={goBack} aria-label="Go back">
            <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
          </Button>
          <Button variant="ghost" size="sm" className="px-0" onClick={onClose} aria-label="Close">
            <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} height={32} />
          </Button>
        </div>

        <div className="px-6">
          <h1 className="text-[#181C25] text-xl font-extrabold mt-10 mb-2">Transfer</h1>

          <p className="text-black/72 text-base font-normal mb-6">Choose which currency you would like to transfer.</p>

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
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span className="text-[#181C25] text-base font-normal">{currency.name}</span>
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
          <h1 className="text-[#181C25] text-xl font-extrabold mt-10 mb-6 px-6">Transfer</h1>

          <div className="relative mb-6 px-6">
            <div
              className="p-4 px-6 flex items-center gap-4 rounded-2xl bg-grayscale-500 cursor-pointer h-[100px]"
              onClick={() => setShowFromDropdown(!showFromDropdown)}
            >
              <div className="flex-1">
                <div className="text-black/48 text-base font-normal mb-1">From</div>
                <div className="text-[#181C25] text-base font-bold">{sourceWalletData?.name || "Select wallet"}</div>
                <div className="text-black/72 text-sm font-normal">{getSourceWalletAmount()}</div>
              </div>
              <Image src="/icons/chevron-down.png" alt="Dropdown" width={16} height={16} />
            </div>

            <div className="h-2"></div>

            <div
              className="p-4 px-6 flex items-center gap-4 rounded-2xl bg-grayscale-500 cursor-pointer h-[100px]"
              onClick={() => setShowToDropdown(!showToDropdown)}
            >
              <div className="flex-1">
                <div className="text-black/48 text-base font-normal mb-1">To</div>
                <div className="text-[#181C25] text-base font-bold">{destinationWalletData?.name || "Select"}</div>
                {destinationWalletData && (
                  <div className="text-black/72 text-sm font-normal">{getDestinationWalletAmount()}</div>
                )}
              </div>
              <Image src="/icons/chevron-down.png" alt="Dropdown" width={16} height={16} />
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

            {showFromDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleFromWalletSelect(wallet)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <Image src={wallet.icon || "/placeholder.svg"} alt={wallet.name} width={32} height={32} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[#181C25] text-base font-bold">{wallet.name}</div>
                        <div className="text-black/72 text-sm">
                          {wallet.amount} {wallet.currency}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showToDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleToWalletSelect(wallet)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <Image src={wallet.icon || "/placeholder.svg"} alt={wallet.name} width={32} height={32} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[#181C25] text-base font-bold">{wallet.name}</div>
                        <div className="text-black/72 text-sm">
                          {wallet.amount} {wallet.currency}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6 px-6">
            <h2 className="text-[#181C25] text-xl font-extrabold mb-4">Amount</h2>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                value={transferAmount || ""}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="h-12 px-4 border border-black/8 rounded-sm text-base"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">USD</span>
            </div>
          </div>

          <div className="flex-1"></div>

          <div className="mt-auto pb-6 px-6">
            <Button
              onClick={handleTransferClick}
              disabled={!transferAmount || transferAmount.trim() === "" || !sourceWalletData || !destinationWalletData}
              className="w-full h-12 min-w-24 min-h-12 max-h-12 px-7 flex justify-center items-center gap-2"
            >
              Transfer
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === "confirm") {
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

        <h1 className="text-2xl font-black text-black mb-6">Confirm the transfer</h1>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-normal text-black/48">From</span>
            <span className="text-base font-normal text-black/96">{sourceWalletData?.name}</span>
          </div>

          <div className="h-px bg-gray-200 mb-6"></div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-normal text-black/48">To</span>
            <span className="text-base font-normal text-black/96">{destinationWalletData?.name}</span>
          </div>

          <div className="h-px bg-gray-200 mb-6"></div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-normal text-black/48">
              {transferType === "Send" ? "You're transferring" : "You'll receive"}
            </span>
            <span className="text-base font-normal text-black/96">{transferAmount} USD</span>
          </div>

          <div className="h-px bg-gray-200 mb-6"></div>
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
    const transferText = `${transferAmount} USD transferred to your ${destinationWalletData?.name}.`

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

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="mb-6">
            <Image src="/icons/success.png" alt="Success" width={64} height={64} />
          </div>

          <h1 className="text-[#00080A] text-center text-xl font-bold mb-4">Transfer successful</h1>

          <p className="text-black/72 text-center text-base font-normal">{transferText}</p>
        </div>

        <div className="w-full">
          <Button
            onClick={handleDoneClick}
            className="w-full h-12 min-w-24 min-h-12 max-h-12 px-7 flex justify-center items-center gap-2"
          >
            Done
          </Button>
        </div>
      </div>
    )
  }

  return null
}
