"use client"

import type React from "react"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
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
}

type TransferStep = "chooseType" | "selectWallet" | "enterAmount" | "confirm"
type TransferType = "Send" | "Receive" | null

export default function Transfer({ currencies }: TransferProps) {
  const [step, setStep] = useState<TransferStep>("chooseType")
  const [transferType, setTransferType] = useState<TransferType>(null)
  const [selectedCurrency, setSelectedCurrency] = useState("USD")
  const [wallets, setWallets] = useState<ProcessedWallet[]>([])
  const [selectedWallet, setSelectedWallet] = useState<ProcessedWallet | null>(null)

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
                  name: `${balance.currency} Wallet`,
                  amount: balance.balance,
                  currency: balance.currency,
                  icon: "/icons/usd-flag.png",
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
    setSelectedWallet(wallet)
    toEnterAmount()
  }

  const handleTransferClick = () => {
    toConfirm()
  }

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
            onClick={ setTransferType("Send"), }
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
            onClick={ setTransferType("Send"),}
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

    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="flex justify-between items-center p-4">
          <Button variant="ghost" size="sm" onClick={goBack} aria-label="Go back">
            <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStep("chooseType")} aria-label="Close">
            <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} height={32} />
          </Button>
        </div>

        <div className="ml-6 mt-6">
          <h1 className="text-2xl font-black text-[#00080A]">{title}</h1>
        </div>

        <div className="ml-6 mt-6">
          <h2 className="text-black/[0.96] text-base font-normal">Wallet</h2>
        </div>

        <div className="mt-2 px-6 space-y-2">
          {wallets.map((wallet) => (
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
      </div>
    )
  }

  if (step === "enterAmount") {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="flex justify-between items-center p-4">
          <Button variant="ghost" size="sm" onClick={goBack} aria-label="Go back">
            <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStep("chooseType")} aria-label="Close">
            <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} height={32} />
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center h-full px-6">
          <h1 className="text-2xl font-black text-[#00080A] mb-4">Enter transfer amount (TBD)</h1>
          <p className="text-gray-600 mb-8">Selected wallet: {selectedWallet?.name}</p>

          <div className="fixed bottom-6 left-6 right-6">
            <Button
              onClick={handleTransferClick}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
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
      <div className="fixed inset-0 z-50 bg-white">
        <div className="flex justify-between items-center p-4">
          <Button variant="ghost" size="sm" onClick={goBack} aria-label="Go back">
            <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStep("chooseType")} aria-label="Close">
            <Image src="/icons/close-circle-secondary.png" alt="Close" width={32} height={32} />
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center h-full px-6">
          <h1 className="text-2xl font-black text-[#00080A] mb-4">Confirm transfer (TBD)</h1>
          <p className="text-gray-600">Transfer type: {transferType}</p>
          <p className="text-gray-600">Wallet: {selectedWallet?.name}</p>
        </div>
      </div>
    )
  }

  return null
}
