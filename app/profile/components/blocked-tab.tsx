"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useCallback, useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { getBlockedUsers } from "@/services/api/api-profile"
import { toggleBlockAdvertiser } from "@/services/api/api-buy-sell"
import Image from "next/image"
import EmptyState from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "@/lib/i18n/use-translations"

interface BlockedUser {
  nickname: string
  user_id: number
}

export default function BlockedTab() {
  const { t } = useTranslations()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showAlert } = useAlertDialog()
  const { toast } = useToast()

  const fetchBlockedUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getBlockedUsers()
      setBlockedUsers(data)
    } catch (err) {
      console.error("Failed to fetch blocked users:", err)
      setBlockedUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlockedUsers()
  }, [fetchBlockedUsers])

  const filteredBlockedUsers = useMemo(() => {
    if (!searchQuery.trim()) return blockedUsers

    return blockedUsers.filter((user) => user.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [blockedUsers, searchQuery])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleUnblock = (user: BlockedUser) => {
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
            await fetchBlockedUsers()
          }
        } catch (error) {
          console.error("Error unblocking user:", error)
        }
      },
    })
  }

  const onUserClick = (userId: number) => {
    router.push(`/advertiser/${userId}`)
  }

  const UserCard = ({ user }: { user: BlockedUser }) => (
    <div className="h-[72px] flex items-center justify-between gap-3">
      <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {user.nickname?.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 border-b border-gray-100 py-4 flex items-center justify-between">
        <Button
          onClick={() => onUserClick(user.user_id)}
          className="hover:underline hover:bg-transparent cursor-pointer font-normal text-slate-1200 px-0 text-base"
          size="sm"
          variant="ghost"
        >
          {user.nickname}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleUnblock(user)}
          className="rounded-full px-4 py-1 text-sm"
        >
          {t("profile.unblock")}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {(filteredBlockedUsers.length > 0 || searchQuery) && (
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
                onClick={() => setSearchQuery("")}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 hover:bg-transparent"
              >
                <Image src="/icons/clear-search-icon.png" alt="Clear search" width={24} height={24} />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-0">
        {isLoading ? (
          <div className="space-y-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[72px] flex items-center justify-between gap-3">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-1 border-b border-gray-100 py-4 flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBlockedUsers.length > 0 ? (
          filteredBlockedUsers.map((user) => <UserCard key={user.user_id} user={user} />)
        ) : (
          <EmptyState
            title={searchQuery ? t("profile.noMatchingName") : t("profile.noBlockedUsers")}
            description={
              searchQuery ? t("profile.noResultFor", { query: searchQuery }) : t("profile.blockedUsersAppear")
            }
            redirectToAds={false}
          />
        )}
      </div>
    </div>
  )
}
