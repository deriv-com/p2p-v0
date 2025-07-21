"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { API, AUTH } from "@/lib/local-variables"
import { CustomShimmer } from "../components/ui/custom-shimmer"
import CustomStatusModal from "../components/ui/custom-status-modal"
import CustomNotificationBanner from "../components/ui/custom-notification-banner"
import { Info } from "lucide-react"

interface UserStats {
  buy_orders_count: number
  sell_orders_count: number
  buy_completion_rate: number
  sell_completion_rate: number
  avg_pay_time: number
  avg_release_time: number
  total_orders: number
  total_turnover: number
  currency: string
}

type TabType = "30_days" | "lifetime"

export default function StatsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>("30_days")
  const [statusModal, setStatusModal] = useState({
    show: false,
    type: "error" as "success" | "error",
    title: "",
    message: "",
  })
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  })

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const url = `${API.baseUrl}/user-stats?period=${activeTab}`
      const headers = AUTH.getAuthHeader()
      const response = await fetch(url, {
        headers,
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Error fetching stats: ${response.statusText}`)
      }

      const responseText = await response.text()
      let data

      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse stats response:", e)
        data = { data: null }
      }

      if (data.data) {
        setStats(data.data)
      } else {
        // Mock data for demonstration
        setStats({
          buy_orders_count: 5,
          sell_orders_count: 20,
          buy_completion_rate: 100,
          sell_completion_rate: 100,
          avg_pay_time: 300, // 5 minutes in seconds
          avg_release_time: 300, // 5 minutes in seconds
          total_orders: 25,
          total_turnover: 500.0,
          currency: "USD",
        })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load stats")
      // Set mock data on error for demonstration
      setStats({
        buy_orders_count: 5,
        sell_orders_count: 20,
        buy_completion_rate: 100,
        sell_completion_rate: 100,
        avg_pay_time: 300,
        avg_release_time: 300,
        total_orders: 25,
        total_turnover: 500.0,
        currency: "USD",
      })
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleBack = () => {
    router.push("/profile")
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds} sec`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    return `${Math.floor(seconds / 86400)}d`
  }

  const formatCurrency = (amount: number, currency: string): string => {
    return `${currency} ${amount.toFixed(2)}`
  }

  const closeStatusModal = () => {
    setStatusModal((prev) => ({ ...prev, show: false }))
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {notification.show && (
        <CustomNotificationBanner
          message={notification.message}
          onClose={() => setNotification({ show: false, message: "" })}
        />
      )}

      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 z-10">
        <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
          <Image src="/icons/back-circle.png" alt="Back" width={24} height={24} />
        </Button>
        <h1 className="text-lg font-semibold">Stats</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 bg-white px-4 py-4 border-b border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("30_days")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "30_days" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Last 30 days
          </button>
          <button
            onClick={() => setActiveTab("lifetime")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "lifetime" ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Lifetime
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 flex justify-between items-center">
                <CustomShimmer className="h-4 w-32" />
                <CustomShimmer className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <p className="text-red-500 mb-4 text-center">{error}</p>
            <Button onClick={fetchStats} variant="outline" className="px-6 bg-transparent">
              Try again
            </Button>
          </div>
        ) : stats ? (
          <div className="p-4 space-y-1">
            {/* Sell completion */}
            <div className="bg-white rounded-lg p-4 flex justify-between items-center border-b border-gray-100">
              <span className="text-gray-600">Sell completion</span>
              <span className="font-semibold text-black">
                {stats.sell_completion_rate}% ({stats.sell_orders_count})
              </span>
            </div>

            {/* Buy completion */}
            <div className="bg-white rounded-lg p-4 flex justify-between items-center border-b border-gray-100">
              <span className="text-gray-600">Buy completion</span>
              <span className="font-semibold text-black">
                {stats.buy_completion_rate}% ({stats.buy_orders_count})
              </span>
            </div>

            {/* Avg. pay time */}
            <div className="bg-white rounded-lg p-4 flex justify-between items-center border-b border-gray-100">
              <span className="text-gray-600">Avg. pay time</span>
              <span className="font-semibold text-black">{formatTime(stats.avg_pay_time)}</span>
            </div>

            {/* Avg. release time */}
            <div className="bg-white rounded-lg p-4 flex justify-between items-center border-b border-gray-100">
              <span className="text-gray-600">Avg. release time</span>
              <span className="font-semibold text-black">{formatTime(stats.avg_release_time)}</span>
            </div>

            {/* Total orders */}
            <div className="bg-white rounded-lg p-4 flex justify-between items-center border-b border-gray-100">
              <span className="text-gray-600">Total orders</span>
              <span className="font-semibold text-black">{stats.total_orders}</span>
            </div>

            {/* Trade volume */}
            <div className="bg-white rounded-lg p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Trade volume</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <span className="font-semibold text-black">{formatCurrency(stats.total_turnover, stats.currency)}</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Status Modal */}
      {statusModal.show && (
        <CustomStatusModal
          type={statusModal.type}
          title={statusModal.title}
          message={statusModal.message}
          onClose={closeStatusModal}
        />
      )}
    </div>
  )
}
