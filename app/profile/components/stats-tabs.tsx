"use client"
import { useState, useEffect } from "react"
import StatsGrid from "./stats-grid"
import PaymentMethodsTab from "./payment-methods-tab"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import AddPaymentMethodPanel from "./add-payment-method-panel"
import { ProfileAPI } from "../api"
import StatusModal from "./ui/status-modal"
import CustomNotificationBanner from "./ui/custom-notification-banner"
import { PlusCircle, ChevronRight } from "lucide-react"
import { USER, API, AUTH } from "@/lib/local-variables"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import StatsMobileView from "./stats-mobile-view"
import PaymentMethodsMobileView from "./payment-methods-mobile-view"

interface StatsTabsProps {
  stats?: any
}

type MobileView = "list" | "stats" | "payment-methods"

export default function StatsTabs({ stats: initialStats }: StatsTabsProps) {
  const isMobile = useIsMobile()
  const [mobileView, setMobileView] = useState<MobileView>("list")
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
  const [userStats, setUserStats] = useState<any>(
    initialStats || {
      buyCompletion: { rate: "N/A", period: "(30d)" },
      sellCompletion: { rate: "N/A", period: "(30d)" },
      avgPayTime: { time: "N/A", period: "(30d)" },
      avgReleaseTime: { time: "N/A", period: "(30d)" },
      tradePartners: 0,
      totalOrders30d: 0,
      totalOrdersLifetime: 0,
      tradeVolume30d: { amount: "0.00", currency: "USD", period: "(30d)" },
      tradeVolumeLifetime: { amount: "0.00", currency: "USD" },
    },
  )

  const [isLoadingStats, setIsLoadingStats] = useState(false)

  const tabs = [
    { id: "stats", label: "Stats" },
    { id: "payment-methods", label: "Payment methods" },
    { id: "advertisers-instruction", label: "Advertisers' instruction" },
    { id: "counterparties", label: "Counterparties" },
  ]

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoadingStats(true)
        const userId = USER.id
        const url = `${API.baseUrl}/users/${userId}`

        const headers = AUTH.getAuthHeader()
        const response = await fetch(url, {
          headers,
          // credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch user stats: ${response.status} ${response.statusText}`)
        }

        const responseData = await response.json()
        console.log("API response for user data in stats tabs:", responseData)

        if (responseData && responseData.data) {
          const data = responseData.data

          const formatTimeAverage = (minutes) => {
            if (!minutes || minutes <= 0) return "N/A"
            const days = Math.floor(minutes / 1440)
            return `${days} days`
          }

          const transformedStats = {
            buyCompletion: {
              rate: `${Number(data.completion_average_30day) || 0}%`,
              period: "(30d)",
            },
            sellCompletion: {
              rate: `${Number(data.completion_average_30day) || 0}%`,
              period: "(30d)",
            },
            avgPayTime: {
              time: formatTimeAverage(Number(data.buy_time_average_30day)),
              period: "(30d)",
            },
            avgReleaseTime: {
              time: formatTimeAverage(Number(data.release_time_average_30day)),
              period: "(30d)",
            },
            tradePartners: Number(data.trade_partners) || 0,
            totalOrders30d: (Number(data.buy_count_30day) || 0) + (Number(data.sell_count_30day) || 0),
            totalOrdersLifetime: Number(data.order_count_lifetime) || 0,
            tradeVolume30d: {
              amount: ((Number(data.buy_amount_30day) || 0) + (Number(data.sell_amount_30day) || 0)).toFixed(2),
              currency: "USD",
              period: "(30d)",
            },
            tradeVolumeLifetime: {
              amount: data.order_amount_lifetime ? Number(data.order_amount_lifetime).toFixed(2) : "0.00",
              currency: "USD",
            },
          }

          setUserStats(transformedStats)
        }
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoadingStats(false)
      }
    }

    fetchUserStats()
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

  // Mobile view rendering
  if (isMobile) {
    if (mobileView === "stats") {
      return <StatsMobileView onBack={() => setMobileView("list")} />
    }

    if (mobileView === "payment-methods") {
      return <PaymentMethodsMobileView onBack={() => setMobileView("list")} />
    }

    // Mobile list view
    return (
      <div className="relative space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMobileView(tab.id as MobileView)}
            className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-base font-medium text-gray-900">{tab.label}</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        ))}
      </div>
    )
  }

  // Desktop view
  return (
    <div className="relative">
      {notification.show && (
        <CustomNotificationBanner
          message={notification.message}
          onClose={() => setNotification({ show: false, message: "" })}
        />
      )}

      <div className="mb-6">
        <Tabs defaultValue="stats">
          <TabsList className="bg-[#F5F5F5] rounded-2xl p-1 h-auto">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="py-3 px-4 rounded-xl transition-all font-normal text-base data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-slate-500 hover:text-slate-700"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="stats" className="space-y-4">
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

          <TabsContent value="payment-methods" className="space-y-4">
            <div className="relative">
              <div className="flex justify-end mb-4">
                <Button variant="primary" size="sm" onClick={() => setShowAddPaymentMethodPanel(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add payment method
                </Button>
              </div>
              <PaymentMethodsTab key={refreshKey} />
            </div>
          </TabsContent>

          <TabsContent value="advertisers-instruction" className="space-y-4">
            <div className="text-center py-8 text-gray-500">Advertisers' instruction content coming soon...</div>
          </TabsContent>

          <TabsContent value="counterparties" className="space-y-4">
            <div className="text-center py-8 text-gray-500">Counterparties content coming soon...</div>
          </TabsContent>
        </Tabs>
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
