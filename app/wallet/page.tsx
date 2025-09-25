"use client"

import WalletBalance from "./components/wallet-balance"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionsTab } from "./components"

export default function WalletPage() {
  return (
    <>
      <div className="min-h-screen bg-background px-[24px] pt-3 md:pt-0">
        <Tabs defaultValue="assets" className="w-full flex flex-col justify-center items-center">
          <TabsList className="w-full md:w-[330px] md:min-w-[330px]">
            <TabsTrigger value="assets" className="w-full data-[state=active]:font-bold">
              My Wallet
            </TabsTrigger>
            <TabsTrigger value="transactions" className="w-full data-[state=active]:font-bold">
              Transactions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="w-full mt-0">
            <WalletBalance />
          </TabsContent>

          <TabsContent value="transactions" className="w-full mt-0">
            <TransactionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
