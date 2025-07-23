"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Info } from "lucide-react"

interface UserStats {
  buyCompletion: { rate: string; period: string }
  sellCompletion: { rate: string; period: string }
  avgPayTime: { time: string; period: string }
  avgReleaseTime: { time: string; period: string }
  tradePartners: number
  totalOrders30d: number
  totalOrdersLifetime: number
  tradeVolume30d: { amount: string; currency: string; period: string }
  tradeVolumeLifetime: { amount: string; currency: string }
}

// Import the fetchUserStats function from stats-tabs
const fetchUserStats = async (): Promise<UserStats> => {
  const { USER, API, AUTH } = await import("@/lib/local-variables")

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
  console.log("API response for user data in mobile stats:", responseData)

  if (responseData && responseData.data) {
    const data = responseData.data

    const formatTimeAverage = (minutes: number) => {
      if (!minutes || minutes <= 0) return "N/A"
      return `${minutes} min`
    }

    const transformedStats: UserStats = {
      buyCompletion: {
        rate: `${Number(data.completion_average_30day) || 0}%`,
        period: "(30d)",
      },
      sellCompletion: {
        rate: `${Number(data.completion_average_30day) || 0}%`,
        period: "(30d)",
      },
      avgPayTime: {
        time: formatTimeAverage(Number(data.release_time_average_30day)),
        period: "(30d)",
      },
      avgReleaseTime: {
        time: formatTimeAverage(Number(data.release_time_average_30day)),
        period: "(30d)",
      },
      tradePartners: Number(data.partner_count_lifetime) || 0,
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

    return transformedStats
  }

  // Return default stats if no data
  return {
    buyCompletion: { rate: "N/A", period: "(30d)" },
    sellCompletion: { rate: "N/A", period: "(30d)" },
    avgPayTime: { time: "N/A", period: "(30d)" },
    avgReleaseTime: { time: "N/A", period: "(30d)" },
    tradePartners: 0,
    totalOrders30d: 0,
    totalOrdersLifetime: 0,
    tradeVolume30d: { amount: "0.00", currency: "USD", period: "(30d)" },
    tradeVolumeLifetime: { amount: "0.00", currency: "USD" },
  }
}

export default function StatsPage() {
  const router = useRouter()
  const [userStats, setUserStats] = useState<UserStats>({
    buyCompletion: { rate: "N/A", period: "(30d)" },
    sellCompletion: { rate: "N/A", period: "(30d)" },
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
    const loadUserStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const stats = await fetchUserStats()
        setUserStats(stats)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load stats")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserStats()
  }, [])

  const handleBack = () => {
    router.push("/profile")
  }

  const StatItem = ({
    label,
    value,
    hasInfo = false,
    showBorder = true,
  }: {
    label: string
    value: string | number
    hasInfo?: boolean
    showBorder?: boolean
  }) => (
    <div className={`flex justify-between items-center w-full py-3 ${showBorder ? "border-b border-gray-200" : ""}`}>
      <div className="flex items-center gap-1">
        <span className="text-gray-600 text-sm">{label}</span>
        {hasInfo && <Info className="h-4 w-4 text-gray-400" />}
      </div>
      <span className="text-black font-semibold text-sm">{value !== undefined && value !== null ? value : "N/A"}</span>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3 z-10">
        <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
          <Image src="/icons/back-circle.png" alt="Back" width={24} height={24} />
        </Button>
        <h1 className="text-lg font-semibold">Stats</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <div
              className="animate-pulse"
              style={{
                display: "flex",
                padding: "16px",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
                alignSelf: "stretch",
                borderRadius: "8px",
                background: "#F8F9FA",
              }}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex justify-between items-center w-full py-3">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="text-red-500 mb-4 text-center">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="px-6 bg-transparent">
              Try again
            </Button>
          </div>
        ) : (
          <div className="p-4">
            <div
              style={{
                display: "flex",
                padding: "16px",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "8px",
                alignSelf: "stretch",
                borderRadius: "8px",
                background: "#F8F9FA",
              }}
            >
              <StatItem label="Sell completion" value={userStats.sellCompletion.rate} />

              <StatItem label="Buy completion" value={userStats.buyCompletion.rate} />

              <StatItem label="Avg. pay time" value={userStats.avgPayTime.time} />

              <StatItem label="Avg. release time" value={userStats.avgReleaseTime.time} />

              <StatItem label="Total orders" value={userStats.totalOrders30d} />

              <StatItem
                label="Trade volume"
                value={`${userStats.tradeVolume30d.currency} ${userStats.tradeVolume30d.amount}`}
                hasInfo={true}
                showBorder={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
