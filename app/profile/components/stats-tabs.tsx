"use client"
import { useState, useEffect } from "react"
import StatsGrid from "./stats-grid"
import PaymentMethodsTab from "./payment-methods-tab"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import AddPaymentMethodPanel from "./add-payment-method-panel"
import * as ProfileAPI from "../api"
import StatusModal from "./ui/status-modal"
import CustomNotificationBanner from "./ui/custom-notification-banner"
import { PlusCircle } from "lucide-react"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { useRouter } from "next/navigation"
import Image from "next/image"
import type { UserStats } from "../api/api-user-stats"

interface StatsTabsProps {
  stats?: any
}

export default function StatsTabs({ stats: initialStats }: StatsTabsProps) {
  const isMobile = useIsMobile()
  const router = useRouter()
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
  const [userStats, setUserStats] = useState<UserStats | null>(initialStats || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tabs = [
    { id: "stats", label: "Stats" },
    { id: "payment", label: "Payment methods" },
    { id: "counterparties", label: "Counterparties" },
  ]

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const stats = await ProfileAPI.UserStats.fetchUserStats()
        setUserStats(stats)
      } catch (error) {
        console.error("Failed to fetch user stats:", error)
        setError("Failed to load statistics")
      } finally {
        setLoading(false)
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

  // Mobile view rendering - navigate to separate routes
  if (isMobile) {
    return (
      <div className="relative">
        {notification.show && (
          <CustomNotificationBanner
            message={notification.message}
            onClose={() => setNotification({ show: false, message: "" })}
          />
        )}

        <div>
          <div className="h-px bg-gray-200"></div>

          <div
            onClick={() => router.push("/profile/stats")}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-normal text-gray-900">Stats</span>
            <Image src="/icons/chevron-right-sm.png" alt="Chevron right" width={20} height={20} />
          </div>

          <div className="h-px bg-gray-200"></div>

          <div
            onClick={() => router.push("/profile/payment-methods")}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-normal text-gray-900">Payment methods</span>
            <Image src="/icons/chevron-right-sm.png" alt="Chevron right" width={20} height={20} />
          </div>

          <div className="h-px bg-gray-200"></div>

          <div
            onClick={() => router.push("/profile/counterparties")}
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-normal text-gray-900">Counterparties</span>
            <Image src="/icons/chevron-right-sm.png" alt="Chevron right" width={20} height={20} />
          </div>

          <div className="h-px bg-gray-200"></div>
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

  // Desktop view (restored to original)
  return (
    <div className="relative">
      {notification.show && (
        <CustomNotificationBanner
          message={notification.message}
          onClose={() => setNotification({ show: false, message: "" })}
        />
      )}

      {error && (
        <div className="flex items-center justify-center py-8">
          <div className="text-red-500">{error}</div>
        </div>
      )}

      {!loading && (
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

            <TabsContent value="stats">
              {loading ? (
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

            <TabsContent value="counterparties" className="mt-6">
              <div className="text-center py-8 text-slate-500">Counterparties data coming soon...</div>
            </TabsContent>
          </Tabs>
        </div>
      )}

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
