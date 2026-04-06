"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useCallback, useState, useMemo } from "react"
import { useTranslations } from "@/lib/i18n/use-translations"
import { toggleBlockAdvertiser } from "@/services/api/api-buy-sell"
import { useTradePartners } from "@/hooks/use-api-queries"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/hooks/use-api-queries"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import EmptyState from "@/components/empty-state"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface TradePartner {
  nickname: string
  user_id: number
  is_blocked?: boolean
}

export default function CounterpartiesTab() {
  const { t } = useTranslations()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const { data: counterparties = [], isLoading } = useTradePartners()
  const { showAlert } = useAlertDialog()
  const { toast } = useToast()

  const handleAdvertiserClick = (userId: number) => {
    router.push(`/advertiser/${userId}`)
  }

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return counterparties

    return counterparties.filter((user) => user.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [counterparties, searchQuery])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
  }, [])

  const handleBlock = (user: TradePartner) => {
    showAlert({
      title: t("profile.blockUser", { nickname: user.nickname }),
      description: t("profile.blockDescription"),
      confirmText: t("profile.block"),
      cancelText: t("common.cancel"),
      type: "warning",
      onConfirm: async () => {
        try {
          const result = await toggleBlockAdvertiser(user.user_id, true)

          if (result.success) {
            toast({
              description: (
                <div className="flex items-center gap-2">
                  <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
                  <span>{t("profile.userBlocked", { nickname: user.nickname })}</span>
                </div>
              ),
              className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
              duration: 2500,
            })
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.tradePartners() })
          }
        } catch (error) {
          console.error("Error blocking user:", error)
        }
      },
    })
  }

  const handleUnblock = (user: TradePartner) => {
    showAlert({
      title: t("profile.unblockUser", { nickname: user.nickname }),
      description: t("profile.unblockDescription"),
      confirmText: t("profile.unblock"),
      cancelText: t("common.cancel"),
      type: "warning",
      onConfirm: async () => {
        try {
          const result = await toggleBlockAdvertiser(user.user_id, false)

          if (result.success) {
            toast({
              description: (
                <div className="flex items-center gap-2">
                  <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
                  <span>{t("profile.userUnblocked", { nickname: user.nickname })}</span>
                </div>
              ),
              className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
              duration: 2500,
            })
            queryClient.invalidateQueries({ queryKey: queryKeys.auth.tradePartners() })
          }
        } catch (error) {
          console.error("Error unblocking user:", error)
        }
      },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[72px] flex items-center gap-3 p-3 rounded-lg">
            <Skeleton className="w-10 h-10 rounded-full bg-grayscale-500" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2 rounded bg-grayscale-500" />
              <Skeleton className="h-3 w-32 rounded bg-grayscale-500" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full bg-grayscale-500" />
          </div>
        ))}
      </div>
    )
  }

  const UserCard = ({ user }: { user: TradePartner }) => (
    <div className="h-[72px] flex items-center justify-between gap-3">
      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {user.nickname?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 border-b border-gray-100 py-4 flex items-center justify-between">
        <Button
          onClick={() => handleAdvertiserClick(user.user_id)}
          className="hover:underline hover:bg-transparent cursor-pointer font-normal text-slate-1200 px-0 text-base"
          size="sm"
          variant="ghost"
        >
          {user.nickname}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => (user.is_blocked ? handleUnblock(user) : handleBlock(user))}
          className="rounded-full px-4 py-1 text-sm"
        >
          {user.is_blocked ? t("profile.unblock") : t("profile.block")}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {(filteredUsers.length > 0 || searchQuery) && (
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full md:w-[360px]">
            <Image
              src="/icons/search-icon-custom.png"
              alt="Search"
              width={24}
              height={24}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <Input
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-14 pl-10 pr-10 border-0 bg-grayscale-500 rounded-lg focus:outline-none"
              autoComplete="off"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSearch}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 hover:bg-transparent"
              >
                <Image src="/icons/clear-search-icon.png" alt="Clear search" width={24} height={24} />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-0">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => <UserCard key={user.user_id} user={user} />)
        ) : (
          <EmptyState
            title={searchQuery ? t("profile.noMatchingName") : t("profile.noCounterparties")}
            description={
              searchQuery ? t("profile.noResultFor", { query: searchQuery }) : t("profile.noCounterpartiesDescription")
            }
            redirectToAds={false}
          />
        )}
      </div>
    </div>
  )
}
