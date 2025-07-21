"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, TrendingUp, TrendingDown, Clock, Star } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { API, AUTH } from "@/lib/local-variables"
import { CustomShimmer } from "./ui/custom-shimmer"
import CustomNotificationBanner from "./ui/custom-notification-banner"

interface StatsData {
  totalOrders: number
  completedOrders: number
  averagePayTime: string
  averageReleaseTime: string
  buyCompletionRate: string
  sellCompletionRate: string
  rating: number
  totalReviews: number
}

interface StatsMobileViewProps {
  onBack?: () => void
}

export default function StatsMobileView({ onBack }: StatsMobileViewProps) {
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  })

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const url = `${API.baseUrl}/user-stats`
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
        // Mock data for development
        data = {
          data: {
            total_orders: 156,
            completed_orders: 142,
            average_pay_time: "14 minutes",
            average_release_time: "8 minutes",
            buy_completion_rate: "95.2%",
            sell_completion_rate: "97.8%",
            rating: 4.8,
            total_reviews: 89,
          },
        }
      }

      const statsInfo = data.data || {}

      setStatsData({
        totalOrders: statsInfo.total_orders || 0,
        completedOrders: statsInfo.completed_orders || 0,
        averagePayTime: statsInfo.average_pay_time || "N/A",
        averageReleaseTime: statsInfo.average_release_time || "N/A",
        buyCompletionRate: statsInfo.buy_completion_rate || "0%",
        sellCompletionRate: statsInfo.sell_completion_rate || "0%",
        rating: statsInfo.rating || 0,
        totalReviews: statsInfo.total_reviews || 0,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load stats")
      // Set mock data on error for development
      setStatsData({
        totalOrders: 156,
        completedOrders: 142,
        averagePayTime: "14 minutes",
        averageReleaseTime: "8 minutes",
        buyCompletionRate: "95.2%",
        sellCompletionRate: "97.8%",
        rating: 4.8,
        totalReviews: 89,
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
  }: {
    title: string
    value: string | number
    icon: any
    trend?: "up" | "down"
    trendValue?: string
  }) => (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-gray-600" />
            <span className="text-sm text-gray-600">{title}</span>
          </div>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  )

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
        <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Stats</h1>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <CustomShimmer className="h-24 rounded-lg" />
              <CustomShimmer className="h-24 rounded-lg" />
              <CustomShimmer className="h-24 rounded-lg" />
              <CustomShimmer className="h-24 rounded-lg" />
            </div>
            <div className="space-y-3">
              <CustomShimmer className="h-24 rounded-lg" />
              <CustomShimmer className="h-24 rounded-lg" />
              <CustomShimmer className="h-24 rounded-lg" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <p className="text-red-500 mb-4 text-center">{error}</p>
            <Button onClick={fetchStats} variant="outline" className="px-6 bg-transparent">
              Try again
            </Button>
          </div>
        ) : statsData ? (
          <div className="p-4 space-y-6">
            {/* Overview Stats */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  title="Total Orders"
                  value={statsData.totalOrders}
                  icon={TrendingUp}
                  trend="up"
                  trendValue="+12%"
                />
                <StatCard
                  title="Completed"
                  value={statsData.completedOrders}
                  icon={TrendingUp}
                  trend="up"
                  trendValue="+8%"
                />
                <StatCard title="Rating" value={`${statsData.rating}/5`} icon={Star} />
                <StatCard title="Reviews" value={statsData.totalReviews} icon={Star} />
              </div>
            </div>

            {/* Performance Stats */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Performance</h2>
              <div className="space-y-3">
                <StatCard
                  title="Average Pay Time"
                  value={statsData.averagePayTime}
                  icon={Clock}
                  trend="down"
                  trendValue="-2 min"
                />
                <StatCard
                  title="Average Release Time"
                  value={statsData.averageReleaseTime}
                  icon={Clock}
                  trend="down"
                  trendValue="-1 min"
                />
              </div>
            </div>

            {/* Completion Rates */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Completion Rates</h2>
              <div className="space-y-3">
                <Card className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Buy Orders</span>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        +2.1%
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">{statsData.buyCompletionRate}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: statsData.buyCompletionRate }} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Sell Orders</span>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="h-3 w-3" />
                        +1.5%
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-2">{statsData.sellCompletionRate}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: statsData.sellCompletionRate }} />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Add some bottom padding */}
            <div className="h-8" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
