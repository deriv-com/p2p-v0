"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect, useCallback } from "react"
import { API, AUTH } from "@/lib/local-variables"
import { CustomShimmer } from "../components/ui/custom-shimmer"
import CustomStatusModal from "../components/ui/custom-status-modal"
import { useRouter } from "next/navigation"
import Image from "next/image"

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

interface StatsPageProps {
  stats?: UserStats
}

export default function StatsPage({ stats: initialStats }: StatsPageProps) {
  const router = useRouter()
  const [stats, setStats] = useState<UserStats>(
    initialStats || {
      buyCompletion: { rate: "", period: "" },
      sellCompletion: { rate: "100% (50)", period: "" },
      avgPayTime: { time: "", period: "" },
      avgReleaseTime: { time: "", period: "" },
      tradePartners: 0,
      totalOrders30d: 0,
      totalOrdersLifetime: 0,
      tradeVolume30d: { amount: "", currency: "", period: "" },
      tradeVolumeLifetime: { amount: "", currency: "" },
    },
  )
  const [isLoading, setIsLoading] = useState(!initialStats)
  const [error, setError] = useState<string | null>(null)
  const [statusModal, setStatusModal] = useState({
    show: false,
    type: "error" as "success" | "error",
    title: "",
    message: "",
  })

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const userId = AUTH.getUserId()
      const url = `${API.baseUrl}/users/${userId}/stats`
      const headers = AUTH.getAuthHeader()

      const response = await fetch(url, {
        headers,
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`)
      }

      const responseData = await response.json()

      if (responseData && responseData.data) {
        const data = responseData.data

        setStats({
          buyCompletion: {
            rate: data.buy_completion_rate ? `${data.buy_completion_rate}%` : "0%",
            period: "30 days",
          },
          sellCompletion: {
            rate: data.sell_completion_rate ? `${data.sell_completion_rate}%` : "0%",
            period: "30 days",
          },
          avgPayTime: {
            time: data.avg_pay_time || "0 min",
            period: "30 days",
          },
          avgReleaseTime: {
            time: data.avg_release_time || "0 min",
            period: "30 days",
          },
          tradePartners: data.trade_partners || 0,
          totalOrders30d: data.total_orders_30d || 0,
          totalOrdersLifetime: data.total_orders_lifetime || 0,
          tradeVolume30d: {
            amount: data.trade_volume_30d?.amount || "0",
            currency: data.trade_volume_30d?.currency || "USD",
            period: "30 days",
          },
          tradeVolumeLifetime: {
            amount: data.trade_volume_lifetime?.amount || "0",
            currency: data.trade_volume_lifetime?.currency || "USD",
          },
        })
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load stats")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!initialStats) {
      fetchStats()
    }
  }, [fetchStats, initialStats])

  const handleBack = () => {
    router.push("/profile")
  }

  const closeStatusModal = () => {
    setStatusModal((prev) => ({ ...prev, show: false }))
  }

  const parseCompletionRate = (rateString: string): number => {
    const match = rateString.match(/(\d+)%/)
    return match ? Number.parseInt(match[1], 10) : 0
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

  const formatCurrency = (amount: string, currency: string): string => {
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount)) return `0 ${currency}`

    if (numAmount >= 1000000) {
      return `${(numAmount / 1000000).toFixed(1)}M ${currency}`
    }
    if (numAmount >= 1000) {
      return `${(numAmount / 1000).toFixed(1)}K ${currency}`
    }
    return `${numAmount.toFixed(2)} ${currency}`
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
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <CustomShimmer className="h-24 w-full rounded-lg" />
              <CustomShimmer className="h-24 w-full rounded-lg" />
              <CustomShimmer className="h-24 w-full rounded-lg" />
              <CustomShimmer className="h-24 w-full rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CustomShimmer className="h-20 w-full rounded-lg" />
              <CustomShimmer className="h-20 w-full rounded-lg" />
              <CustomShimmer className="h-20 w-full rounded-lg" />
              <CustomShimmer className="h-20 w-full rounded-lg" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <p className="text-red-500 mb-4 text-center">{error}</p>
            <Button onClick={fetchStats} variant="outline" className="px-6 bg-transparent">
              Try again
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Completion Rates */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Completion rates</h2>

              {/* Buy Completion */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Buy completion</span>
                    <span className="text-sm font-semibold text-gray-900">{stats.buyCompletion.rate || "0%"}</span>
                  </div>
                  <Progress value={parseCompletionRate(stats.buyCompletion.rate)} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{stats.buyCompletion.period}</p>
                </CardContent>
              </Card>

              {/* Sell Completion */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Sell completion</span>
                    <span className="text-sm font-semibold text-gray-900">{stats.sellCompletion.rate || "0%"}</span>
                  </div>
                  <Progress value={parseCompletionRate(stats.sellCompletion.rate)} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">{stats.sellCompletion.period}</p>
                </CardContent>
              </Card>
            </div>

            {/* Average Times */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Average times</h2>

              {/* Average Pay Time */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Avg pay time</p>
                      <p className="text-xs text-gray-500">{stats.avgPayTime.period}</p>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{stats.avgPayTime.time || "0 min"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Average Release Time */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Avg release time</p>
                      <p className="text-xs text-gray-500">{stats.avgReleaseTime.period}</p>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{stats.avgReleaseTime.time || "0 min"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trade Statistics */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Trade statistics</h2>

              <div className="grid grid-cols-2 gap-4">
                {/* Trade Partners */}
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.tradePartners)}</p>
                    <p className="text-sm text-gray-600">Trade partners</p>
                  </CardContent>
                </Card>

                {/* Total Orders 30d */}
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalOrders30d)}</p>
                    <p className="text-sm text-gray-600">Orders (30d)</p>
                  </CardContent>
                </Card>

                {/* Total Orders Lifetime */}
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalOrdersLifetime)}</p>
                    <p className="text-sm text-gray-600">Total orders</p>
                  </CardContent>
                </Card>

                {/* Trade Volume 30d */}
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(stats.tradeVolume30d.amount, stats.tradeVolume30d.currency)}
                    </p>
                    <p className="text-sm text-gray-600">Volume (30d)</p>
                  </CardContent>
                </Card>
              </div>

              {/* Trade Volume Lifetime */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Total trade volume</p>
                      <p className="text-xs text-gray-500">Lifetime</p>
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(stats.tradeVolumeLifetime.amount, stats.tradeVolumeLifetime.currency)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Add some bottom padding */}
            <div className="h-8" />
          </div>
        )}
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
