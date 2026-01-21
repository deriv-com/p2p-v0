"use client"

import Image from "next/image"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useTranslations } from "@/lib/i18n/use-translations"

interface StatCardProps {
  tab: string
  title: string
  value: string | number
}

function StatCard({ tab, title, value }: StatCardProps) {
  return (
    <div className="flex flex-row-reverse justify-between md:border-none md:flex-col md:h-20 pt-6 pb-2">
      <div className="font-bold text-black text-base leading-6 tracking-normal">{value}</div>
      <div className="flex items-center text-slate-500 mb-2 font-normal text-xs leading-5 tracking-normal">
        {title}
        {title === "Trade partners" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Image
                src="/icons/info-circle.svg"
                alt="Info"
                width={24}
                height={24}
                className="ml-1 cursor-pointer flex-shrink-0"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-white">Total number of users you've successfully traded with.</p>
              <TooltipArrow className="fill-black" />
            </TooltipContent>
          </Tooltip>
        )}
        {title === "Trade volume" && tab === "lifetime" && (
          <Tooltip>
            <TooltipTrigger asChild>
               <Image
                src="/icons/info-circle.svg"
                alt="Info"
                width={24}
                height={24}
                className="ml-1 cursor-pointer flex-shrink-0"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-white">The total value of all trades completed in your lifetime.</p>
              <TooltipArrow className="fill-black" />
            </TooltipContent>
          </Tooltip>
        )}
        {title === "Trade volume" && tab === "last30days" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Image
                src="/icons/info-circle.svg"
                alt="Info"
                width={24}
                height={24}
                className="ml-1 cursor-pointer flex-shrink-0"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-white">The total value of all completed trades in the last 30 days.</p>
              <TooltipArrow className="fill-black" />
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  )
}

export default function StatsGrid({ stats }) {
  const { t } = useTranslations()

  const formatAmount = (amount) => {
    return Number.parseFloat(amount).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatTimeInMinutes = (seconds: number | null | undefined) => {
    if (seconds == null || seconds <= 0) return "-"

    const minutes = seconds / 60

    if (minutes < 1) return t("profile.lessThanOneMin")

    return `${minutes.toFixed(2)} ${t("profile.mins")}`
  }

  return (
    <TooltipProvider>
      <div className="bg-transparent rounded-lg px-2 md:px-0">
        <div>
          <Tabs defaultValue="last30days">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="last30days" className="flex-1 md:flex-none md:w-32">{t("profile.last30Days")}</TabsTrigger>
              <TabsTrigger value="lifetime" className="flex-1 md:flex-none md:w-32">{t("profile.lifetime")}</TabsTrigger>
            </TabsList>
            <TabsContent value="last30days" className="mt-0 rounded-lg px-0 md:px-0   bg-transparent">
              <div className="flex flex-col divide-y divide-black/[0.08]">
                <div className="flex flex-col divide-y divide-black/[0.08] md:divide-y-0 md:grid md:grid-cols-4">
                  <StatCard
                    tab="last30days"
                    title={t("profile.sellCompletion")}
                    value={
                      stats?.statistics_30day?.completion_rate_sell
                        ? `${stats.statistics_30day.completion_rate_sell}% (${stats.statistics_30day.completion_count_sell})`
                        : "-"
                    }
                  />
                  <StatCard
                    tab="last30days"
                    title={t("profile.buyCompletion")}
                    value={
                      stats?.statistics_30day?.completion_rate_buy
                        ? `${stats.statistics_30day.completion_rate_buy}% (${stats.statistics_30day.completion_count_buy})`
                        : "-"
                    }
                  />
                  <StatCard
                    tab="last30days"
                    title={t("profile.totalOrders")}
                    value={stats?.statistics_30day?.completion_count_all ?? "0"}
                  />
                  <StatCard
                    tab="last30days"
                    title={t("profile.avgPayTime")}
                    value={formatTimeInMinutes(stats?.statistics_30day?.buy_time_average)}
                  />
                </div>
                <div className="flex flex-col divide-y divide-black/[0.08] md:divide-y-0 md:grid md:grid-cols-4">
                  <StatCard
                    tab="last30days"
                    title={t("profile.avgReleaseTime")}
                    value={formatTimeInMinutes(stats?.statistics_30day?.release_time_average)}
                  />
                  <StatCard
                    tab="last30days"
                    title={t("profile.tradeVolume")}
                    value={
                      stats?.statistics_30day?.completion_amount_all > 0
                        ? `${formatAmount(stats?.statistics_30day?.completion_amount_all)} USD`
                        : "0.00 USD"
                    }
                  />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="lifetime" className="mt-0 rounded-lg px-0 md:px-0  bg-transparent">
              <div className="flex flex-col divide-y divide-black/[0.08]">
                <div className="flex flex-col divide-y divide-black/[0.08] md:divide-y-0 md:grid md:grid-cols-4">
                  <StatCard
                    tab="lifetime"
                    title={t("profile.sellCompletion")}
                    value={
                      stats?.statistics_lifetime?.completion_rate_sell
                        ? `${stats.statistics_lifetime.completion_rate_sell}% (${stats.statistics_lifetime.completion_count_sell})`
                        : "-"
                    }
                  />
                  <StatCard
                    tab="lifetime"
                    title={t("profile.buyCompletion")}
                    value={
                      stats?.statistics_lifetime?.completion_rate_buy
                        ? `${stats.statistics_lifetime.completion_rate_buy}% (${stats.statistics_lifetime.completion_count_buy})`
                        : "-"
                    }
                  />
                  <StatCard
                    tab="lifetime"
                    title={t("profile.totalOrders")}
                    value={stats?.statistics_lifetime?.completion_count_all ?? "0"}
                  />
                  <StatCard
                    tab="lifetime"
                    title={t("profile.avgPayTime")}
                    value={formatTimeInMinutes(stats?.statistics_lifetime?.buy_time_average)}
                  />
                </div>
                <div className="flex flex-col divide-y divide-black/[0.08] md:divide-y-0 md:grid md:grid-cols-4">
                  <StatCard
                    tab="lifetime"
                    title={t("profile.avgReleaseTime")}
                    value={formatTimeInMinutes(stats?.statistics_lifetime?.release_time_average)}
                  />
                  <StatCard
                    tab="lifetime"
                    title={t("profile.tradePartners")}
                    value={stats?.statistics_lifetime?.partner_count ?? "0"}
                  />
                  <StatCard
                    tab="lifetime"
                    title={t("profile.tradeVolume")}
                    value={
                      stats?.statistics_lifetime?.completion_amount_all > 0
                        ? `${formatAmount(stats?.statistics_lifetime?.completion_amount_all)} USD`
                        : "0.00 USD"
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </TooltipProvider>
  )
}
