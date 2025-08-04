"use client"

import WalletBalance from "./components/wallet-balance"
import { useIsMobile } from "@/hooks/use-mobile"
import Navigation from "@/components/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WalletPage() {
  const isMobile = useIsMobile()
  return (
    <>
      {isMobile && <Navigation isBackBtnVisible={true} redirectUrl="/" title="P2P" />}
      <div className="min-h-screen bg-background px-[24px]">
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="assets" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="assets" className="w-full data-[state=active]:font-bold">
                My Assets
              </TabsTrigger>
              <TabsTrigger value="transactions" className="w-full data-[state=active]:font-bold">
                Transactions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assets" className="mt-0">
              <WalletBalance />
            </TabsContent>

            <TabsContent value="transactions" className="mt-0">
              <div className="text-center py-8 text-muted-foreground">
                
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
