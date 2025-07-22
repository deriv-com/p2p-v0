"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { USER, API, AUTH } from "@/lib/local-variables"
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

  const StatCard = ({
    title,
    value,
    hasInfo = false,
  }: { title: string; value: string | number; hasInfo?: boolean }) => (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="text-slate-500 text-sm font-normal leading-5 tracking-normal flex items-center">
            {title}
            {hasInfo && <Info className="inline-block h-3 w-3 ml-1 text-slate-400" />}
          </div>
          <div className="font-bold text-black text-base leading-6 tracking-normal">
            {value !== undefined && value !== null ? value : "N/A"}
          </div>
        </div>
      </CardContent>
    </Card>
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
          <div className="p-4 space-y-4">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 gap-4">
                {[...Array(9)].map((_, i) => (
                  <Card key={i} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
          <div className="p-4 space-y-4 pb-8">
            {/* Row 1 Stats */}
            <StatCard title={`Buy completion ${userStats.buyCompletion.period}`} value={userStats.buyCompletion.rate} />

            <StatCard
              title={`Sell completion ${userStats.sellCompletion.period}`}
              value={userStats.sellCompletion.rate}
            />

            <StatCard title="Trade partners" value={userStats.tradePartners} hasInfo={true} />

            {/* Row 2 Stats */}
            <StatCard
              title={`Trade volume ${userStats.tradeVolume30d.period}`}
              value={`${userStats.tradeVolume30d.currency} ${userStats.tradeVolume30d.amount}`}
              hasInfo={true}
            />

            <StatCard
              title="Trade volume (Lifetime)"
              value={`${userStats.tradeVolumeLifetime.currency} ${userStats.tradeVolumeLifetime.amount}`}
              hasInfo={true}
            />

            <StatCard title={`Avg. pay time ${userStats.avgPayTime.period}`} value={userStats.avgPayTime.time} />

            {/* Row 3 Stats */}
            <StatCard title={`Total orders ${userStats.buyCompletion.period}`} value={userStats.totalOrders30d} />

            <StatCard title="Total orders (Lifetime)" value={userStats.totalOrdersLifetime} />

            <StatCard
              title={`Avg. release time ${userStats.avgReleaseTime.period}`}
              value={userStats.avgReleaseTime.time}
            />
          </div>
        )}
      </div>
    </div>
  )
}
