"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsData {
  id: number
  created_at: number
  status: string
  nickname: string
  external_user_id: string
  brand: string
  adverts_are_listed: boolean
  country_code: string
  rating_average_lifetime: number | null
  rating_average_30day: number
  recommend_average_lifetime: number
  recommend_count_lifetime: number
  order_amount_lifetime: string
  order_count_lifetime: number
  completion_average_30day: number
  buy_count_30day: number
  sell_count_30day: number
  buy_amount_30day: string
  sell_amount_30day: string
  buy_time_average_30day: number
  release_time_average_30day: number
  blocked_by_user_count: number
  favourited_by_user_count: number
  partner_count_lifetime: number
  balances: Array<{
    wallet_id: string
    amount: string
    currency: string
  }>
  daily_limits: {
    buy: string
    sell: string
  }
  daily_limits_remaining: {
    buy: string
    sell: string
  }
  order_cancellations: {
    count: number
    limit: number
  }
  trade_band: string
}

interface StatsGridProps {
  data?: StatsData
  isLoading?: boolean
}

export default function StatsGrid({ data, isLoading }: StatsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No stats data available</p>
      </div>
    )
  }

  const stats = [
    {
      label: "Total orders",
      value: data.order_count_lifetime?.toString() || "0",
    },
    {
      label: "Buy orders",
      value: data.buy_count_30day?.toString() || "0",
    },
    {
      label: "Sell orders",
      value: data.sell_count_30day?.toString() || "0",
    },
    {
      label: "Completion rate",
      value: data.completion_average_30day ? `${data.completion_average_30day}%` : "0%",
    },
    {
      label: "Avg release time",
      value: data.buy_time_average_30day ? `${data.buy_time_average_30day}m` : "0m",
    },
    {
      label: "Avg pay time",
      value: data.release_time_average_30day ? `${data.release_time_average_30day}m` : "0m",
    },
    {
      label: "Trade partners",
      value: data.partner_count_lifetime?.toString() || "0",
    },
    {
      label: "Total turnover",
      value: data.order_amount_lifetime ? `$${data.order_amount_lifetime}` : "$0.00",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">{stat.label}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
