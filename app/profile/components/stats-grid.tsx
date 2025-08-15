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
    <div className="flex justify-between border-b border-slate-200 md:flex-col md:border-none pt-6 pb-2">
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

interface StatsGridProps {
  stats:
    | {
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
    | null
    | undefined
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const defaultStats = {
    buyCompletion: { rate: "N/A", period: "(30d)" },
    sellCompletion: { rate: "N/A", period: "(30d)" },
    avgPayTime: { time: "N/A", period: "(30d)" },
    avgReleaseTime: { time: "N/A", period: "(30d)" },
    tradePartners: 0,
    totalOrders30d: 0,
    totalOrdersLifetime: 0,
    tradeVolume30d: { amount: "0.00", currency: "USD", period: "(30d)" },
    tradeVolumeLifetime: { amount: "0.00", currency: "USD" },
  }

  const displayStats = stats || defaultStats

  return (
    <TooltipProvider>
      <div className="bg-transparent md:bg-slate-1500 rounded-lg px-4">
        <div className="md:hidden">
          <Tabs defaultValue="last30days" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 mb-6">
              <TabsTrigger
                value="last30days"
                className="py-3 px-4 text-center font-medium bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-black data-[state=active]:shadow-none text-slate-500 rounded-none"
              >
                Last 30 days
              </TabsTrigger>
              <TabsTrigger
                value="lifetime"
                className="py-3 px-4 text-center font-medium bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:text-black data-[state=active]:border-black data-[state=active]:shadow-none text-slate-500 rounded-none"
              >
                Lifetime
              </TabsTrigger>
            </TabsList>
            <TabsContent value="last30days" className="mt-0">
              <div className="grid grid-cols-1">
                  <StatCard title="Buy completion" value={displayStats.buyCompletion.rate} />
                  <StatCard title="Sell completion" value={displayStats.sellCompletion.rate} />
                  <StatCard
                    title="Trade volume"
                    value={`${displayStats.tradeVolume30d.currency} ${displayStats.tradeVolume30d.amount}`}
                  />
                  <StatCard title="Avg. pay time" value={displayStats.avgPayTime.time} />
                  <StatCard title="Total orders" value={displayStats.totalOrders30d} />
                  <StatCard title="Avg. release time" value={displayStats.avgReleaseTime.time} />
                  
                </div>
            </TabsContent>
            <TabsContent value="lifetime" className="mt-0">
                  <StatCard title="Trade partners" value={displayStats.tradePartners} />
                  <StatCard
                    title="Trade volume"
                    value={`${displayStats.tradeVolumeLifetime.currency} ${displayStats.tradeVolumeLifetime.amount}`}
                  />
                  <StatCard title="Total orders" value={displayStats.totalOrdersLifetime} />
                  
            </TabsContent>
          </Tabs>
        </div>

        <div className="hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-3 md:border-b border-slate-200">
            <StatCard
              title={`Buy completion ${displayStats.buyCompletion.period}`}
              value={displayStats.buyCompletion.rate}
            />
            <StatCard
              title={`Sell completion ${displayStats.sellCompletion.period}`}
              value={displayStats.sellCompletion.rate}
            />
            <StatCard title="Trade partners" value={displayStats.tradePartners} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:border-b border-slate-200">
            <StatCard
              title={`Trade volume ${displayStats.tradeVolume30d.period}`}
              value={`${displayStats.tradeVolume30d.currency} ${displayStats.tradeVolume30d.amount}`}
            />
            <StatCard
              title="Trade volume (Lifetime)"
              value={`${displayStats.tradeVolumeLifetime.currency} ${displayStats.tradeVolumeLifetime.amount}`}
            />
            <StatCard title={`Avg. pay time ${displayStats.avgPayTime.period}`} value={displayStats.avgPayTime.time} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3">
            <StatCard title={`Total orders ${displayStats.buyCompletion.period}`} value={displayStats.totalOrders30d} />
            <StatCard title="Total orders (Lifetime)" value={displayStats.totalOrdersLifetime} />
            <StatCard
              title={`Avg. release time ${displayStats.avgReleaseTime.period}`}
              value={displayStats.avgReleaseTime.time}
            />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
