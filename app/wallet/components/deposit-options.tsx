"use client"

import type React from "react"
import { ArrowLeftRight, Building2, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface DepositOptionProps {
  onClose: () => void
  onDirectDepositClick: () => void
  operation?: "DEPOSIT" | "WITHDRAW"
}

export default function DepositOptions({ onClose, onDirectDepositClick, operation = "DEPOSIT" }: DepositOptionProps) {
  const router = useRouter()

  const handleDirectDepositClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    onDirectDepositClick()
  }

  const handleP2PTradingClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    router.push("/")
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-black mb-4">Choose currency</h2>
        <div className="flex items-center justify-between p-4 rounded-xl bg-accent border border-border cursor-pointer hover:bg-accent/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img src="https://flagcdn.com/w40/us.png" alt="US Flag" className="w-full h-full object-cover" />
            </div>
            <span className="text-base font-medium text-black">US dollar (USD)</span>
          </div>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-black">Deposit with</h2>
      </div>

      <div className="space-y-3">
        <div
          className={cn(
            "flex min-h-[56px] p-4 justify-center items-center gap-4 self-stretch",
            "rounded-xl bg-accent cursor-pointer hover:bg-accent/80",
          )}
          onClick={handleP2PTradingClick}
        >
          <div className="flex-shrink-0 w-12 h-12 bg-background rounded-full flex items-center justify-center">
            <ArrowLeftRight className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-black leading-6 mb-1">
              {operation === "DEPOSIT" ? "P2P Trading" : "Marketplace"}
            </h3>
            <p className="text-muted-foreground text-sm font-normal leading-[22px]">
              {operation === "DEPOSIT"
                ? "Buy USD directly from other users on the P2P marketplace."
                : "Trade USD directly with other users on the marketplace."}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex min-h-[56px] p-4 justify-center items-center gap-4 self-stretch",
            "rounded-xl bg-accent cursor-pointer hover:bg-accent/80",
          )}
          onClick={handleDirectDepositClick}
        >
          <div className="flex-shrink-0 w-12 h-12 bg-background rounded-full flex items-center justify-center">
            <Building2 className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-black leading-6 mb-1">
              {operation === "DEPOSIT" ? "Direct deposit" : "Direct withdrawal"}
            </h3>
            <p className="text-muted-foreground text-sm font-normal leading-[22px]">
              {operation === "DEPOSIT"
                ? "Deposit funds directly from your bank account, e-wallet, or other payment methods."
                : "Withdraw funds directly to your bank account, e-wallet, or other payment methods."}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
