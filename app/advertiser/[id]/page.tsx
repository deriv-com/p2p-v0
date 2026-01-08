"use client"

export const runtime = "edge"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useUserDataStore } from "@/stores/user-data-store"
import { BuySellAPI } from "@/services/api"
import type { Advertisement } from "@/services/api/api-buy-sell"
import { toggleFavouriteAdvertiser, toggleBlockAdvertiser } from "@/services/api/api-buy-sell"
import { addToClosedGoup, removeFromClosedGoup } from "@/services/api/api-profile"
import { formatPaymentMethodName } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import OrderSidebar from "@/components/buy-sell/order-sidebar"
import EmptyState from "@/components/empty-state"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import AdvertiserStats from "@/app/advertiser/components/advertiser-stats"
import { useToast } from "@/hooks/use-toast"
import { useIsMobile } from "@/hooks/use-mobile"
import { VerifiedBadge } from "@/components/verified-badge"
import { TradeBandBadge } from "@/components/trade-band-badge"
import { ClosedGroupBadge } from "@/components/closed-group-badge"
import { useTranslations } from "@/lib/i18n/use-translations"
import FollowDropdown from "@/app/advertiser/components/follow-dropdown"

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
  is_online?: boolean
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

interface AdvertiserProfilePageProps {
  onBack?: () => void
}

export default function AdvertiserProfilePage({ onBack }: AdvertiserProfilePageProps) {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const searchParams = useSearchParams()
  const adIdParam = searchParams.get("adId")
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const { showAlert } = useAlertDialog()
  const userId = useUserDataStore((state) => state.userId)
  const { userData } = useUserDataStore()
  const tempBanUntil = userData?.temp_ban_until
  const [profile, setProfile] = useState<AdvertiserProfile | null>(null)
  const [adverts, setAdverts] = useState<Advertisement[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isGroupMember, setIsGroupMember] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [isBlockLoading, setIsBlockLoading] = useState(false)
  const [isOrderSidebarOpen, setIsOrderSidebarOpen] = useState(false)
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy")
  const { t } = useTranslations()

  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchAdvertiserData = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setIsLoading(true)
    setError(null)

    try {
      const advertiserData = await BuySellAPI.getAdvertiserById(id)

      if (abortController.signal.aborted) {
        return
      }

      setProfile(advertiserData.data)
      setIsFollowing(advertiserData.data.is_favourite || false)
      setIsBlocked(advertiserData.data.is_blocked || false)
      setIsGroupMember(advertiserData.data.is_group_member || false)

      const advertiserAds = await BuySellAPI.getAdvertiserAds(id)

      if (abortController.signal.aborted) {
        return
      }

      setAdverts(advertiserAds)
    } catch (err) {
      if (!abortController.signal.aborted) {
        setError("Failed to load the advertiser profile.")
        setProfile(null)
        setAdverts([])
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    if (id) {
      fetchAdvertiserData()
    } else {
      router.push("/")
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [id])

  useEffect(() => {
    if (adIdParam && adverts.length > 0 && !isBlocked) {
      const ad = adverts.find((a) => a.id == adIdParam)
      if (ad) {
        handleOrderClick(ad, ad.type === "buy" ? "buy" : "sell")
      } else {
        showAlert({
          title: "This ad is unavailable",
          description: "It's either deleted or no longer active.",
          confirmText: "OK",
          type: "warning",
        })
      }
    }
  }, [adIdParam, adverts, isBlocked])

  const toggleFollow = async () => {
    if (!profile) return

    setIsFollowLoading(true)
    try {
      const result = await toggleFavouriteAdvertiser(profile.id, !isFollowing)

      if (result.success) {
        setIsFollowing(!isFollowing)
        toast({
          description: (
            <div className="flex items-center gap-2">
              <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
              {isFollowing ? (
                <span>{t("advertiser.successfullyUnfollowed")}</span>
              ) : (
                <span>{t("advertiser.successfullyFollowed")}</span>
              )}
            </div>
          ),
          className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
          duration: 2500,
        })
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
    if (!isBlocked) {
      showAlert({
        title: t("advertiser.blockUser", { nickname: profile?.nickname }),
        description: t("advertiser.blockDescription", { nickname: profile?.nickname }),
        confirmText: t("advertiser.block"),
        cancelText: t("common.cancel"),
        type: "warning",
        onConfirm: async () => {
          if (!profile) return

          setIsBlockLoading(true)
          try {
            const result = await toggleBlockAdvertiser(profile.id, !isBlocked)

            if (result.success) {
              setIsBlocked(!isBlocked)

              toast({
                description: (
                  <div className="flex items-center gap-2">
                    <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
                    <span>
                      {isBlocked
                        ? t("advertiser.userUnblocked", { nickname: profile?.nickname })
                        : t("advertiser.userBlocked", { nickname: profile?.nickname })}
                    </span>
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
        },
      })
    } else {
      handleUnblock()
    }
  }

  const handleUnblock = async () => {
    if (!profile) return

    setIsBlockLoading(true)
    try {
      const result = await toggleBlockAdvertiser(profile.id, false)

      if (result.success) {
        setIsBlocked(false)

        toast({
          description: (
            <div className="flex items-center gap-2">
              <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
              <span>{t("advertiser.userUnblocked", { nickname: profile?.nickname })}</span>
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

  const handleAddToClosedGroup = async () => {
    try {
      const result = await addToClosedGoup(profile.id)

      if (result.success) {
        toast({
          description: (
            <div className="flex items-center gap-2">
              <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
              <span>Successfully added to closed group.</span>
            </div>
          ),
          className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
          duration: 2500,
        })
        setIsGroupMember(true)
      }else {
        console.error("Failed to add to closed group")
      }
    } catch (error) {
      console.error("Failed to add to closed group:", error)
    }
  }

   const handleRemoveFromClosedGroup = async () => {
    try {
      const result = await removeFromClosedGoup(profile.id)

      if (result.success) {
        toast({
          description: (
            <div className="flex items-center gap-2">
              <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
              <span>Successfully removed from closed group.</span>
            </div>
          ),
          className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
          duration: 2500,
        })
        setIsGroupMember(false)
      }else {
        console.error("Failed to remove from closed group")
      }
    } catch (error) {
      console.error("Failed to remove from closed group:", error)
    }
  }


  const handleOrderClick = (ad: Advertisement, type: "buy" | "sell") => {
    setSelectedAd(ad)
    setOrderType(type)
    setIsOrderSidebarOpen(true)
  }

  const getJoinedDate = (timestamp: number) => {
    const joinDate = new Date(timestamp)
    const formattedDate = joinDate.toLocaleDateString("en-GB")
    return `Joined on ${formattedDate}`
  }

  const handleBack = () => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
        <p className="mt-2 text-slate-600">{t("advertiser.loadingAdvertiser")}</p>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="text-center py-8">
          <p>{error}</p>
          <Button onClick={handleBack} className="mt-4 text-white">
            {t("advertiser.goBack")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="p-6 md:px-2 md:py-0">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="container mx-auto pb-6">
            <div className="bg-slate-75 p-6 rounded-none md:rounded-3xl flex flex-col md:items-start gap-4 mx-[-24px] mt-[-24px] md:mx-0 md:mt-0">
              <Button variant="ghost" onClick={handleBack} size="sm" className="bg-grayscale-500 px-1 w-fit">
                <Image src="/icons/arrow-left-icon.png" alt="Back" width={24} height={24} />
              </Button>
              <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row gap-2 md:gap-0">
                  <div className="relative mr-[16px]">
                    <div className="relative h-[56px] w-[56px] bg-grayscale-500 rounded-full flex items-center justify-center">
                      <Image src="/icons/user-icon-black.png" alt="User" width={32} height={32} />
                      <div
                        className={`absolute bottom-0 right-1 h-3 w-3 rounded-full border-2 border-white ${profile?.is_online ? "bg-buy" : "bg-gray-400"
                          }`}
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-1 items-center">
                      <h2 className="text-lg font-bold">{profile?.nickname}</h2>
                      <VerifiedBadge />
                      {profile.trade_band && (
                        <TradeBandBadge
                          tradeBand={profile.trade_band}
                          showLearnMore={true}
                          size={18}
                        />
                      )}
                      {isGroupMember &&
                        <ClosedGroupBadge />
                      }
                    </div>
                    <div className="flex items-center text-xs text-grayscale-600 mt-2">
                      <span className="mr-[8px]">
                        {profile?.is_online ? t("advertiser.online") : t("advertiser.offline")}
                      </span>
                      <span className="opacity-[0.08]">|</span>
                      <span className="ml-[8px]">{profile ? getJoinedDate(profile.created_at) : ""}</span>
                    </div>
                    <div className="flex items-center text-xs text-grayscale-600 mt-2 gap-2">
                      <div className="flex items-center">
                        <Image src="/icons/thumbs-up.png" alt="Recommended" width={24} height={24} className="mr-1" />
                        <span className="mr-[8px]">
                          {profile?.statistics_lifetime?.recommend_count > 0
                            ? t("advertiser.recommendedBy", {
                              count: profile?.statistics_lifetime?.recommend_count,
                              plural: profile?.statistics_lifetime?.recommend_count === 1 ? "" : "s",
                            })
                            : t("profile.notRecommendedYet")}
                        </span>
                      </div>
                      <span className="opacity-[0.08]">|</span>
                      <div className="flex items-center">
                        <Image src="/icons/star-rating.png" alt="Star" width={24} height={24} className="mr-1" />
                        <span>
                          {profile?.statistics_lifetime?.rating_count > 0
                            ? profile?.statistics_lifetime?.rating_average
                            : t("profile.notRatedYet")}
                        </span>
                      </div>
                    </div>
                  </div>
                  {userId != profile?.id && (
                    <div className="flex items-center md:mt-0 ustify-self-end">
                      {!isBlocked && (
                        <>
                          {isFollowing ? (
                            <FollowDropdown
                              isFollowing={isFollowing}
                              isGroupMember={isGroupMember}
                              isLoading={isFollowLoading}
                              onUnfollow={toggleFollow}
                              onAddToClosedGroup={handleAddToClosedGroup}
                              onRemoveFromClosedGroup={handleRemoveFromClosedGroup}
                            />
                          ) : (
                            <Button onClick={toggleFollow} variant="outline" size="sm" disabled={isFollowLoading}>
                              {t("advertiser.follow")}
                            </Button>
                          )}
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="underline"
                        onClick={handleBlockClick}
                        disabled={isBlockLoading}
                      >
                        {isBlockLoading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                        ) : null}
                        {isBlocked ? t("advertiser.unblock") : t("advertiser.block")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {isBlocked && (
              <div className="p-6 my-6 flex flex-col items-center justify-center text-center">
                <div className="mb-4">
                  <Image src="/icons/blocked.png" alt="Blocked user" width={128} height={128} className="mx-auto" />
                </div>
                <h2 className="text-lg font-bold text-neutral-10 mb-2">{t("advertiser.youveBlockedUser")}</h2>
                <p className="text-base text-neutral-7">{t("advertiser.unblockDescription")}</p>
              </div>
            )}

            {!isBlocked && (
              <>
                <AdvertiserStats profile={profile} />
                <div className="container mx-auto pb-4 text-lg font-bold">{t("advertiser.onlineAds")}</div>
                <div className="container mx-auto pb-8">
                  {adverts.length > 0 ? (
                    <div>
                      <Table>
                        <TableHeader className="hidden lg:table-header-group border-b sticky top-0 bg-white">
                          <TableRow className="text-xs">
                            <TableHead className="text-left py-4 px-4 text-slate-600 font-normal">
                              {t("advertiser.rates")}
                            </TableHead>
                            <TableHead className="text-left py-4 px-4 text-slate-600 font-normal">
                              {t("advertiser.orderLimits")}
                            </TableHead>
                            <TableHead className="text-left py-4 px-4 text-slate-600 font-normal">
                              {t("advertiser.timeLimit")}
                            </TableHead>
                            <TableHead className="text-left py-4 px-4 text-slate-600 font-normal">
                              {t("advertiser.paymentMethods")}
                            </TableHead>
                            <TableHead className="text-right py-4 px-4"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="bg-white lg:divide-y lg:divide-slate-200 font-normal text-sm">
                          {adverts.map((ad) => (
                            <TableRow
                              className="grid grid-col gap-2 border-b mb-[16px] py-4 lg:table-row lg:border-x-[0] lg:border-t-[0] lg:mb-[0] lg:py-0"
                              key={ad.id}
                            >
                              <TableCell className="p-0 lg:py-4 lg:px-4 align-middle text-base whitespace-nowrap row-start-1">
                                <div className="font-bold">
                                  {ad.effective_rate_display
                                    ? ad.effective_rate_display.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                    : ""}{" "}
                                  {ad.payment_currency}
                                  <span className="text-xs font-normal text-black opacity-[0.48]">
                                    {" "}
                                    /{ad.account_currency}
                                  </span>
                                </div>
                                {ad.exchange_rate_type === "floating" && (
                                  <div className="text-xs text-slate-500">0.1%</div>
                                )}
                              </TableCell>
                              <TableCell className="p-0 lg:py-4 lg:px-4 align-middle whitespace-nowrap row-start-2">
                                <div>
                                  {isMobile && <span>Trade Limits: </span>}
                                  {ad.minimum_order_amount} - {ad.actual_maximum_order_amount} {ad.account_currency}
                                </div>
                              </TableCell>
                              <TableCell className="p-0 lg:py-4 lg:px-4 align-middle whitespace-nowrap row-start-3">
                                <div className="flex items-center text-xs text-slate-500 bg-gray-100 rounded-sm px-2 py-1 w-fit">
                                  <Image src="/icons/clock.png" alt="Time" width={12} height={12} className="mr-1" />
                                  <span>{ad.order_expiry_period} min</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-0 py-2 lg:py-4 lg:px-4 align-middle whitespace-nowrap row-start-4">
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
                              <TableCell className="px-0 py-2 lg:py-4 lg:px-4 text-right align-middle whitespace-nowrap row-start-4">
                                {userId != ad.user.id && (
                                  <Button
                                    variant={ad.type === "buy" ? "destructive" : "secondary"}
                                    size="sm"
                                    onClick={() => handleOrderClick(ad, ad.type === "buy" ? "buy" : "sell")}
                                    disabled={!!tempBanUntil}
                                  >
                                    {ad.type === "buy" ? t("common.sell") : t("common.buy")} {ad.account_currency}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <EmptyState
                      title={t("advertiser.noAdsYet")}
                      description={t("advertiser.noActiveAds")}
                      redirectToAds={false}
                    />
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
          </div>
        </div>
      </div>
    </div>
  )
}
