"use client"

import Image from "next/image"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface StatCardProps {
  title: string
  value: string | number
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="flex justify-between md:border-b border-slate-200 md:flex-col md:border-none pt-6 pb-2">
      <div className="flex items-center text-slate-500 mb-2 font-normal text-sm leading-5 tracking-normal">
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
        {title === "Trade volume (Lifetime)" && (
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
        {title === "Trade volume (30d)" && (
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
        {title === "Trade volume" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Image src="/icons/info-circle.png" alt="Info" width={12} height={12} className="ml-1 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="opacity-[0.72]">The total value of all trades completed.</p>
              <TooltipArrow className="fill-black" />
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="font-bold text-black text-base leading-6 tracking-normal">{value}</div>
    </div>
  )
}

export default function StatsGrid({ stats }) {
  return (
    <TooltipProvider>
      <div className="bg-transparent md:bg-slate-1500 rounded-lg md:px-4">
        <div className="md:hidden">
          <Tabs defaultValue="last30days" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="last30days" className="w-full data-[state=active]:font-bold">
                Last 30 days
              </TabsTrigger>
              <TabsTrigger value="lifetime" className="w-full data-[state=active]:font-bold">
                Lifetime
              </TabsTrigger>
            </TabsList>
            <TabsContent value="last30days" className="bg-slate-1500 mt-0 rounded-lg px-4">
              <div className="grid grid-cols-1 divide-y divide-slate-200">
                <StatCard
                  title="Sell completion"
                  value={
                    stats.statistics_30day?.completion_rate_sell
                      ? `${stats.statistics_30day.completion_rate_sell}%`
                      : "-"
                  }
                />
                <StatCard
                  title="Buy completion"
                  value={
                    stats.statistics_30day?.completion_rate_buy ? `${stats.statistics_30day.completion_rate_buy}%` : "-"
                  }
                />
                <StatCard
                  title="Avg. pay time"
                  value={stats.statistics_30day?.buy_time_average ? `${stats.statistics_30day.buy_time_average} mins` : "-"}
                />
                <StatCard
                  title="Avg. release time"
                  value={
                    stats.statistics_30day?.release_time_average
                      ? `${stats.statistics_30day.release_time_average} mins`
                      : "-"
                  }
                />
                <StatCard title="Total orders" value={stats.statistics_30day?.completion_count_all ?? "0"} />
                <StatCard
                  title="Trade volume"
                  value={
                    stats.statistics_30day?.completion_amount_all
                      ? `USD ${stats.statistics_30day.completion_amount_all}`
                      : "USD 0.00"
                  }
                />
              </div>
            </TabsContent>
            <TabsContent value="lifetime" className="bg-slate-1500 mt-0 rounded-lg px-4">
              <div className="grid grid-cols-1 divide-y divide-slate-200">
                <StatCard title="Trade partners" value={stats.statistics_lifetime?.partner_count ?? "0"} />
                <StatCard title="Total orders" value={stats.statistics_lifetime?.completion_count_all ?? "0"} />
                <StatCard
                  title="Trade volume"
                  value={
                    stats.statistics_lifetime?.completion_amount_all
                      ? `USD ${stats.statistics_lifetime.completion_amount_all}`
                      : "USD 0.00"
                  }
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-3 md:border-b border-slate-200">
            <StatCard
              title={`Buy completion (30d)`}
              value={
                stats.statistics_30day?.completion_rate_buy ? `${stats.statistics_30day.completion_rate_buy}%` : "-"
              }
            />
            <StatCard
              title={`Sell completion (30d)`}
              value={
                stats.statistics_30day?.completion_rate_sell ? `${stats.statistics_30day.completion_rate_sell}%` : "-"
              }
            />
            <StatCard title="Trade partners" value={stats.statistics_lifetime?.partner_count ?? "0"} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:border-b border-slate-200">
            <StatCard
              title={`Trade volume (30d)`}
              value={
                stats.statistics_30day?.completion_amount_all
                  ? `USD ${stats.statistics_30day.completion_amount_all}`
                  : "USD 0.00"
              }
            />
            <StatCard
              title="Trade volume (Lifetime)"
              value={
                stats.statistics_lifetime?.completion_amount_all
                  ? `USD ${stats.statistics_lifetime.completion_amount_all}`
                  : "USD 0.00"
              }
            />
            <StatCard
              title="Avg. pay time"
              value={stats.statistics_30day?.buy_time_average ? `${stats.statistics_30day.buy_time_average} mins` : "-"}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3">
            <StatCard title="Total orders 30d" value={stats.statistics_30day?.completion_count_all ?? "0"} />
            <StatCard title="Total orders (Lifetime)" value={stats.statistics_lifetime?.completion_count_all ?? "0"} />
            <StatCard
              title="Avg. release time"
              value={
                stats.statistics_30day?.release_time_average ? `${stats.statistics_30day.release_time_average} mins` : "-"
              }
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
