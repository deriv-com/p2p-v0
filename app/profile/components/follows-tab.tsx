"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useCallback, useState, useEffect, useMemo, useRef } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { getFavouriteUsers, getFollowers } from "@/services/api/api-profile"
import { toggleFavouriteAdvertiser } from "@/services/api/api-buy-sell"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import FollowUserList from "./follow-user-list"
import { useTranslations } from "@/lib/i18n/use-translations"

interface FollowUser {
  nickname: string
  user_id: number
}

export default function FollowsTab() {
  const { t } = useTranslations()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [following, setFollowing] = useState<FollowUser[]>([])
  const [followers, setFollowers] = useState<FollowUser[]>([])
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(true)
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(true)
  const [activeTab, setActiveTab] = useState("follows")
  const { showAlert } = useAlertDialog()
  const { toast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleAdvertiserClick = (userId: number) => {
    router.push(`/advertiser/${userId}`)
  }

  const fetchFollowing = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      setIsLoadingFollowing(true)
      const data = await getFavouriteUsers(abortController.signal)

      if (abortController.signal.aborted) {
        return
      }

      setFollowing(data)
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.error("Failed to fetch favourite users:", err)
        setFollowing([])
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoadingFollowing(false)
      }
    }
  }, [])

  const fetchFollowers = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      setIsLoadingFollowers(true)
      const data = await getFollowers(abortController.signal)

      if (abortController.signal.aborted) {
        return
      }

      setFollowers(data)
    } catch (err) {
      if (!abortController.signal.aborted) {
        console.error("Failed to fetch followers:", err)
        setFollowers([])
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsLoadingFollowers(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchFollowing()
    fetchFollowers()
  }, [fetchFollowing, fetchFollowers])

  const filteredUsers = useMemo(() => {
    const users = activeTab === "follows" ? following : followers
    if (!searchQuery.trim()) return users

    return users.filter((user) => user.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [following, followers, searchQuery, activeTab])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
  }, [])

  const handleFollowToggle = (user: FollowUser, isCurrentlyFollowing: boolean) => {
    if (isCurrentlyFollowing) {
      showAlert({
        title: t("profile.unfollowUser", { nickname: user.nickname }),
        description: t("profile.unfollowDescription"),
        confirmText: t("profile.unfollow"),
        cancelText: t("common.cancel"),
        type: "warning",
        onConfirm: async () => {
          try {
            const result = await toggleFavouriteAdvertiser(user.user_id, false)

            if (result.success) {
              toast({
                description: (
                  <div className="flex items-center gap-2">
                    <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
                    <span>{t("profile.userUnfollowed", { nickname: user.nickname })}</span>
                  </div>
                ),
                className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
                duration: 2500,
              })
              await fetchFollowing()
            }
          } catch (error) {
            console.error("Error unfollowing user:", error)
          }
        },
      })
    } else {
      toggleFavouriteAdvertiser(user.user_id, true)
        .then((result) => {
          if (result.success) {
            toast({
              description: (
                <div className="flex items-center gap-2">
                  <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
                  <span>{t("profile.userFollowed", { nickname: user.nickname })}</span>
                </div>
              ),
              className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
              duration: 2500,
            })
            fetchFollowing()
          }
        })
        .catch((error) => {
          console.error("Error following user:", error)
        })
    }
  }

  const followingUserIds = useMemo(() => following.map((user) => user.user_id), [following])

  const isLoading = activeTab === "follows" ? isLoadingFollowing : isLoadingFollowers

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="follows" className="flex-1 md:flex-none md:w-32">{t("profile.followsCount", { count: following.length })}</TabsTrigger>
          <TabsTrigger value="followers" className="flex-1 md:flex-none md:w-32">{t("profile.followersCount", { count: followers.length })}</TabsTrigger>
        </TabsList>

        <TabsContent value="follows">
          <FollowUserList
            users={filteredUsers}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            onUserClick={handleAdvertiserClick}
            onFollowToggle={handleFollowToggle}
            followingUserIds={followingUserIds}
            emptyTitle={t("profile.notFollowingAnyone")}
            emptyDescription={t("profile.startFollowing")}
            searchEmptyTitle={t("profile.noMatchingName")}
            searchEmptyDescription={t("profile.noResultFor", { query: searchQuery })}
            showFollowingButton={true}
          />
        </TabsContent>

        <TabsContent value="followers">
          <FollowUserList
            users={filteredUsers}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            onUserClick={handleAdvertiserClick}
            onFollowToggle={handleFollowToggle}
            followingUserIds={followingUserIds}
            emptyTitle={t("profile.noFollowers")}
            emptyDescription={t("profile.whenUsersFollow")}
            searchEmptyTitle={t("profile.noMatchingName")}
            searchEmptyDescription={t("profile.noResultFor", { query: searchQuery })}
            showFollowingButton={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
