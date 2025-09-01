"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import WalletDisplay from "./wallet-display"
import { fetchWalletsList } from "@/services/api/api-wallets"
import { Button } from "@/components/ui/button"

interface TransferScreenProps {
  transferType: "Send" | "Receive"
  onBack: () => void
  onClose: () => void
}

interface ProcessedWallet {
  id: string
  name: string
  amount: string
  currency: string
  icon: string
}

export default function TransferScreen({ transferType, onBack, onClose }: TransferScreenProps) {
  const [wallets, setWallets] = useState<ProcessedWallet[]>([])

  useEffect(() => {
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
  }, [])

  const handleWalletClick = () => {}

  const title = transferType === "Send" ? "Send to" : "Receive from"

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex justify-between items-center p-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="w-8 h-8" aria-label="Go back">
          <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose} className="w-8 h-8" aria-label="Close">
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
            onClick={() => handleWalletClick()}
          />
        ))}
      </div>
    </div>
  )
}
