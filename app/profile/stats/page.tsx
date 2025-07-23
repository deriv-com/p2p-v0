"use client"

import { useState, useEffect } from "react"
import { fetchUserStats, type UserStats } from "@/app/profile/api/api-user-stats"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { cn } from "@/lib/utils"

interface StatItemProps {
  label: string
  value: string | number | undefined
  period?: string
  showBorder?: boolean
}

function StatItem({ label, value, period, showBorder = true }: StatItemProps) {
  return (
    <div
      className={cn("flex justify-between items-center w-full py-3", {
        "border-b border-gray-200": showBorder,
      })}
    >
      <div className="flex flex-col items-start gap-1">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {period && <span className="text-xs text-gray-500">{period}</span>}
      </div>
      <span className="text-sm font-semibold text-gray-900">{value || "-"}</span>
    </div>
  )
}

export default function StatsPage() {
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
      <StatItem label="Buy completion" value={userStats.buyCompletion.rate} period={userStats.buyCompletion.period} />

      <StatItem
        label="Sell completion"
        value={userStats.sellCompletion.rate}
        period={userStats.sellCompletion.period}
      />

      <StatItem label="Avg pay time" value={userStats.avgPayTime.time} period={userStats.avgPayTime.period} />

      <StatItem
        label="Avg release time"
        value={userStats.avgReleaseTime.time}
        period={userStats.avgReleaseTime.period}
      />

      <StatItem label="Trade partners" value={userStats.tradePartners} period="(lifetime)" />

      <StatItem label="Total orders" value={userStats.totalOrders30d} period="(30d)" />

      <StatItem label="Total orders" value={userStats.totalOrdersLifetime} period="(lifetime)" />

      <StatItem
        label="Trade volume"
        value={`${userStats.tradeVolume30d.amount} ${userStats.tradeVolume30d.currency}`}
        period={userStats.tradeVolume30d.period}
      />

      <StatItem
        label="Trade volume"
        value={`${userStats.tradeVolumeLifetime.amount} ${userStats.tradeVolumeLifetime.currency}`}
        period="(lifetime)"
        showBorder={false}
      />
    </div>
  )
}
