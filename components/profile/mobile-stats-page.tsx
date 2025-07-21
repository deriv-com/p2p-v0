"use client"
import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import StatsGrid from "./stats-grid"
import { USER, API, AUTH } from "@/lib/local-variables"

interface MobileStatsPageProps {
  onBack: () => void
}

export default function MobileStatsPage({ onBack }: MobileStatsPageProps) {
  const [userStats, setUserStats] = useState<any>({
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

  const [isLoadingStats, setIsLoadingStats] = useState(false)

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setIsLoadingStats(true)
        const userId = USER.id
        const url = `${API.baseUrl}/users/${userId}`

        const response = await fetch(url, {
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <button
          onClick={onBack}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="ml-3 text-lg font-semibold text-gray-900">Stats</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {isLoadingStats ? (
          <div className="space-y-4">
            <div className="bg-slate-100 rounded-lg p-4">
              <div className="grid grid-cols-1 gap-4">
                {[...Array(9)].map((_, i) => (
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
      </div>
    </div>
  )
}
