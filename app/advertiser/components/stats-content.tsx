"use client"

import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import Image from "next/image"

interface AdvertiserProfile {
  id: string | number
  nickname: string
  brand: string
  country_code: string
  created_at: number
  adverts_are_listed: boolean
  blocked_by_user_count: number
  favourited_by_user_count: number
  is_blocked: boolean
  is_favourite: boolean
  temp_ban_until: number | null
  trade_band: string
  order_count_lifetime: number
  order_amount_lifetime: string
  partner_count_lifetime: number
  rating_average_lifetime: number
  recommend_average_lifetime: number
  recommend_count_lifetime: number
  buy_amount_30day: string
  buy_count_30day: number
  buy_time_average_30day: number
  sell_amount_30day: string
  sell_count_30day: number
  release_time_average_30day: number
  rating_average_30day: number
  completion_average_30day: number
}

interface StatsContentProps {
  profile: AdvertiserProfile | null
}

export default function StatsContent({ profile }: StatsContentProps) {
  const getDuration = (duration: number | null | undefined) => {
    if (duration == null || duration <= 0) return "-"

    const newDuration = duration / 60
    if (newDuration < 1) return "< 1 min"

    return newDuration.toFixed(2).toString() + " mins"
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex flex-col">
        <div className="flex justify-between text-sm border-b py-6">
            <div className="text-sm text-slate-500">Buy completion rate (30d)</div>
            <div className="font-bold mt-1">{profile?.statistics_30day?.completion_rate_buy ? `${profile?.statistics_30day?.completion_rate_buy}% (${profile?.statistics_30day?.completion_count_buy})` :  "-"}</div>
          </div>
          <div className="flex justify-between text-sm border-b py-6">
            <div className="text-sm text-slate-500">Sell completion rate (30d)</div>
            <div className="font-bold mt-1">{profile?.statistics_30day?.completion_rate_sell ? `${profile?.statistics_30day?.completion_rate_sell}% (${profile?.statistics_30day?.completion_count_sell})` :  "-"}</div>
          </div>
          <div className="flex justify-between text-sm border-b py-6">
            <div className="text-sm text-slate-500">Total trades (30d)</div>
            <div className="font-bold mt-1">{profile?.statistics_30day?.completion_count_all}</div>
          </div>
          <div className="flex justify-between text-sm border-b py-6">
            <div className="text-sm text-slate-500">Total all time trades</div>
            <div className="font-bold mt-1">{profile?.statistics_lifetime?.completion_count_all}</div>
          </div>
          <div className="flex justify-between text-sm border-b py-6">
            <div className="text-sm text-slate-500">Avg. pay time (30d)</div>
            <div className="font-bold mt-1">{getDuration(profile?.statistics_30day?.buy_time_average)}</div>
          </div>
          <div className="flex justify-between text-sm border-b py-6">
            <div className="text-sm text-slate-500">Avg. release time (30d)</div>
            <div className="font-bold mt-1">{getDuration(profile?.statistics_30day?.release_time_average)}</div>
          </div>
          <div className="flex justify-between text-sm border-b py-6">
            <div className="flex items-center text-sm text-slate-500">
              Trade partners
              <Tooltip>
                <TooltipTrigger asChild>
                  <Image
                    src="/icons/info-circle.png"
                    alt="Info"
                    width={12}
                    height={12}
                    className="ml-1 cursor-pointer"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="opacity-[0.72]">Total number of users successfully traded with.</p>
                  <TooltipArrow className="fill-black" />
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="font-bold mt-1">{profile?.statistics_lifetime?.partner_count}</div>
          </div>
          <div className="flex justify-between text-sm border-b py-6">
            <div className="flex items-center text-sm text-slate-500">
              Trade volume (30d)
              <Tooltip>
                <TooltipTrigger asChild>
                  <Image
                    src="/icons/info-circle.png"
                    alt="Info"
                    width={12}
                    height={12}
                    className="ml-1 cursor-pointer"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="opacity-[0.72]">Total value of trades completed in the last 30 days.</p>
                  <TooltipArrow className="fill-black" />
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="font-bold mt-1">{`USD ${(Number.parseFloat(profile?.statistics_30day?.completion_amount_all || "0")).toFixed(2)}`}</div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
