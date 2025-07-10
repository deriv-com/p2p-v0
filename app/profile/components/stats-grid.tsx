"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsGridProps {
  period: "30d" | "lifetime"
}

export function StatsGrid({ period }: StatsGridProps) {
  const statsData = {
    "30d": {
      totalOrders: 45,
      completionRate: 98.5,
      avgReleaseTime: "14m 32s",
      totalVolume: "12,450.00",
    },
    lifetime: {
      totalOrders: 234,
      completionRate: 97.8,
      avgReleaseTime: "16m 45s",
      totalVolume: "89,230.50",
    },
  }

  const currentStats = statsData[period]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-1500 rounded-lg">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total orders</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold">{currentStats.totalOrders}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Completion rate</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold">{currentStats.completionRate}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Avg. release time</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold">{currentStats.avgReleaseTime}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total volume</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold">${currentStats.totalVolume}</div>
        </CardContent>
      </Card>
    </div>
  )
}
