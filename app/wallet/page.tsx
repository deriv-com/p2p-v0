"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import Navigation from "@/components/navigation"
import { TransactionsTab } from "./components"
import WalletSummary from "./components/wallet-summary"

export default function WalletPage() {
  const isMobile = useIsMobile()

  return (
    <
      <div className="min-h-screen bg-background px-0 md:pl-[16px]">
        <div className="w-full flex flex-col items-center">
          
          <div className="w-full mt-0 md:mt-6">
            <WalletSummary />
          </div>

        
          <div className="w-full mt-8 px-[24px] md:px-0">
            <h2 className="text-lg font-semibold mb-4">Transactions</h2>
            <TransactionsTab />
          </div>
        </div>
      </div>
    </>
  )
}
