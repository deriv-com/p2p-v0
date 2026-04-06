"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useCallback, useState, useMemo, useRef, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { toggleFavouriteAdvertiser } from "@/services/api/api-buy-sell"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import FollowUserList from "./follow-user-list"
import { useTranslations } from "@/lib/i18n/use-translations"
import { useFavouriteUsers, useFollowers } from "@/hooks/use-api-queries"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/hooks/use-api-queries"

interface FollowUser {
  nickname: string
  user_id: number
}

export default function FollowsTab() {
  const { t } = useTranslations()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("follows")
  const observerTargetFollows = useRef<HTMLDivElement>(null)
  const observerTargetFollowers = useRef<HTMLDivElement>(null)
  const scrollContainerFollowsRef = useRef<HTMLDivElement>(null)
  const scrollContainerFollowersRef = useRef<HTMLDivElement>(null)
  const isFetchingNextPageFollowsRef = useRef(false)
  const isFetchingNextPageFollowersRef = useRef(false)

  const { showAlert } = useAlertDialog()
  const { toast } = useToast()

  const {
    data: followingData,
    isLoading: isLoadingFollowing,
    hasNextPage: hasNextPageFollows,
    fetchNextPage: fetchNextPageFollows,
    isFetchingNextPage: isFetchingNextPageFollows,
  } = useFavouriteUsers()

  const {
    data: followersData,
    isLoading: isLoadingFollowers,
    hasNextPage: hasNextPageFollowers,
    fetchNextPage: fetchNextPageFollowers,
    isFetchingNextPage: isFetchingNextPageFollowers,
  } = useFollowers()

  // Flatten pages into single arrays
  const following = useMemo(() => {
    return followingData?.pages.flatMap(page => page) ?? []
  }, [followingData])

  const followers = useMemo(() => {
    return followersData?.pages.flatMap(page => page) ?? []
  }, [followersData])

  // Keep refs in sync
  useEffect(() => {
    isFetchingNextPageFollowsRef.current = isFetchingNextPageFollows
  }, [isFetchingNextPageFollows])

  useEffect(() => {
    isFetchingNextPageFollowersRef.current = isFetchingNextPageFollowers
  }, [isFetchingNextPageFollowers])

  // Observe for follows tab
  useEffect(() => {
    const sentinel = observerTargetFollows.current
    const scrollContainer = scrollContainerFollowsRef.current
    if (activeTab !== "follows" || !sentinel || !hasNextPageFollows || !scrollContainer) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isFetchingNextPageFollowsRef.current) {
          fetchNextPageFollows()
        }
      },
      { threshold: 0, rootMargin: "100px", root: scrollContainer },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPageFollows, fetchNextPageFollows, activeTab])

  // Observe for followers tab
  useEffect(() => {
    const sentinel = observerTargetFollowers.current
    const scrollContainer = scrollContainerFollowersRef.current
    if (activeTab !== "followers" || !sentinel || !hasNextPageFollowers || !scrollContainer) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isFetchingNextPageFollowersRef.current) {
          fetchNextPageFollowers()
        }
      },
      { threshold: 0, rootMargin: "100px", root: scrollContainer },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPageFollowers, fetchNextPageFollowers, activeTab])

  const handleAdvertiserClick = (userId: number) => {
    router.push(`/advertiser/${userId}?return_to=profile&tab=follows`)
  }

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
              queryClient.invalidateQueries({ queryKey: queryKeys.buySell.favouriteUsers() })
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
            queryClient.invalidateQueries({ queryKey: queryKeys.buySell.favouriteUsers() })
          }
        })
        .catch((error) => {
          console.error("Error following user:", error)
        })
    }
  }

  const followingUserIds = useMemo(() => following.map((user) => user.user_id), [following])

  const isLoading = activeTab === "follows" ? isLoadingFollowing : isLoadingFollowers
  const isFetchingNextPage = activeTab === "follows" ? isFetchingNextPageFollows : isFetchingNextPageFollowers

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
        <TabsList className="w-full md:w-auto shrink-0">
          <TabsTrigger value="follows" className="flex-1 md:flex-none md:w-32">{t("profile.followsCount", { count: following.length })}</TabsTrigger>
          <TabsTrigger value="followers" className="flex-1 md:flex-none md:w-32">{t("profile.followersCount", { count: followers.length })}</TabsTrigger>
        </TabsList>

        <TabsContent value="follows" className="flex-1 min-h-0">
          <FollowUserList
            users={filteredUsers}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
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
            observerTarget={observerTargetFollows}
            scrollContainerRef={scrollContainerFollowsRef}
          />
        </TabsContent>

        <TabsContent value="followers" className="flex-1 min-h-0">
          <FollowUserList
            users={filteredUsers}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
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
            observerTarget={observerTargetFollowers}
            scrollContainerRef={scrollContainerFollowersRef}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
