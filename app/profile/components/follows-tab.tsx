"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useCallback, useState, useEffect, useMemo } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { getFavouriteUsers, getFollowers } from "@/services/api/api-profile"
import { toggleFavouriteAdvertiser } from "@/services/api/api-buy-sell"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import FollowUserList from "./follow-user-list"

interface FollowUser {
  nickname: string
  user_id: number
}

export default function FollowsTab() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [following, setFollowing] = useState<FollowUser[]>([])
  const [followers, setFollowers] = useState<FollowUser[]>([])
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(true)
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(true)
  const [activeTab, setActiveTab] = useState("follows")
  const { showAlert } = useAlertDialog()
  const { toast } = useToast()

  const handleAdvertiserClick = (userId: number) => {
    router.push(`/advertiser/${userId}`)
  }

  const fetchFollowing = useCallback(async () => {
    try {
      setIsLoadingFollowing(true)
      const data = await getFavouriteUsers()
      setFollowing(data)
    } catch (err) {
      console.error("Failed to fetch favourite users:", err)
      setFollowing([])
    } finally {
      setIsLoadingFollowing(false)
    }
  }, [])

  const fetchFollowers = useCallback(async () => {
    try {
      setIsLoadingFollowers(true)
      const data = await getFollowers()
      setFollowers(data)
    } catch (err) {
      console.error("Failed to fetch followers:", err)
      setFollowers([])
    } finally {
      setIsLoadingFollowers(false)
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
        title: `Unfollow ${user.nickname}?`,
        description: "You're about to unfollow this user. You'll lose quick access to their profile and active ads.",
        confirmText: "Unfollow",
        cancelText: "Cancel",
        type: "warning",
        onConfirm: async () => {
          try {
            const result = await toggleFavouriteAdvertiser(user.user_id, false)

            if (result.success) {
              toast({
                description: (
                  <div className="flex items-center gap-2">
                    <Image src="/icons/tick.svg" alt="Success" width={24} height={24} className="text-white" />
                    <span>{`${user.nickname} unfollowed.`}</span>
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
                  <span>{`${user.nickname} followed.`}</span>
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full">
          <TabsTrigger
            value="follows"
          >
            Follows ({following.length})
          </TabsTrigger>
          <TabsTrigger
            value="followers"
          >
            Followers ({followers.length})
          </TabsTrigger>
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
            emptyTitle="Not following anyone yet"
            emptyDescription="Start following users to see them here."
            searchEmptyTitle="No matching name"
            searchEmptyDescription={`There is no result for ${searchQuery}.`}
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
            emptyTitle="No followers yet"
            emptyDescription="When users follow you, they'll appear here."
            searchEmptyTitle="No matching name"
            searchEmptyDescription={`There is no result for ${searchQuery}.`}
            showFollowingButton={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
