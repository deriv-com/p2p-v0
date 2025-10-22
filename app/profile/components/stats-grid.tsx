"use client"

import Image from "next/image"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface StatCardProps {
  tab: string
  title: string
  value: string | number
}

function StatCard({ tab, title, value }: StatCardProps) {
  return (
    <div className="flex flex-row-reverse justify-between md:border-b border-slate-200 md:flex-col md:border-none pt-6 pb-2">
      <div className="font-bold text-black text-base leading-6 tracking-normal">
        {value}
      </div>
      <div className="flex items-center text-slate-500 mb-2 font-normal text-xs leading-5 tracking-normal">
        {title}
        {title === "Trade partners" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Image src="/icons/info-circle.png" alt="Info" width={12} height={12} className="ml-1 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="opacity-[0.72]">Total number of users you've successfully traded with.</p>
              <TooltipArrow className="fill-black" />
            </TooltipContent>
          </Tooltip>
        )}
        {title === "Trade volume" && tab === "lifetime" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Image src="/icons/info-circle.png" alt="Info" width={12} height={12} className="ml-1 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="opacity-[0.72]">The total value of all trades completed in your lifetime.</p>
              <TooltipArrow className="fill-black" />
            </TooltipContent>
          </Tooltip>
        )}
        {title === "Trade volume" && tab === "last30days" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Image src="/icons/info-circle.png" alt="Info" width={12} height={12} className="ml-1 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="opacity-[0.72]">The total value of all completed trades in the last 30 days.</p>
              <TooltipArrow className="fill-black" />
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

export default function StatsGrid({ stats }) {
  const formatAmount = (amount) => {
    return Number.parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  return (
    <TooltipProvider>
      <div className="bg-transparent rounded-lg">
        <div>
          <Tabs defaultValue="last30days" className="w-full">
            <TabsList className="bg-[#F5F5F5] rounded-2xl p-2 h-auto ">
              <TabsTrigger
                value="last30days"
                className="py-2 px-4 rounded-xl transition-all font-normal text-base data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-slate-500 hover:text-slate-700 "
              >
                Last 30 days
              </TabsTrigger>
              <TabsTrigger
                value="lifetime"
                className="py-2 px-4 rounded-xl transition-all font-normal text-base data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-slate-500 hover:text-slate-700 "
              >
                Lifetime
              </TabsTrigger>
            </TabsList>
            <TabsContent value="last30days" className="mt-0 rounded-lg px-4 bg-transparent">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y divide-slate-200">
                <StatCard title="Sell completion" value={stats?.statistics_30day?.completion_rate_sell ? `${stats.statistics_30day.completion_rate_sell}% (${stats.statistics_30day.completion_count_sell})` : "-"} />
                <StatCard title="Buy completion" value={stats?.statistics_30day?.completion_rate_buy ? `${stats.statistics_30day.completion_rate_buy}% (${stats.statistics_30day.completion_count_buy})` : "-"} />
                <StatCard title="Total orders" value={stats?.statistics_30day?.completion_count_all ?? "0"} />
                <StatCard title="Avg. pay time" value={stats?.statistics_30day?.buy_time_average ?? "-"} />
                <StatCard title="Avg. release time" value={stats?.statistics_30day?.release_time_average ?? "-"} />
                <StatCard
                  tab="last30days"
                  title="Trade volume"
                  value={stats?.statistics_30day?.completion_amount_all > 0 ? `${formatAmount(stats?.statistics_30day?.completion_amount_all)} USD` : "0.00 USD"}
                />
              </div>
            </TabsContent>
            <TabsContent value="lifetime" className="mt-0 rounded-lg px-4 bg-transparent">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y divide-slate-200">
                <StatCard title="Sell completion" value={stats?.statistics_lifetime?.completion_rate_sell ? `${stats.statistics_lifetime.completion_rate_sell}% (${stats.statistics_lifetime.completion_count_sell})` : "-"} />
                <StatCard title="Buy completion" value={stats?.statistics_lifetime?.completion_rate_buy ? `${stats.statistics_lifetime.completion_rate_buy}% (${stats.statistics_lifetime.completion_count_buy})` : "-"} />
                <StatCard title="Total orders" value={stats?.statistics_lifetime?.completion_count_all ?? "0"} />
                <StatCard title="Avg. pay time" value={stats?.statistics_lifetime?.buy_time_average ?? "-"} />
                <StatCard title="Avg. release time" value={stats?.statistics_lifetime?.release_time_average ?? "-"} />
                <StatCard title="Trade partners" value={stats?.statistics_lifetime?.partner_count ?? "0"} />
                <StatCard
                  tab="lifetime"
                  title="Trade volume"
                  value={stats?.statistics_lifetime?.completion_amount_all > 0 ? `${formatAmount(stats?.statistics_lifetime?.completion_amount_all)} USD` : "0.00 USD"}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
}
