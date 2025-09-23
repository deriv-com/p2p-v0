"use client"

export const runtime = 'edge'

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { USER } from "@/lib/local-variables"
import { BuySellAPI } from "@/services/api"
import type { Advertisement } from "@/services/api/api-buy-sell"
import { toggleFavouriteAdvertiser, toggleBlockAdvertiser } from "@/services/api/api-buy-sell"
import { cn, formatPaymentMethodName } from "@/lib/utils"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import OrderSidebar from "@/components/buy-sell/order-sidebar"
import EmptyState from "@/components/empty-state"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import BlockConfirmation from "@/components/block-confirmation"
import { useToast } from "@/hooks/use-toast"

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

export default function AdvertiserProfilePage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const { toast } = useToast()
  const [profile, setProfile] = useState<AdvertiserProfile | null>(null)
  const [adverts, setAdverts] = useState<Advertisement[]>([])
  const [activeSection, setActiveSection] = useState<"ads">("ads")
  const [isFollowing, setIsFollowing] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [isBlockLoading, setIsBlockLoading] = useState(false)
  const [isOrderSidebarOpen, setIsOrderSidebarOpen] = useState(false)
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy")
  const [isBlockConfirmationOpen, setIsBlockConfirmationOpen] = useState(false)

  const fetchAdvertiserData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const advertiserData = await BuySellAPI.getAdvertiserById(id)
      setProfile(advertiserData.data)
      setIsFollowing(advertiserData.data.is_favourite || false)
      setIsBlocked(advertiserData.data.is_blocked || false)

      const advertiserAds = await BuySellAPI.getAdvertiserAds(id)
      setAdverts(advertiserAds)
    } catch (err) {
      console.error("Error fetching advertiser data:", err)
      setError("Failed to load advertiser profile. Please try again.")

      setProfile(null)
      setAdverts([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdvertiserData()
  }, [id])

  const toggleFollow = async () => {
    if (!profile) return

    setIsFollowLoading(true)
    try {
      const result = await toggleFavouriteAdvertiser(profile.id, !isFollowing)

      if (result.success) {
        setIsFollowing(!isFollowing)
        console.log(result.message)
      } else {
        console.error("Failed to toggle follow status:", result.message)
      }
    } catch (error) {
      console.error("Error toggling follow status:", error)
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleBlockClick = () => {
    setIsBlockConfirmationOpen(true)
  }

  const handleBlockConfirm = async () => {
    if (!profile) return

    setIsBlockLoading(true)
    try {
      const result = await toggleBlockAdvertiser(profile.id, !isBlocked)

      if (result.success) {
        setIsBlocked(!isBlocked)
        setIsBlockConfirmationOpen(false)

        router.push("/")
        toast({
          description: (
            <div className="flex items-center gap-2">
              <Image src="/icons/success-checkmark.png" alt="Success" width={24} height={24} className="text-white" />
              <span>{profile?.nickname} blocked.</span>
            </div>
          ),
          className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
          duration: 2500,
        })
      } else {
        console.error("Failed to toggle block status:", result.message)
      }

    } catch (error) {
      console.error("Error toggling block status:", error)
    } finally {
      setIsBlockLoading(false)
    }
  }

  const handleOrderClick = (ad: Advertisement, type: "buy" | "sell") => {
    setSelectedAd(ad)
    setOrderType(type)
    setIsOrderSidebarOpen(true)
  }

  if (isLoading) {
    return (
      <div>
        <Navigation title="Back" isVisible={false} />
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
          <p className="mt-2 text-slate-600">Loading advertiser...</p>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center py-8">
          <p>{error}</p>
          <Button onClick={() => router.back()} className="mt-4 text-white">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const filteredAdverts = adverts.filter((ad) => (activeTab === "buy" ? ad.type === "buy" : ad.type === "sell"))

  const getDuration = (duration) => {
    if (duration == null || duration <= 0) return "-"

    const newDuration = duration / 60 / 60
    if (newDuration < 1) return "< 1 min"

    return newDuration.toFixed(2).toString() + " mins"
  }

  const CURRENT_USER = USER

  const getJoinedDate = (timestamp: number) => {
    const joinDate = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - joinDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `Joined ${diffDays} days ago`
  }

  return (
    <TooltipProvider>
      <div>
        <Navigation title="Back" isVisible={false} />
        <div className="px-[24px]">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="container mx-auto pb-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex flex-row">
                    <div className="relative mr-[16px]">
                      <div className="h-[40px] w-[40px] rounded-full bg-black flex items-center justify-center text-white font-bold text-lg">
                        {profile?.nickname.charAt(0).toUpperCase() || "?"}
                      </div>
                      {profile?.isOnline && (
                        <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex">
                        <h2 className="text-lg font-bold">{profile?.nickname}</h2>
                        {USER.id != profile?.id && (
                          <div className="flex items-center md:mt-0 ml-[16px]">
                            <Button
                              onClick={toggleFollow}
                              variant={isFollowing ? "default" : "outline"}
                              size="sm"
                              className={cn(
                                "text-xs",
                                isFollowing ? "bg-primary hover:bg-primary-hover" : "border-slate-300",
                              )}
                              disabled={isFollowLoading}
                            >
                              {isFollowLoading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                              ) : (
                                <Image src="/icons/follow-icon.png" alt="Follow" width={16} height={16} />
                              )}
                              {isFollowing ? "Following" : "Follow"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn("text-xs underline", isBlocked && "text-red-500")}
                              onClick={handleBlockClick}
                              disabled={isBlockLoading}
                            >
                              {isBlockLoading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                              ) : null}
                              {isBlocked ? "Unblock" : "Block"}
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-slate-500 mt-2">
                        <span className="mr-[8px]">{profile?.isOnline ? "Online" : "Offline"}</span>
                        <span className="text-slate-400">|</span>
                        <span className="ml-[8px]">{profile ? getJoinedDate(profile.created_at) : ""}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="container mx-auto pb-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="grid grid-cols-2 md:flex gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Rating</div>
                    <div className="flex items-center mt-[5.27px]">
                      {profile?.rating_average_lifetime && <Image src="/icons/star-icon.png" alt="Star" width={20} height={20} className="mr-1" />}
                      {profile?.rating_average_lifetime ?
                        <span className="font-bold text-base">{profile?.rating_average_lifetime}/5</span> :
                        <span className="font-bold text-base">Not rated yet</span>
                      }
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
                      {profile?.recommend_average_lifetime ?
                        <span className="font-bold text-base">{profile?.recommend_average_lifetime}%</span> :
                        <span className="font-bold text-base">Not recommended yet</span>
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Total orders</div>
                    <div className="font-bold text-lg mt-1">{profile?.order_count_lifetime}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 border border-[#E9ECEF] p-[16px] rounded-lg">
            <div>
              <div className="text-xs text-slate-500">Buy completion (30d)</div>
              <div className="font-bold mt-1">
                {profile?.buy_count_30day ? `${profile?.completion_average_30day}% ${profile?.buy_count_30day}` : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Sell completion (30d)</div>
              <div className="font-bold mt-1">
                {profile?.sell_count_30day ? `${profile?.completion_average_30day}% ${profile?.sell_count_30day}` : "-"}
              </div>
            </div>
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
          <div className="container mx-auto pb-6 hidden">
            <Tabs
              value={activeSection}
              onValueChange={(value) => setActiveSection(value as "ads")}
              className="border-b"
            >
              <TabsList className="bg-transparent border-b-0 p-0 h-auto">
                <TabsTrigger
                  value="ads"
                  className="px-4 py-3 text-sm font-medium border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-500 data-[state=inactive]:border-transparent data-[state=inactive]:text-slate-500 rounded-none"
                >
                  Online ads
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {activeSection === "ads" && (
            <>
              <div className="container mx-auto pb-4">
               
              </div>
              <div className="container mx-auto pb-8">
                {filteredAdverts.length > 0 ? (
                  <>
                    <div>
                      <Table>
                        <TableHeader className="hidden lg:table-header-group border-b sticky top-0 bg-white">
                          <TableRow className="text-sm">
                            <TableHead className="text-left py-4 px-4 text-slate-600 font-normal">Rates</TableHead>
                            <TableHead className="text-left py-4 px-4 text-slate-600 font-normal">
                              Order limits
                            </TableHead>
                            <TableHead className="text-left py-4 px-4 text-slate-600 font-normal">
                              Payment methods
                            </TableHead>
                            <TableHead className="text-right py-4 px-4"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="bg-white lg:divide-y lg:divide-slate-200 font-normal text-sm">
                          {filteredAdverts.map((ad) => (
                            <TableRow
                              className="flex flex-col border rounded-sm mb-[16px] lg:table-row lg:border-x-[0] lg:border-t-[0] lg:mb-[0]"
                              key={ad.id}
                            >
                              <TableCell className="py-4 px-4 align-top text-base whitespace-nowrap">
                                <div className="font-bold">
                                  {ad.payment_currency}{" "}
                                  {ad.exchange_rate
                                    ? ad.exchange_rate.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                    : ""}
                                </div>
                                {ad.exchange_rate_type === "floating" && (
                                  <div className="text-xs text-slate-500">0.1%</div>
                                )}
                              </TableCell>
                              <TableCell className="py-4 px-4 align-top whitespace-nowrap">
                                <div>
                                  {ad.account_currency} {ad.minimum_order_amount} - {ad.actual_maximum_order_amount}
                                </div>
                                <div className="flex items-center text-xs text-slate-500 mt-1 bg-gray-100 rounded-sm px-2 py-1 w-fit">
                                  <Image src="/icons/clock.png" alt="Time" width={12} height={12} className="mr-1" />
                                  <span>{ad.order_expiry_period} min</span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-4 align-top whitespace-nowrap">
                                <div className="flex flex-wrap gap-2 text-xs">
                                  {ad.payment_methods?.map((method, index) => (
                                    <div key={index} className="flex items-center">
                                      <div
                                        className={`h-2 w-2 rounded-full mr-2 ${method.toLowerCase().includes("bank")
                                          ? "bg-paymentMethod-bank"
                                          : "bg-paymentMethod-ewallet"
                                          }`}
                                      ></div>
                                      <span className="text-xs">{formatPaymentMethodName(method)}</span>
                                    </div>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="py-4 px-4 text-right align-top whitespace-nowrap">
                                {CURRENT_USER.id != ad.user.id && (
                                  <Button
                                    variant={ad.type === "buy" ? "destructive" : "secondary"}
                                    size="sm"
                                    onClick={() => handleOrderClick(ad, ad.type === "buy" ? "buy" : "sell")}
                                  >
                                    {ad.type === "buy" ? "Sell" : "Buy"} {ad.account_currency}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <EmptyState title="No ads available." redirectToAds={false} />
                )}
              </div>
            </>
          )}
          <OrderSidebar
            isOpen={isOrderSidebarOpen}
            onClose={() => setIsOrderSidebarOpen(false)}
            ad={selectedAd}
            orderType={orderType}
          />
          <BlockConfirmation
            isOpen={isBlockConfirmationOpen}
            onClose={() => setIsBlockConfirmationOpen(false)}
            onConfirm={handleBlockConfirm}
            nickname={profile?.nickname || ""}
            isLoading={isBlockLoading}
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
