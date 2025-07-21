"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import StatsGrid from "./stats-grid"
import PaymentMethodsTab from "./payment-methods-tab"
import MobileStatsPage from "./mobile-stats-page"
import MobilePaymentMethodsPage from "./mobile-payment-methods-page"

type MobileView = "list" | "stats" | "payment"

export default function StatsTabs() {
  const isMobile = useIsMobile()
  const [mobileView, setMobileView] = useState<MobileView>("list")

  // Mobile view rendering
  if (isMobile) {
    if (mobileView === "stats") {
      return <MobileStatsPage onBack={() => setMobileView("list")} />
    }

    if (mobileView === "payment") {
      return <MobilePaymentMethodsPage onBack={() => setMobileView("list")} />
    }

    // Mobile list view
    return (
      <div className="space-y-1">
        <button
          onClick={() => setMobileView("stats")}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="text-base font-medium text-gray-900">Stats</span>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>

        <button
          onClick={() => setMobileView("payment")}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="text-base font-medium text-gray-900">Payment methods</span>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </button>
      </div>
    )
  }

  // Desktop view (unchanged)
  return (
    <Tabs defaultValue="stats" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="payment">Payment methods</TabsTrigger>
        <TabsTrigger value="advertiser">Advertiser's instruction</TabsTrigger>
        <TabsTrigger value="counterparties">Counterparties</TabsTrigger>
      </TabsList>

      <TabsContent value="stats" className="space-y-4">
        <StatsGrid />
      </TabsContent>

      <TabsContent value="payment" className="space-y-4">
        <PaymentMethodsTab />
      </TabsContent>

      <TabsContent value="advertiser" className="space-y-4">
        <div className="text-center py-8 text-gray-500">Advertiser's instruction content coming soon...</div>
      </TabsContent>

      <TabsContent value="counterparties" className="space-y-4">
        <div className="text-center py-8 text-gray-500">Counterparties content coming soon...</div>
      </TabsContent>
    </Tabs>
  )
}
