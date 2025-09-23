"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronRight } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
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

interface AdvertiserStatsProps {
  profile: AdvertiserProfile | null
}

export default function AdvertiserStats({ profile }: AdvertiserStatsProps) {
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
  const isMobile = useIsMobile()

  const getDuration = (duration: number | null | undefined) => {
    if (duration == null || duration <= 0) return "-"

    const newDuration = duration / 60 / 60
    if (newDuration < 1) return "< 1 min"

    return newDuration.toFixed(2).toString() + " mins"
  }

  // Calculate buy and sell completion rates
  const buyCompletionRate = profile?.completion_average_30day || 100
  const sellCompletionRate = profile?.completion_average_30day || 100
  const buyCount = profile?.buy_count_30day || 25
  const sellCount = profile?.sell_count_30day || 20
  const totalTrades30d = (profile?.buy_count_30day || 0) + (profile?.sell_count_30day || 0) || 45
  const totalAllTimeTrades = profile?.order_count_lifetime || 580

  return (
    <TooltipProvider>
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 border border-[#E9ECEF] rounded-lg">
          <div className="flex items-center gap-8 flex-1 overflow-x-auto">
            <div className="flex-shrink-0">
              <div className="text-lg font-bold">
                {buyCompletionRate}% ({buyCount})
              </div>
              <div className="text-xs text-slate-500">Buy completion rate (30d)</div>
            </div>
            <div className="flex-shrink-0">
              <div className="text-lg font-bold">
                {sellCompletionRate}% ({sellCount})
              </div>
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
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 flex-shrink-0 ml-4"
            onClick={() => setIsStatsModalOpen(true)}
          >
            View more
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      {isMobile ? (
        <Drawer open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Complete Statistics</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-6">
              {/* Primary Stats */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:flex gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Rating</div>
                    <div className="flex items-center mt-[5.27px]">
                      {profile?.rating_average_lifetime && (
                        <Image src="/icons/star-icon.png" alt="Star" width={20} height={20} className="mr-1" />
                      )}
                      {profile?.rating_average_lifetime ? (
                        <span className="font-bold text-base">{profile?.rating_average_lifetime}/5</span>
                      ) : (
                        <span className="font-bold text-base">Not rated yet</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-xs text-slate-500">
                      Recommended
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
                          <p className="opacity-[0.72]">Recommended by {profile?.recommend_count_lifetime} traders</p>
                          <TooltipArrow className="fill-black" />
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center mt-1">
                      {profile?.recommend_average_lifetime ? (
                        <span className="font-bold text-base">{profile?.recommend_average_lifetime}%</span>
                      ) : (
                        <span className="font-bold text-base">Not recommended yet</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Total orders</div>
                    <div className="font-bold text-lg mt-1">{profile?.order_count_lifetime}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center text-xs text-slate-500">
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
                  <div className="font-bold mt-1">{`USD ${(Number.parseFloat(profile?.buy_amount_30day || "0") + Number.parseFloat(profile?.sell_amount_30day || "0")).toFixed(2)}`}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Avg. pay time (30d)</div>
                  <div className="font-bold mt-1">{getDuration(profile?.buy_time_average_30day)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Avg. release time (30d)</div>
                  <div className="font-bold mt-1">{getDuration(profile?.release_time_average_30day)}</div>
                </div>
                <div>
                  <div className="flex items-center text-xs text-slate-500">
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
                  <div className="font-bold mt-1">{profile?.partner_count_lifetime}</div>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        /* Desktop Popup */
        <Dialog open={isStatsModalOpen} onOpenChange={setIsStatsModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Complete Statistics</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Primary Stats */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex gap-6">
                  <div>
                    <div className="text-xs text-slate-500">Rating</div>
                    <div className="flex items-center mt-[5.27px]">
                      {profile?.rating_average_lifetime && (
                        <Image src="/icons/star-icon.png" alt="Star" width={20} height={20} className="mr-1" />
                      )}
                      {profile?.rating_average_lifetime ? (
                        <span className="font-bold text-base">{profile?.rating_average_lifetime}/5</span>
                      ) : (
                        <span className="font-bold text-base">Not rated yet</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-xs text-slate-500">
                      Recommended
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
                          <p className="opacity-[0.72]">Recommended by {profile?.recommend_count_lifetime} traders</p>
                          <TooltipArrow className="fill-black" />
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex items-center mt-1">
                      {profile?.recommend_average_lifetime ? (
                        <span className="font-bold text-base">{profile?.recommend_average_lifetime}%</span>
                      ) : (
                        <span className="font-bold text-base">Not recommended yet</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Total orders</div>
                    <div className="font-bold text-lg mt-1">{profile?.order_count_lifetime}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center text-xs text-slate-500">
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
                  <div className="font-bold mt-1">{`USD ${(Number.parseFloat(profile?.buy_amount_30day || "0") + Number.parseFloat(profile?.sell_amount_30day || "0")).toFixed(2)}`}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Avg. pay time (30d)</div>
                  <div className="font-bold mt-1">{getDuration(profile?.buy_time_average_30day)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Avg. release time (30d)</div>
                  <div className="font-bold mt-1">{getDuration(profile?.release_time_average_30day)}</div>
                </div>
                <div>
                  <div className="flex items-center text-xs text-slate-500">
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
                  <div className="font-bold mt-1">{profile?.partner_count_lifetime}</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </TooltipProvider>
  )
}
