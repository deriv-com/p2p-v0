"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { USER, API, AUTH } from "@/lib/local-variables"
import { Info } from "lucide-react"

interface UserStats {
  buyCompletion: { rate: string; period: string; count?: number }
  sellCompletion: { rate: string; period: string; count?: number }
  avgPayTime: { time: string; period: string }
  avgReleaseTime: { time: string; period: string }
  tradePartners: number
  totalOrders30d: number
  totalOrdersLifetime: number
  tradeVolume30d: { amount: string; currency: string; period: string }
  tradeVolumeLifetime: { amount: string; currency: string }
}

type TabType = "30days" | "lifetime"

export default function StatsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("30days")
  const [userStats, setUserStats] = useState<UserStats>({
    buyCompletion: { rate: "N/A", period: "(30d)", count: 0 },
    sellCompletion: { rate: "N/A", period: "(30d)", count: 0 },
    avgPayTime: { time: "N/A", period: "(30d)" },
    avgReleaseTime: { time: "N/A", period: "(30d)" },
    tradePartners: 0,
    totalOrders30d: 0,
    totalOrdersLifetime: 0,
    tradeVolume30d: { amount: "0.00", currency: "USD", period: "(30d)" },
    tradeVolumeLifetime: { amount: "0.00", currency: "USD" },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const userId = USER.id
        const url = `${API.baseUrl}/users/${userId}`
        const headers = AUTH.getAuthHeader()

        const response = await fetch(url, {
          headers,
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch user stats: ${response.status} ${response.statusText}`)
        }

        const responseData = await response.json()

        if (responseData && responseData.data) {
          const data = responseData.data

          const formatTimeAverage = (minutes: number) => {
            if (!minutes || minutes <= 0) return "N/A"
            if (minutes < 60) return `${minutes} min`
            const hours = Math.floor(minutes / 60)
            const remainingMinutes = minutes % 60
            if (hours < 24) {
              return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
            }
            const days = Math.floor(hours / 24)
            const remainingHours = hours % 24
            return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
          }

          const transformedStats: UserStats = {
            buyCompletion: {
              rate: `${Number(data.completion_average_30day) || 0}%`,
              period: "(30d)",
              count: Number(data.buy_count_30day) || 0,
            },
            sellCompletion: {
              rate: `${Number(data.completion_average_30day) || 0}%`,
              period: "(30d)",
              count: Number(data.sell_count_30day) || 0,
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
        setError(error instanceof Error ? error.message : "Failed to load stats")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserStats()
  }, [])

  const handleBack = () => {
    router.push("/profile")
  }

  const getDisplayValue = (stat: string, isLifetime = false) => {
    if (isLoading) return "..."
    if (error) return "N/A"

    switch (stat) {
      case "sellCompletion":
        return isLifetime
          ? `${userStats.sellCompletion.rate} (${userStats.totalOrdersLifetime})`
          : `${userStats.sellCompletion.rate} (${userStats.sellCompletion.count || 0})`
      case "buyCompletion":
        return isLifetime
          ? `${userStats.buyCompletion.rate} (${userStats.totalOrdersLifetime})`
          : `${userStats.buyCompletion.rate} (${userStats.buyCompletion.count || 0})`
      case "avgPayTime":
        return userStats.avgPayTime.time
      case "avgReleaseTime":
        return userStats.avgReleaseTime.time
      case "totalOrders":
        return isLifetime ? userStats.totalOrdersLifetime.toString() : userStats.totalOrders30d.toString()
      case "tradeVolume":
        return isLifetime
          ? `${userStats.tradeVolumeLifetime.currency} ${userStats.tradeVolumeLifetime.amount}`
          : `${userStats.tradeVolume30d.currency} ${userStats.tradeVolume30d.amount}`
      default:
        return "N/A"
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 z-10">
        <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
          <Image src="/icons/back-circle.png" alt="Back" width={24} height={24} />
        </Button>
        <h1 className="text-lg font-semibold">Stats</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 bg-white px-4 py-4">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setActiveTab("30days")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === "30days" ? "bg-white text-black shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Last 30 days
          </button>
          <button
            onClick={() => setActiveTab("lifetime")}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === "lifetime" ? "bg-white text-black shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Lifetime
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="text-red-500 mb-4 text-center">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="px-6">
              Try again
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-0">
            {/* Sell Completion */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 flex justify-between items-center">
              <span className="text-gray-600">Sell completion</span>
              <span className="font-semibold text-black">
                {getDisplayValue("sellCompletion", activeTab === "lifetime")}
              </span>
            </div>

            {/* Buy Completion */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 flex justify-between items-center">
              <span className="text-gray-600">Buy completion</span>
              <span className="font-semibold text-black">
                {getDisplayValue("buyCompletion", activeTab === "lifetime")}
              </span>
            </div>

            {/* Avg Pay Time */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 flex justify-between items-center">
              <span className="text-gray-600">Avg. pay time</span>
              <span className="font-semibold text-black">
                {getDisplayValue("avgPayTime", activeTab === "lifetime")}
              </span>
            </div>

            {/* Avg Release Time */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 flex justify-between items-center">
              <span className="text-gray-600">Avg. release time</span>
              <span className="font-semibold text-black">
                {getDisplayValue("avgReleaseTime", activeTab === "lifetime")}
              </span>
            </div>

            {/* Total Orders */}
            <div className="bg-white border-b border-gray-100 px-4 py-4 flex justify-between items-center">
              <span className="text-gray-600">Total orders</span>
              <span className="font-semibold text-black">
                {getDisplayValue("totalOrders", activeTab === "lifetime")}
              </span>
            </div>

            {/* Trade Volume */}
            <div className="bg-white px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Trade volume</span>
                <Info className="h-4 w-4 text-gray-400" />
              </div>
              <span className="font-semibold text-black">
                {getDisplayValue("tradeVolume", activeTab === "lifetime")}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
