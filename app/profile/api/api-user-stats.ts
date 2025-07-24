export interface UserStats {
  buyCompletion: {
    rate: string
    period: string
  }
  sellCompletion: {
    rate: string
    period: string
  }
  avgPayTime: {
    time: string
    period: string
  }
  avgReleaseTime: {
    time: string
    period: string
  }
  tradePartners: number
  totalOrders30d: number
  totalOrdersLifetime: number
  tradeVolume30d: {
    amount: string
    currency: string
    period: string
  }
  tradeVolumeLifetime: {
    amount: string
    currency: string
  }
}

export interface UserStatsResponse {
  data: UserStats
  error: string | null
}

const defaultStats: UserStats = {
  buyCompletion: { rate: "-", period: "(30d)" },
  sellCompletion: { rate: "-", period: "(30d)" },
  avgPayTime: { time: "-", period: "(30d)" },
  avgReleaseTime: { time: "-", period: "(30d)" },
  tradePartners: 0,
  totalOrders30d: 0,
  totalOrdersLifetime: 0,
  tradeVolume30d: { amount: "0.00", currency: "USD", period: "(30d)" },
  tradeVolumeLifetime: { amount: "0.00", currency: "USD" },
}

export async function fetchUserStats(): Promise<UserStatsResponse> {
  let error: string | null = null

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user-stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      error = `Failed to fetch user stats: ${response.status} ${response.statusText}`
      return {
        data: defaultStats,
        error,
      }
    }

    const data = await response.json()

    // Transform API response to match our UserStats interface
    const transformedStats: UserStats = {
      buyCompletion: {
        rate: data.buy_completion_rate || "-",
        period: data.buy_completion_period || "(30d)",
      },
      sellCompletion: {
        rate: data.sell_completion_rate || "-",
        period: data.sell_completion_period || "(30d)",
      },
      avgPayTime: {
        time: data.avg_pay_time || "-",
        period: data.avg_pay_time_period || "(30d)",
      },
      avgReleaseTime: {
        time: data.avg_release_time || "-",
        period: data.avg_release_time_period || "(30d)",
      },
      tradePartners: data.trade_partners || 0,
      totalOrders30d: data.total_orders_30d || 0,
      totalOrdersLifetime: data.total_orders_lifetime || 0,
      tradeVolume30d: {
        amount: data.trade_volume_30d_amount || "0.00",
        currency: data.trade_volume_30d_currency || "USD",
        period: data.trade_volume_30d_period || "(30d)",
      },
      tradeVolumeLifetime: {
        amount: data.trade_volume_lifetime_amount || "0.00",
        currency: data.trade_volume_lifetime_currency || "USD",
      },
    }

    return {
      data: transformedStats,
      error,
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "An unexpected error occurred"
    return {
      data: defaultStats,
      error,
    }
  }
}
