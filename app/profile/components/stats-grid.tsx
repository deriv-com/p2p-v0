"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { ProfileAPI } from "../api"
import type { UserStats } from "../api/api-user-stats"
import { useAlertDialog } from "@/hooks/use-alert-dialog"

export default function StatsGrid() {
  const { showWarningDialog } = useAlertDialog()
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
    const loadUserStats = async () => {
      try {
        setIsLoading(true)
        const response = await ProfileAPI.UserStats.fetchUserStats()

        if (response.error) {
          showWarningDialog({
            title: "Error",
            description: response.error,
          })
        }

        setUserStats(response.data)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load stats"
        showWarningDialog({
          title: "Error",
          description: errorMessage,
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUserStats()
  }, [showWarningDialog])

  const stats = [
    {
      title: `Buy completion ${userStats.buyCompletion.period}`,
      value: userStats.buyCompletion.rate,
    },
    {
      title: `Sell completion ${userStats.sellCompletion.period}`,
      value: userStats.sellCompletion.rate,
    },
    {
      title: `Avg. pay time ${userStats.avgPayTime.period}`,
      value: userStats.avgPayTime.time,
    },
    {
      title: `Avg. release time ${userStats.avgReleaseTime.period}`,
      value: userStats.avgReleaseTime.time,
    },
    {
      title: "Trade partners",
      value: userStats.tradePartners.toString(),
    },
    {
      title: `Trade volume ${userStats.tradeVolume30d.period}`,
      value: `${userStats.tradeVolume30d.currency} ${userStats.tradeVolume30d.amount}`,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
            <p className="text-lg font-semibold">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
