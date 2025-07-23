"use client"

import { useState, useEffect } from "react"
import StatsGrid from "@/app/profile/components/stats-grid"
import * as ProfileAPI from "@/app/profile/api"
import type { UserStats } from "@/app/profile/api/api-user-stats"

export default function StatsPage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)
        setError(null)
        const userStats = await ProfileAPI.UserStats.fetchUserStats()
        setStats(userStats)
      } catch (err) {
        console.error("Failed to fetch user stats:", err)
        setError("Failed to load statistics")
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-500">Loading statistics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Statistics</h1>
      <StatsGrid stats={stats} />
    </div>
  )
}
