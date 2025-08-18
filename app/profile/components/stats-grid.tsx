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
      <div className="font-bold text-black text-base leading-6 tracking-normal">
        {value !== undefined && value !== null ? value : "N/A"}
      </div>
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
              <TabsTrigger
                value="last30days"
                className="w-full data-[state=active]:font-bold"
              >
                Last 30 days
              </TabsTrigger>
              <TabsTrigger
                value="lifetime"
                className="w-full data-[state=active]:font-bold"
              >
                Lifetime
              </TabsTrigger>
            </TabsList>
            <TabsContent value="last30days" className="bg-slate-1500 mt-0 rounded-lg px-4">
              <div className="grid grid-cols-1 divide-y divide-slate-200">
                    <StatCard title="Sell completion" value={stats.completion_average_30day} />
                  <StatCard title="Buy completion" value={stats.buy_time_average_30day} />
                  <StatCard title="Avg. pay time" value={stats.completion_average_30day} />
                  <StatCard title="Avg. release time" value={stats.release_time_average_30day} />
                  <StatCard title="Total orders" value={stats.partner_count_lifetime} />
                  <StatCard
                    title="Trade volume"
                    value={`USD ${stats.completion_average_30day}`}
                  />
                </div>
            </TabsContent>
            <TabsContent value="lifetime" className="bg-slate-1500 mt-0 rounded-lg px-4">
            <div className="grid grid-cols-1 divide-y divide-slate-200">
                  <StatCard title="Trade partners" value={stats.partner_count_lifetime} />
                  <StatCard title="Total orders" value={stats.partner_count_lifetime} />
                  <StatCard
                    title="Trade volume"
                    value={`USD ${stats.completion_average_30day}`}
                  />
                  </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-3 md:border-b border-slate-200">
            <StatCard
              title={`Buy completion (30d)`}
              value={stats.buy_time_average_30day}
            />
            <StatCard
              title={`Sell completion (30d)`}
              value={stats.completion_average_30day}
            />
            <StatCard title="Trade partners" value={stats.partner_count_lifetime} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:border-b border-slate-200">
            <StatCard
              title={`Trade volume (30d)`}
              value={`USD ${stats.completion_average_30day}`}
            />
            <StatCard
              title="Trade volume (Lifetime)"
              value={`USD ${stats.completion_average_30day}`}
            />
            <StatCard title={`Avg. pay time`} value={stats.avgPayTime.time} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3">
            <StatCard title="Total orders 30d" value={displayStats.totalOrders30d} />
            <StatCard title="Total orders (Lifetime)" value={displayStats.totalOrdersLifetime} />
            <StatCard
              title="Avg. release time"
              value={displayStats.avgReleaseTime.time}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
