"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useCallback, useState, useMemo, useEffect } from "react"
import { useTranslations } from "@/lib/i18n/use-translations"
import FollowUserList from "./follow-user-list"
import { getTradePartners } from "@/services/api/api-profile"
import { Skeleton } from "@/components/ui/skeleton"

interface TradePartner {
  nickname: string
  user_id: number
}

export default function CounterpartiesTab() {
  const { t } = useTranslations()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [counterparties, setCounterparties] = useState<TradePartner[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const handleAdvertiserClick = (userId: number) => {
    router.push(`/advertiser/${userId}`)
  }

  const fetchCounterparties = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getTradePartners()
      setCounterparties(data)
    } catch (err) {
      console.error("Failed to fetch counterparties:", err)
      setCounterparties([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCounterparties()
  }, [fetchCounterparties])

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

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
            <Skeleton className="w-10 h-10 rounded-full bg-grayscale-500" />
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2 rounded bg-grayscale-500" />
              <Skeleton className="h-3 w-32 rounded bg-grayscale-500" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <FollowUserList
      users={filteredUsers}
      isLoading={isLoading}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onClearSearch={handleClearSearch}
      onUserClick={handleAdvertiserClick}
      followingUserIds={[]}
      emptyTitle={t("profile.noCounterparties")}
      emptyDescription={t("profile.noCounterpartiesDescription")}
      searchEmptyTitle={t("profile.noMatchingName")}
      searchEmptyDescription={t("profile.noResultFor", { query: searchQuery })}
      showFollowingButton={false}
    />
  )
}
