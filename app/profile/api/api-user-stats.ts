import { USER, API, AUTH } from "@/lib/local-variables"

export interface UserStats {
  buyCompletion: { rate: string; period: string }
  sellCompletion: { rate: string; period: string }
  avgPayTime: { time: string; period: string }
  avgReleaseTime: { time: string; period: string }
  tradePartners: number
  totalOrders30d: number
  totalOrdersLifetime: number
  tradeVolume30d: { amount: string; currency: string; period: string }
  tradeVolumeLifetime: { amount: string; currency: string }
}

export const fetchUserStats = async (): Promise<UserStats> => {
  const userId = USER.id
  const url = `${API.baseUrl}/users/${userId}`
  const headers = AUTH.getAuthHeader()

  const response = await fetch(url, {
    headers,
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch user stats: ${response.status} ${response.statusText}`)
  }

  const responseData = await response.json()

  if (responseData && responseData.data) {
    const data = responseData.data

    const formatTimeAverage = (seconds: number) => {
      if (!seconds || seconds <= 0) return "-"
      const mins = seconds / 60

      if (mins < 1) return "< 1 min"

      return `${Math.floor(mins)} min${Math.floor(mins) > 1 ? "s" : ""}`
    }

    const transformedStats: UserStats = {
      buyCompletion: {
        rate: `${Number(data.completion_average_30day) || 0}% (${Number(data.buy_count_30day) || 0})`,
        period: "(30d)",
      },
      sellCompletion: {
        rate: `${Number(data.completion_average_30day) || 0}% (${Number(data.sell_count_30day) || 0})`,
        period: "(30d)",
      },
      avgPayTime: {
        time: formatTimeAverage(Number(data.buy_time_average_30day)),
        period: "(30d)",
      },
      avgReleaseTime: {
        time: formatTimeAverage(Number(data.release_time_average_30day)),
        period: "(30d)",
      },
      tradePartners: Number(data.partner_count_lifetime) || 0,
      totalOrders30d: (Number(data.buy_count_30day) || 0) + (Number(data.sell_count_30day) || 0),
      totalOrdersLifetime: Number(data.order_count_lifetime) || 0,
      tradeVolume30d: {
        amount: ((Number(data.buy_amount_30day) || 0) + (Number(data.sell_amount_30day) || 0)).toFixed(2),
        currency: "USD",
        period: "(30d)",
      },
      tradeVolumeLifetime: {
        amount: data.order_amount_lifetime ? Number(data.order_amount_lifetime).toFixed(2) : "0.00",
        currency: "USD",
      },
    }

    return transformedStats
  }

  return {
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
}
