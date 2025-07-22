import type React from "react"

interface StatsGridProps {
  stats: {
    trades: number
    volume: number
    tradePartners: number
    avgPayTime: {
      time: string
      period: string
    }
  }
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Stats */}
      {getStats(stats).map((stat, index) => (
        <div key={index} className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <dt className="mb-2 text-sm font-medium text-gray-500">{stat.label}</dt>
          <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">
            {stat.value}
            {stat.period && <span className="text-sm text-gray-500">/{stat.period}</span>}
          </dd>
        </div>
      ))}
    </div>
  )
}

const getStats = (stats: StatsGridProps["stats"]) => {
  return [
    {
      label: "Trades",
      value: stats.trades.toString(),
      period: "",
    },
    {
      label: "Volume",
      value: stats.volume.toString(),
      period: "",
    },
    {
      label: "Trade partners",
      value: stats.tradePartners.toString(),
      period: "",
    },
    {
      label: "Avg. pay time",
      value: stats.avgPayTime.time,
      period: stats.avgPayTime.period,
    },
  ]
}

export default StatsGrid
