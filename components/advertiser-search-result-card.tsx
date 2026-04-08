"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { VerifiedBadge } from "@/components/verified-badge"
import { TradeBandBadge } from "@/components/trade-band-badge"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatPaymentMethodName } from "@/lib/utils"
import { useTranslations } from "@/lib/i18n/use-translations"
import type { Advertisement } from "@/services/api/api-buy-sell"

interface AdvertiserSearchResultCardProps {
    ad: Advertisement
    onSelect: (nickname: string, advertiserId: number) => void
}

export function AdvertiserSearchResultCard({ ad, onSelect }: AdvertiserSearchResultCardProps) {
    const { t } = useTranslations()

    return (
        <div className="px-4 py-3">
            {/* Row 1: Advertiser info */}
            <div className="flex items-start gap-2 mb-2">
                <div className="relative h-[24px] w-[24px] flex-shrink-0 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm mr-[8px] mt-[2px]">
                    {(ad.user?.nickname || "").charAt(0).toUpperCase()}
                    <div className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white ${ad.user?.is_online ? "bg-buy" : "bg-gray-400"}`} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            className="text-sm hover:underline cursor-pointer truncate"
                            onClick={() => onSelect(ad.user.nickname, ad.user.id)}
                        >
                            {ad.user?.nickname}
                        </button>
                        <VerifiedBadge />
                        {ad.user.trade_band && (
                            <TradeBandBadge tradeBand={ad.user.trade_band} showLearnMore={true} size={18} />
                        )}
                        {ad.is_private && (
                            <Image src="/icons/closed-group.svg" alt="Closed Group" width={32} height={32} className="cursor-pointer mr-1" />
                        )}
                        {ad.user?.is_favourite && (
                            <span className="px-[8px] py-[4px] bg-blue-50 text-blue-100 text-xs rounded-[4px] whitespace-nowrap">
                                {t("market.following")}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 mt-[4px]">
                        {ad.user.rating_average_lifetime && (
                            <span className="flex items-center">
                                <Image src="/icons/star-active.svg" alt="Rating" width={16} height={16} className="mr-1" />
                                <span className="text-pending-text-secondary">{ad.user.rating_average_lifetime.toFixed(2)}</span>
                            </span>
                        )}
                        {(ad.user.order_count_lifetime ?? 0) > 0 && (
                            <div className="flex flex-row items-center gap-[8px] mx-[8px]">
                                {ad.user.rating_average_lifetime && <div className="h-1 w-1 rounded-full bg-slate-500" />}
                                <span>{ad.user.order_count_lifetime} {t("market.orders")}</span>
                            </div>
                        )}
                        {(ad.user.completion_rate_all_30day ?? 0) > 0 && (
                            <div className="flex flex-row items-center gap-[8px]">
                                <div className="h-1 w-1 rounded-full bg-slate-500" />
                                <span>{ad.user.completion_rate_all_30day}% {t("market.completion")}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 2: Rate + Order limits + Expiry */}
            <div className="mb-2">
                <div className="font-bold text-base flex items-center">
                    {ad.effective_rate_display
                        ? ad.effective_rate_display.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : ""}{" "}
                    {ad.payment_currency}
                    <span className="text-xs text-slate-500 font-normal ml-1">{`/${ad.account_currency}`}</span>
                </div>
                <div className="mt-1 text-xs text-slate-600">{`${t("market.orderLimits")}: ${ad.minimum_order_amount || "N/A"} - ${ad.actual_maximum_order_amount || "N/A"} ${ad.account_currency}`}</div>
                {ad.order_expiry_period && (
                    <div className="flex items-center text-xs text-slate-500 mt-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center bg-gray-100 text-slate-500 rounded-sm px-2 py-1 cursor-pointer">
                                        <Image src="/icons/clock.png" alt="Time" width={12} height={12} className="mr-2" />
                                        <span>{ad.order_expiry_period} {t("market.min")}</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent align="start" className="max-w-[328px] text-wrap">
                                    <p>{t("order.paymentTimeTooltip", { minutes: ad.order_expiry_period })}</p>
                                    <TooltipArrow className="fill-black" />
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                )}
            </div>

            {/* Row 3: Payment methods + Buy/Sell button */}
            <div className="flex items-center justify-between">
                <div className="flex flex-row flex-wrap gap-2">
                    {ad.payment_methods?.map((method, index) => (
                        <div key={index} className="flex items-center">
                            {method && (
                                <div className={`h-2 w-2 rounded-full mr-2 ${method.toLowerCase().includes("bank") ? "bg-paymentMethod-bank" : "bg-paymentMethod-ewallet"}`} />
                            )}
                            <span className="text-xs">{formatPaymentMethodName(method)}</span>
                        </div>
                    ))}
                </div>
                <Button
                    variant={ad.type === "buy" ? "destructive" : "secondary"}
                    size="sm"
                    onClick={() => onSelect(ad.user.nickname, ad.user.id)}
                    className="ml-2 flex-shrink-0"
                >
                    {ad.type === "buy" ? t("common.sell") : t("common.buy")} {ad.account_currency}
                </Button>
            </div>
        </div>
    )
}
