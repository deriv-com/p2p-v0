"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Info } from "lucide-react"
import { ProfileAPI } from "../api"
import type { UserStats } from "../api/api-user-stats"
import { cn } from "@/lib/utils"
import { useAlertDialog } from "@/hooks/use-alert-dialog"

export default function StatsPage() {
  const router = useRouter()
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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadUserStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await ProfileAPI.UserStats.fetchUserStats()

        if ("error" in result) {
          showWarningDialog({
            title: "Error",
            description: result.error,
          })
          setError(result.error)
        } else {
          setUserStats(result)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load stats"
        setError(errorMessage)
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

  const handleBack = () => {
    router.push("/profile")
  }

  const statsConfig = [
    {
      label: "Sell completion",
      getValue: (stats: UserStats) => stats.sellCompletion.rate,
      hasInfo: false,
    },
    {
      label: "Buy completion",
      getValue: (stats: UserStats) => stats.buyCompletion.rate,
      hasInfo: false,
    },
    {
      label: "Avg. pay time",
      getValue: (stats: UserStats) => stats.avgPayTime.time,
      hasInfo: false,
    },
    {
      label: "Avg. release time",
      getValue: (stats: UserStats) => stats.avgReleaseTime.time,
      hasInfo: false,
    },
    {
      label: "Trade partners",
      getValue: (stats: UserStats) => stats.tradePartners,
      hasInfo: false,
    },
    {
      label: "Total orders (30d)",
      getValue: (stats: UserStats) => stats.totalOrders30d,
      hasInfo: false,
    },
    {
      label: "Total orders (lifetime)",
      getValue: (stats: UserStats) => stats.totalOrdersLifetime,
      hasInfo: false,
    },
    {
      label: "Trade volume (30d)",
      getValue: (stats: UserStats) => `${stats.tradeVolume30d.currency} ${stats.tradeVolume30d.amount}`,
      hasInfo: true,
    },
    {
      label: "Trade volume (lifetime)",
      getValue: (stats: UserStats) => `${stats.tradeVolumeLifetime.currency} ${stats.tradeVolumeLifetime.amount}`,
      hasInfo: true,
    },
  ]

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
    <div
      className={cn("flex justify-between items-center w-full py-3", {
        "border-b border-gray-200": showBorder,
      })}
    >
      <div className="flex items-center gap-1">
        <span className="text-gray-600 text-sm">{label}</span>
        {hasInfo && <Info className="size-4 text-gray-400" />}
      </div>
      <span className="text-black font-semibold text-sm">{value !== undefined && value !== null ? value : "-"}</span>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4 flex items-center gap-3 z-10">
        <Button variant="ghost" size="sm" onClick={handleBack} className="p-2">
          <Image src="/icons/back-circle.png" alt="Back" width={24} height={24} />
        </Button>
        <h1 className="text-lg font-semibold">Stats</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <div className="animate-pulse flex flex-col items-start gap-2 self-stretch rounded-lg bg-gray-50 p-4">
              {[...Array(9)].map((_, i) => (
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
            <div className="flex flex-col items-start gap-2 self-stretch rounded-lg bg-gray-50 p-4">
              {statsConfig.map((stat, index) => (
                <StatItem
                  key={stat.label}
                  label={stat.label}
                  value={stat.getValue(userStats)}
                  hasInfo={stat.hasInfo}
                  showBorder={index < statsConfig.length - 1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
