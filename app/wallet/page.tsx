"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import Navigation from "@/components/navigation"
import { TransactionsTab } from "./components"
import WalletSummary from "./components/wallet-summary"

export default function WalletPage() {
  const isMobile = useIsMobile()

  return (
    <>
      {isMobile && <Navigation isBackBtnVisible={true} redirectUrl="/" title="P2P" showNotificationIcon={true} />}
      <div className="min-h-screen bg-background px-[24px]">
        <div className="w-full flex flex-col items-center">
          {/* Wallet Summary Component */}
          <div className="w-full max-w-[560px] mt-6">
            <WalletSummary />
          </div>

          {/* Transactions Section */}
          <div className="w-full max-w-[560px] mt-8">
            <h2 className="text-lg font-semibold mb-4">Transactions</h2>
            <TransactionsTab />
          </div>
        </div>
      </div>
    </>
  )
}
