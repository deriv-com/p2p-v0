"use client"

import { useEffect } from "react"
import Image from "next/image"
import WalletDisplay from "./wallet-display"
import { fetchWalletsList } from "@/services/api/api-wallets"

interface TransferScreenProps {
  transferType: "Send" | "Receive"
  onBack: () => void
  onClose: () => void
}

const mockWallets = [
  {
    id: "usd",
    name: "USD Wallet",
    amount: "0.00",
    currency: "USD",
    icon: "/icons/usd-flag.png",
  },
]

export default function TransferScreen({ transferType, onBack, onClose }: TransferScreenProps) {
  useEffect(() => {
    const loadWallets = async () => {
      try {
        const response = await fetchWalletsList()
        console.log("[v0] Wallets API response:", response)
      } catch (error) {
        console.error("[v0] Error fetching wallets:", error)
      }
    }

    loadWallets()
  }, [])

  const handleWalletClick = (walletId: string) => {
    console.log(`Selected wallet: ${walletId} for ${transferType}`)
  }

  const title = transferType === "Send" ? "Send to" : "Receive from"

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex justify-between items-center p-4">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center" aria-label="Go back">
          <Image src="/icons/back-circle.png" alt="Back" width={32} height={32} />
        </button>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center" aria-label="Close">
          <Image src="/icons/close-circle.png" alt="Close" width={32} height={32} />
        </button>
      </div>

      <div className="ml-6 mt-6">
        <h1 className="text-2xl font-black" style={{ color: "#00080A" }}>
          {title}
        </h1>
      </div>

      <div className="ml-6 mt-6">
        <h2 className="text-black/[0.96] text-base font-normal">Wallet</h2>
      </div>

      <div className="mt-2 px-4 space-y-2">
        {mockWallets.map((wallet) => (
          <WalletDisplay
            key={wallet.id}
            name={wallet.name}
            amount={wallet.amount}
            currency={wallet.currency}
            icon={wallet.icon}
            onClick={() => handleWalletClick(wallet.id)}
          />
        ))}
      </div>
    </div>
  )
}
