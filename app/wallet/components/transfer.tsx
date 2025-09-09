"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import WalletDisplay from "./wallet-display"
import { fetchWalletsList } from "@/services/api/api-wallets"

interface TransferProps {
  currencies: Currency[]
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

type TransferStep = "chooseType" | "selectWallet" | "enterAmount" | "confirm"
type TransferType = "Send" | "Receive" | null

export default function Transfer({ currencies }: TransferProps) {
  const [step, setStep] = useState<TransferStep>("chooseType")
  const [transferType, setTransferType] = useState<TransferType>(null)
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [wallets, setWallets] = useState<ProcessedWallet[]>([])

  const [transferAmount, setTransferAmount] = useState<string | null>(null)
  const [sourceWalletData, setSourceWalletData] = useState<WalletData | null>(null)
  const [destinationWalletData, setDestinationWalletData] = useState<WalletData | null>(null)

  const selectedCurrencyData = currencies.find((c) => c.code === selectedCurrency) || currencies[0]

  const toSelectWallet = () => setStep("selectWallet")
  const toEnterAmount = () => setStep("enterAmount")
  const toConfirm = () => setStep("confirm")
  const goBack = () => {
    if (step === "selectWallet") setStep("chooseType")
    else if (step === "enterAmount") setStep("selectWallet")
    else if (step === "confirm") setStep("enterAmount")
  }

  useEffect(() => {
    if (step === "selectWallet") {
      const loadWallets = async () => {
        try {
          const response = await fetchWalletsList()

          if (response?.data?.wallets) {
            const processedWallets: ProcessedWallet[] = []

            response.data.wallets.forEach((wallet: any) => {
              wallet.balances.forEach((balance: any) => {
                processedWallets.push({
                  id: `${wallet.wallet_id}-${balance.currency}`,
                  name: (wallet.type || "").toLowerCase() === "p2p" ? "P2P Wallet" : `${balance.currency} Wallet`,
                  amount: balance.balance,
                  currency: balance.currency,
                  icon: "/icons/usd-flag.png",
                  type: wallet.type,
                })
              })
            })

            setWallets(processedWallets)
          }
        } catch (error) {
          console.error("Error fetching wallets:", error)
        }
      }

      loadWallets()
    }
  }, [step])

  const handleSendClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setTransferType("Send")
    toSelectWallet()
  }

  const handleReceiveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setTransferType("Receive")
    toSelectWallet()
  }

  const handleWalletClick = (wallet: ProcessedWallet) => {
    const p2pWallet = wallets.find((w) => w.type?.toLowerCase() === "p2p")

    if (transferType === "Send") {
      // Selected wallet becomes destination, p2p wallet becomes source
      setDestinationWalletData({ id: wallet.id, name: wallet.name })
      if (p2pWallet) {
        setSourceWalletData({ id: p2pWallet.id, name: p2pWallet.name })
      }
    } else if (transferType === "Receive") {
      // Selected wallet becomes source, p2p wallet becomes destination
      setSourceWalletData({ id: wallet.id, name: wallet.name })
      if (p2pWallet) {
        setDestinationWalletData({ id: p2pWallet.id, name: p2pWallet.name })
      }
    }

    toEnterAmount()
  }

  const handleTransferClick = () => {
    toConfirm()
  }

  const getFilteredWallets = () => wallets.filter((wallet) => (wallet.type ?? "").toLowerCase() !== "p2p")

  if (step === "chooseType") {
    return (
      <>
        <div>
          <h2 className="text-base font-bold mb-2">Choose currency</h2>
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

        <h2 className="text-black text-base font-bold m-0">Choose transfer type</h2>

        <div className="space-y-2">
          <div
            className="flex items-center gap-4 cursor-pointer bg-slate-75 rounded-2xl min-h-[56px] p-4 w-full transition-colors hover:bg-gray-200"
            onClick={handleSendClick}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Image src="/icons/arrow-up.png" alt="Send" width={23} height={22} />
            </div>
            <div>
              <h3 className="text-black text-base font-bold">Send</h3>
            </div>
          </div>

          <div
            className="flex items-center gap-4 cursor-pointer bg-slate-75 rounded-2xl min-h-[56px] p-4 w-full transition-colors hover:bg-gray-200"
            onClick={handleReceiveClick}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Image src="/icons/arrow-down.png" alt="Receive" width={23} height={22} />
            </div>
            <div>
              <h3 className="text-black text-base font-bold">Receive</h3>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (step === "selectWallet") {
    const title = transferType === "Send" ? "Send to" : "Receive from"
    const filteredWallets = getFilteredWallets()

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="sm" className="px-0" onClick={goBack} aria-label="Go back">
            <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
          </Button>
          <Button variant="ghost" size="sm" className="px-0" onClick={() => setStep("chooseType")} aria-label="Close">
            <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} height={32} />
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-black text-[#00080A]">{title}</h1>
        </div>

        <div className="mb-4">
          <h2 className="text-black/[0.96] text-base font-normal">Wallet</h2>
        </div>

        <div className="space-y-2">
          {filteredWallets.map((wallet) => (
            <WalletDisplay
              key={wallet.id}
              name={wallet.name}
              amount={wallet.amount}
              currency={wallet.currency}
              icon={wallet.icon}
              onClick={() => handleWalletClick(wallet)}
            />
          ))}
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
          <Button variant="ghost" size="sm" className="px-0" onClick={() => setStep("chooseType")} aria-label="Close">
            <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} height={32} />
          </Button>
        </div>

        <h1 className="text-2xl font-black text-black mb-6">Amount</h1>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-normal text-black/48">From</span>
            <span className="text-base font-normal text-black/96">{sourceWalletData?.name}</span>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-normal text-black/48">To</span>
            <span className="text-base font-normal text-black/96">{destinationWalletData?.name}</span>
          </div>

          <div className="h-px bg-gray-200 mb-6"></div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Input
              type="number"
              placeholder="Amount"
              value={transferAmount || ""}
              onChange={(e) => setTransferAmount(e.target.value)}
              className="h-12 px-4 border border-black/8 rounded-sm text-base"
            />
            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">USD</span>
          </div>
        </div>

        <div className="flex-1"></div>
        <div className="mt-auto">
          <Button
            onClick={handleTransferClick}
            disabled={!transferAmount || transferAmount.trim() === ""}
            className="w-full h-12 min-w-24 min-h-12 max-h-12 px-7 flex justify-center items-center gap-2"
          >
            Transfer
          </Button>
        </div>
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" size="sm" onClick={goBack} aria-label="Go back">
            <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStep("chooseType")} aria-label="Close">
            <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} height={32} />
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center flex-1">
          <h1 className="text-2xl font-black text-[#00080A] mb-4 text-center">Confirm transfer (TBD)</h1>
          <p className="text-gray-600 text-center">Transfer type: {transferType}</p>
          <p className="text-gray-600 text-center">From: {sourceWalletData?.name}</p>
          <p className="text-gray-600 text-center">To: {destinationWalletData?.name}</p>
        </div>
      </>
    )
  }

  return null
}
