"use client"
import { useState, useEffect } from "react"
import StatsGrid from "./stats-grid"
import PaymentMethodsTab from "./payment-methods-tab"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Divider } from "@/components/ui/divider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import AddPaymentMethodPanel from "./add-payment-method-panel"
import { ProfileAPI } from "../api"
import StatusModal from "./ui/status-modal"
import CustomNotificationBanner from "./ui/custom-notification-banner"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import type { UserStats } from "../api/api-user-stats"

interface StatsTabsProps {
  stats?: any
}

export default function StatsTabs({ stats: initialStats }: StatsTabsProps) {
  const isMobile = useIsMobile()
  const router = useRouter()
  const { showWarningDialog } = useAlertDialog()
  const [showAddPaymentMethodPanel, setShowAddPaymentMethodPanel] = useState(false)
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  })
  const [errorModal, setErrorModal] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const [userStats, setUserStats] = useState<UserStats>(
    initialStats || {
      buyCompletion: { rate: "-", period: "(30d)" },
      sellCompletion: { rate: "-", period: "(30d)" },
      avgPayTime: { time: "-", period: "(30d)" },
      avgReleaseTime: { time: "-", period: "(30d)" },
      tradePartners: 0,
      totalOrders30d: 0,
      totalOrdersLifetime: 0,
      tradeVolume30d: { amount: "0.00", currency: "USD", period: "(30d)" },
      tradeVolumeLifetime: { amount: "0.00", currency: "USD" },
    },
  )

  const [isLoadingStats, setIsLoadingStats] = useState(false)
  const [showStatsSidebar, setShowStatsSidebar] = useState(false)
  const [showPaymentMethodsSidebar, setShowPaymentMethodsSidebar] = useState(false)

  const tabs = [
    { id: "stats", label: "Stats" },
    { id: "payment", label: "Payment methods" },
  ]

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        setIsLoadingStats(true)
        const result = await ProfileAPI.UserStats.fetchUserStats()

        if ("error" in result) {
          const errorMessage = Array.isArray(result.error) ? result.error.join(", ") : result.error
          showWarningDialog({
            title: "Error",
            description: errorMessage,
          })
        } else {
          setUserStats(result)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load user stats"
        showWarningDialog({
          title: "Error",
          description: errorMessage,
        })
      } finally {
        setIsLoadingStats(false)
      }
    }

    loadUserStats()
  }, [])

  const handleAddPaymentMethod = async (method: string, fields: Record<string, string>) => {
    try {
      setIsAddingPaymentMethod(true)

      const result = await ProfileAPI.PaymentMethods.addPaymentMethod(method, fields)

      if (result.success) {
        setShowAddPaymentMethodPanel(false)

        setNotification({
          show: true,
          message: "Payment method added.",
        })

        setRefreshKey((prev) => prev + 1)
      } else {
        const errorMessage =
          result.errors && result.errors.length > 0 ? result.errors[0].message : "Failed to add payment method"

        setErrorModal({
          show: true,
          message: errorMessage,
        })
      }
    } catch (error) {
      setErrorModal({
        show: true,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsAddingPaymentMethod(false)
    }
  }

  return (
    <div className="relative">
      {notification.show && (
        <CustomNotificationBanner
          message={notification.message}
          onClose={() => setNotification({ show: false, message: "" })}
        />
      )}

      <div className="mb-6">
        {isMobile ? (
          <div>
            <Divider />
            <div onClick={() => { setShowStatsSidebar(true) }}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <span className="text-sm font-normal text-gray-900">Stats</span>
              <Image src="/icons/chevron-right-sm.png" alt="Chevron right" width={20} height={20} />
            </div>
            <Sheet open={showStatsSidebar} onOpenChange={setShowStatsSidebar}>
              <SheetTrigger asChild>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Stats</SheetTitle>
                </SheetHeader>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-center">Stats</h3>
                </div>
                <div className="mt-6">
                  <StatsGrid stats={userStats} />
                </div>
              </SheetContent>
            </Sheet>
            <Divider />
            <div onClick={() => { setShowPaymentMethodsSidebar(true) }}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-normal text-gray-900">Payment methods</span>
              <Image src="/icons/chevron-right-sm.png" alt="Chevron right" width={20} height={20} />
            </div>
            <Sheet open={showPaymentMethodsSidebar} onOpenChange={setShowPaymentMethodsSidebar}>
              <SheetTrigger asChild>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-md">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-center">Payment methods</h3>
                </div>
                <div className="mt-6">
                   <PaymentMethodsTab key={refreshKey} />
                </div>
              </SheetContent>
            </Sheet>
            <Divider />
          </div>
        ) : (
          <Tabs defaultValue="stats">
            <TabsList className="bg-[#F5F5F5] rounded-2xl p-2 h-auto">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="py-2 px-4 rounded-xl transition-all font-normal text-base data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-slate-500 hover:text-slate-700"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="stats">
              {isLoadingStats ? (
                <div className="space-y-4">
                  <div className="bg-[#F5F5F5] rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="py-4">
                          <div className="animate-pulse bg-slate-200 h-4 w-3/4 mb-2 rounded"></div>
                          <div className="animate-pulse bg-slate-200 h-8 w-1/2 rounded"></div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b border-slate-200 py-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="py-4">
                          <div className="animate-pulse bg-slate-200 h-4 w-3/4 mb-2 rounded"></div>
                          <div className="animate-pulse bg-slate-200 h-8 w-1/2 rounded"></div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="py-4">
                          <div className="animate-pulse bg-slate-200 h-4 w-3/4 mb-2 rounded"></div>
                          <div className="animate-pulse bg-slate-200 h-8 w-1/2 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <StatsGrid stats={userStats} />
              )}
            </TabsContent>

            <TabsContent value="payment">
              <div className="relative rounded-lg border p-4">
                <div className="flex justify-end mb-4">
                  <Button variant="outline" size="sm" onClick={() => setShowAddPaymentMethodPanel(true)}>
                    <Image src="/icons/plus_icon.png" alt="Add payment" width={14} height={24} className="mr-1" />
                    Add payment
                  </Button>
                </div>
                <PaymentMethodsTab key={refreshKey} />
              </div>
            </TabsContent>

            <TabsContent value="ads">
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Advertisers' instruction</h3>
                <p className="text-slate-500">Your ad details will appear here.</p>
              </div>
            </TabsContent>

            <TabsContent value="counterparties">
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Counterparties</h3>
                <p className="text-slate-500">Your counterparties will appear here.</p>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {showAddPaymentMethodPanel && (
        <AddPaymentMethodPanel
          onClose={() => setShowAddPaymentMethodPanel(false)}
          onAdd={handleAddPaymentMethod}
          isLoading={isAddingPaymentMethod}
        />
      )}

      {errorModal.show && (
        <StatusModal
          type="error"
          title="Error"
          message={errorModal.message}
          onClose={() => setErrorModal({ show: false, message: "" })}
        />
      )}
    </div>
  )
}
