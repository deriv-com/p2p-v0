"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { TooltipProvider } from "@/components/ui/tooltip"
import Image from "next/image"
import { useIsMobile } from "@/hooks/use-mobile"
import StatsContent from "./stats-content"

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

interface AdvertiserStatsProps {
  profile: AdvertiserProfile | null
}

export default function AdvertiserStats({ profile }: AdvertiserStatsProps) {
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const isMobile = useIsMobile()
  
  const buyCompletionRate = profile?.completion_average_30day
  const sellCompletionRate = profile?.completion_average_30day
  const buyCount = profile?.buy_count_30day || 0
  const sellCount = profile?.sell_count_30day || 0
  const totalTrades30d = (profile?.buy_count_30day || 0) + (profile?.sell_count_30day || 0) || 0
  const totalAllTimeTrades = profile?.order_count_lifetime || 0

  return (
    <TooltipProvider>
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 border border-[#E9ECEF] rounded-lg">
          <div className="flex items-center gap-8 flex-1 overflow-x-auto">
            <div className="flex-shrink-0">
              {buyCompletionRate ? 
                <div className="text-lg font-bold">
                  {buyCompletionRate}% ({buyCount})
                </div> :
                <div className="text-lg font-bold">
                  -
                </div>
              }
              <div className="text-xs text-slate-500">Buy completion rate (30d)</div>
            </div>
            <div className="flex-shrink-0">
              { sellCompletionRate ?
                <div className="text-lg font-bold">
                  {sellCompletionRate}% ({sellCount})
                </div> : 
                <div className="text-lg font-bold">
                  {sellCompletionRate}% ({sellCount})
                </div>
              }
              <div className="text-xs text-slate-500">Sell completion rate (30d)</div>
            </div>
            <div className="flex-shrink-0">
              <div className="text-lg font-bold">{totalTrades30d}</div>
              <div className="text-xs text-slate-500">Total trades (30d)</div>
            </div>
            <div className="flex-shrink-0">
              <div className="text-lg font-bold">{totalAllTimeTrades}</div>
              <div className="text-xs text-slate-500">Total all time trades</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-4"
            onClick={() => setIsStatsModalOpen(true)}
          >
            View more
            <Image src="/icons/chevron-right-sm.png" width={20} height={}/>
          </Button>
        </div>
      </div>
      {isMobile ? (
        <Drawer open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Complete Statistics</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <StatsContent profile={profile} isMobile={true} />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Complete Statistics</DialogTitle>
            </DialogHeader>
            <StatsContent profile={profile} isMobile={false} />
          </DialogContent>
        </Dialog>
      )}
    </TooltipProvider>
  )
}
