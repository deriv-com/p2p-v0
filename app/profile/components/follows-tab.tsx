"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useCallback, useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { getFavouriteUsers, getFollowers } from "@/services/api/api-profile"
import { toggleFavouriteAdvertiser } from "@/services/api/api-buy-sell"
import Image from "next/image"
import EmptyState from "@/components/empty-state"
import { useToast } from "@/hooks/use-toast"

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
      // Follow the user
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

  const UserCard = ({ user, showFollowButton }: { user: FollowUser; showFollowButton: boolean }) => {
    // Check if this user is in the following list
    const isFollowing = following.some((f) => f.user_id === user.user_id)

    return (
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-1">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
              {user.nickname?.charAt(0).toUpperCase()}
            </div>
          </div>
          <Button
            onClick={() => handleAdvertiserClick(user.user_id)}
            className="hover:underline hover:bg-transparent cursor-pointer font-normal"
            size="sm"
            variant="ghost"
          >
            {user.nickname}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFollowToggle(user, showFollowButton ? true : isFollowing)}
          className="rounded-full px-4 py-1 text-sm"
        >
          {showFollowButton || isFollowing ? "Following" : "Follow"}
        </Button>
      </div>
    )
  }

  const isLoading = activeTab === "follows" ? isLoadingFollowing : isLoadingFollowers

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-transparent p-0 h-auto border-b border-gray-200 rounded-none justify-start">
          <TabsTrigger
            value="follows"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 font-semibold"
          >
            Follows ({following.length})
          </TabsTrigger>
          <TabsTrigger
            value="followers"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 font-semibold"
          >
            Followers ({followers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="follows" className="mt-4">
          {(filteredUsers.length > 0 || searchQuery) && (
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="relative w-full md:w-auto">
                <Image
                  src="/icons/search-icon-custom.png"
                  alt="Search"
                  width={24}
                  height={24}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-10 border-gray-300 focus:border-black bg-transparent rounded-lg"
                  autoComplete="off"
                  autoFocus
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

          <div className="space-y-0 divide-y divide-gray-100">
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => <UserCard key={user.user_id} user={user} showFollowButton={true} />)
            ) : (
              <EmptyState
                title={searchQuery ? "No matching name" : "Not following anyone yet"}
                description={
                  searchQuery ? `There is no result for ${searchQuery}.` : "Start following users to see them here."
                }
                redirectToAds={false}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="followers" className="mt-4">
          {(filteredUsers.length > 0 || searchQuery) && (
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="relative w-full md:w-auto">
                <Image
                  src="/icons/search-icon-custom.png"
                  alt="Search"
                  width={24}
                  height={24}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 pr-10 border-gray-300 focus:border-black bg-transparent rounded-lg"
                  autoComplete="off"
                  autoFocus
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

          <div className="space-y-0 divide-y divide-gray-100">
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => <UserCard key={user.user_id} user={user} showFollowButton={false} />)
            ) : (
              <EmptyState
                title={searchQuery ? "No matching name" : "No followers yet"}
                description={
                  searchQuery ? `There is no result for ${searchQuery}.` : "When users follow you, they'll appear here."
                }
                redirectToAds={false}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
