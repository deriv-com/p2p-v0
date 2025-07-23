"use client"

import { useState, useEffect } from "react"
import { fetchUserStats, type UserStats } from "@/app/profile/api/api-user-stats"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { Divider } from "@/components/ui/divider"

export default function StatsTabs() {
  const { showAlert } = useAlertDialog()
  const [userStats, setUserStats] = useState<UserStats>({
    buyCompletion: { rate: "-", period: "(30d)" },
    sellCompletion: { rate: "-", period: "(30d)" },
    avgPayTime: { time: "-", period: "(30d)" },
    avgReleaseTime: { time: "-", period: "(30d)" },
    tradePartners: 0,
    totalOrders30d: 0,
    totalOrdersLifetime: 0,
    tradeVolume30d: { amount: "0.00", currency: "USD", period: "(30d)" },
    tradeVolumeLifetime: { amount: "0.00", currency: "USD" },
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        const stats = await fetchUserStats(showAlert)
        setUserStats(stats)
      } catch (error) {
        // Error is already handled by showAlert in fetchUserStats
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [showAlert])

  if (isLoading) {
    return (
      <div className="flex flex-col items-start gap-2 self-stretch rounded-lg bg-gray-50 p-4">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-300 rounded w-full"></div>
            <div className="h-3 bg-gray-300 rounded w-5/6"></div>
            <div className="h-3 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-2 self-stretch rounded-lg bg-gray-50 p-4">
      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col items-start gap-1">
          <span className="text-sm font-medium text-gray-900">Buy completion</span>
          <span className="text-xs text-gray-500">{userStats.buyCompletion.period}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{userStats.buyCompletion.rate}</span>
      </div>

      <Divider />

      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col items-start gap-1">
          <span className="text-sm font-medium text-gray-900">Sell completion</span>
          <span className="text-xs text-gray-500">{userStats.sellCompletion.period}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{userStats.sellCompletion.rate}</span>
      </div>

      <Divider />

      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col items-start gap-1">
          <span className="text-sm font-medium text-gray-900">Avg pay time</span>
          <span className="text-xs text-gray-500">{userStats.avgPayTime.period}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{userStats.avgPayTime.time}</span>
      </div>

      <Divider />

      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col items-start gap-1">
          <span className="text-sm font-medium text-gray-900">Avg release time</span>
          <span className="text-xs text-gray-500">{userStats.avgReleaseTime.period}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{userStats.avgReleaseTime.time}</span>
      </div>

      <Divider />

      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col items-start gap-1">
          <span className="text-sm font-medium text-gray-900">Trade partners</span>
          <span className="text-xs text-gray-500">(lifetime)</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{userStats.tradePartners}</span>
      </div>

      <Divider />

      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col items-start gap-1">
          <span className="text-sm font-medium text-gray-900">Total orders</span>
          <span className="text-xs text-gray-500">(30d)</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{userStats.totalOrders30d}</span>
      </div>

      <Divider />

      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col items-start gap-1">
          <span className="text-sm font-medium text-gray-900">Total orders</span>
          <span className="text-xs text-gray-500">(lifetime)</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{userStats.totalOrdersLifetime}</span>
      </div>

      <Divider />

      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col items-start gap-1">
          <span className="text-sm font-medium text-gray-900">Trade volume</span>
          <span className="text-xs text-gray-500">{userStats.tradeVolume30d.period}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {userStats.tradeVolume30d.amount} {userStats.tradeVolume30d.currency}
        </span>
      </div>

      <Divider />

      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col items-start gap-1">
          <span className="text-sm font-medium text-gray-900">Trade volume</span>
          <span className="text-xs text-gray-500">(lifetime)</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">
          {userStats.tradeVolumeLifetime.amount} {userStats.tradeVolumeLifetime.currency}
        </span>
      </div>
    </div>
  )
}
