"use client"
import { useState, useEffect } from "react"
import StatsGrid from "./stats-grid"
import PaymentMethodsTab from "./payment-methods-tab"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import AddPaymentMethodPanel from "./add-payment-method-panel"
import { ProfileAPI } from "../api"
import StatusModal from "./ui/status-modal"
import NotificationBanner from "./notification-banner"
import { PlusCircle } from "lucide-react"
import { USER, API, AUTH } from "@/lib/local-variables"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface StatsTabsProps {
  stats?: any
}

export default function StatsTabs({ stats: initialStats }: StatsTabsProps) {
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
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")

  const tabs = [
    { id: "stats", label: "Stats" },
    { id: "payment", label: "Payment methods" },
    { id: "ads", label: "Advertisers' instruction" },
    { id: "counterparties", label: "Counterparties" },
  ]

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoadingStats(true)
        const userId = USER.id
        const url = `${API.baseUrl}/users/${userId}`

        const response = await fetch(url, {
          //credentials: "include",
          headers: {
            ...AUTH.getAuthHeader(),
            accept: "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch user stats: ${response.status} ${response.statusText}`)
        }

        const responseData = await response.json()

        if (responseData && responseData.data) {
          const data = responseData.data

          const formatTimeAverage = (minutes) => {
            if (!minutes || minutes <= 0) return "N/A"
            const days = Math.floor(minutes / 1440)
            return `${days} days`
          }

          const transformedStats = {
            buyCompletion: {
              rate: `${data.completion_average_30day || 0}%`,
              period: "(30d)",
            },
            sellCompletion: {
              rate: `${data.completion_average_30day || 0}%`,
              period: "(30d)",
            },
            avgPayTime: {
              time: formatTimeAverage(data.buy_time_average_30day),
              period: "(30d)",
            },
            avgReleaseTime: {
              time: formatTimeAverage(data.release_time_average_30day),
              period: "(30d)",
            },
            tradePartners: data.trade_partners || 0,
            totalOrders30d: (data.buy_count_30day || 0) + (data.sell_count_30day || 0),
            totalOrdersLifetime: data.order_count_lifetime || 0,
            tradeVolume30d: {
              amount: (data.buy_amount_30day || 0) + (data.sell_amount_30day || 0),
              currency: "USD",
              period: "(30d)",
            },
            tradeVolumeLifetime: {
              amount: data.order_amount_lifetime ? data.order_amount_lifetime : "0.00",
              currency: "USD",
            },
          }

          setUserStats(transformedStats)
        }
      } catch (error) {
        console.error("Error fetching user stats:", error)
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
      console.error("Error adding payment method:", error)

      setErrorModal({
        show: true,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    } finally {
      setIsAddingPaymentMethod(false)
    }
  }

  if (isMobile) {
    return (
      <div className="relative">
        {notification.show && (
          <NotificationBanner
            message={notification.message}
            onClose={() => setNotification({ show: false, message: "" })}
          />
        )}
        <div className="bg-white">
          <div
            onClick={() => router.push("/profile/stats")}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <span className="text-base font-medium text-gray-900">Stats</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
          <div className="border-t border-gray-200 w-full"></div>
          <div
            onClick={() => router.push("/profile/payment-methods")}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <span className="text-base font-medium text-gray-900">Payment methods</span>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
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

  return (
    <div className="relative">
      {notification.show && (
        <NotificationBanner
          message={notification.message}
          onClose={() => setNotification({ show: false, message: "" })}
        />
      )}

      <div className="mb-6">
        <Tabs defaultValue="stats">
          <TabsList className="bg-slate-1500 rounded-2xl p-1 h-auto">
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

          <TabsContent value="stats">
            {isLoadingStats ? (
              <div className="space-y-4">
                <div className="bg-slate-1500 rounded-lg p-4">
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
