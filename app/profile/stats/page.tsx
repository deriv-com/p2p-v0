"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { USER, API, AUTH } from "@/lib/local-variables"

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

        if (responseData && responseData.data) {
          const data = responseData.data

          const formatTimeAverage = (minutes: number) => {
            if (!minutes || minutes <= 0) return "N/A"
            const days = Math.floor(minutes / 1440)
            return `${days} days`
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

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getProgressValue = (rateString: string): number => {
    const match = rateString.match(/(\d+)%/)
    return match ? Number.parseInt(match[1]) : 0
  }

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
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
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
            {/* Buy Completion Rate */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Buy completion rate</span>
                    <span className="text-xs text-gray-500">{userStats.buyCompletion.period}</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">{userStats.buyCompletion.rate}</div>
                  <Progress value={getProgressValue(userStats.buyCompletion.rate)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Sell Completion Rate */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sell completion rate</span>
                    <span className="text-xs text-gray-500">{userStats.sellCompletion.period}</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">{userStats.sellCompletion.rate}</div>
                  <Progress value={getProgressValue(userStats.sellCompletion.rate)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Average Pay Time */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg pay time</span>
                    <span className="text-xs text-gray-500">{userStats.avgPayTime.period}</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">{userStats.avgPayTime.time}</div>
                </div>
              </CardContent>
            </Card>

            {/* Average Release Time */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg release time</span>
                    <span className="text-xs text-gray-500">{userStats.avgReleaseTime.period}</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">{userStats.avgReleaseTime.time}</div>
                </div>
              </CardContent>
            </Card>

            {/* Trade Partners */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Trade partners</span>
                  <div className="text-2xl font-semibold text-gray-900">{formatNumber(userStats.tradePartners)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Total Orders (30d) */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total orders</span>
                    <span className="text-xs text-gray-500">(30d)</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">{formatNumber(userStats.totalOrders30d)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Total Orders (Lifetime) */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Total orders (lifetime)</span>
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatNumber(userStats.totalOrdersLifetime)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trade Volume (30d) */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Trade volume</span>
                    <span className="text-xs text-gray-500">{userStats.tradeVolume30d.period}</span>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {userStats.tradeVolume30d.currency} {userStats.tradeVolume30d.amount}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trade Volume (Lifetime) */}
            <Card className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Trade volume (lifetime)</span>
                  <div className="text-2xl font-semibold text-gray-900">
                    {userStats.tradeVolumeLifetime.currency} {userStats.tradeVolumeLifetime.amount}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
