"use client"
import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import StatsGrid from "./stats-grid"

interface MobileStatsPageProps {
  onBack: () => void
}

interface UserStats {
  totalOrders: number
  completedOrders: number
  completionRate: string
  avgReleaseTime: string
  avgPayTime: string
  totalTrades: number
  buyOrders: number
  sellOrders: number
}

export default function MobileStatsPage({ onBack }: MobileStatsPageProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        // Simulate API call - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const mockStats: UserStats = {
          totalOrders: 156,
          completedOrders: 142,
          completionRate: "91.0%",
          avgReleaseTime: "14 min",
          avgPayTime: "12 min",
          totalTrades: 298,
          buyOrders: 78,
          sellOrders: 78,
        }

        setStats(mockStats)
      } catch (err) {
        setError("Failed to load stats")
        console.error("Error fetching stats:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
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
        {isLoading ? (
          <div className="space-y-4">
            {/* Loading skeletons */}
            <div className="animate-pulse">
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-20 rounded-lg"></div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <StatsGrid />
        )}
      </div>
    </div>
  )
}
