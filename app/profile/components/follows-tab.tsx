"use client"

import type React from "react"

import { useCallback, useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { getFavouriteUsers } from "@/services/api/api-profile"
import { toggleFavouriteAdvertiser } from "@/services/api/api-buy-sell"
import Image from "next/image"
import EmptyState from "@/components/empty-state"
import { useToast } from "@/hooks/use-toast"

interface FollowUser {
  nickname: string
  user_id: number
}

export default function FollowsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [following, setFollowing] = useState<FollowUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showAlert } = useAlertDialog()
  const { toast } = useToast()

  const fetchFollowing = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getFavouriteUsers()
      setFollowing(data)
    } catch (err) {
      console.error("Failed to fetch favourite users:", err)
      setFollowing([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFollowing()
  }, [fetchFollowing])

  const filteredFollowing = useMemo(() => {
    if (!searchQuery.trim()) return following

    return following.filter((user) => user.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [following, searchQuery])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleUnfollow = (user: FollowUser) => {
    showAlert({
      title: `Unfollow ${user.nickname}?`,
      description: "You're about to unfollow this user. You'll lose quick access to their profile and active ads.",
      confirmText: "Unfollow",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const result = await toggleFavouriteAdvertiser(user.user_id, false)

          if (result.success) {
            toast({
              description: (
                <div className="flex items-center gap-2">
                  <Image
                    src="/icons/success-checkmark.png"
                    alt="Success"
                    width={24}
                    height={24}
                    className="text-white"
                  />
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
  }

  const UserCard = ({ user }: { user: FollowUser }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
            {user.nickname?.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="text-gray-900">{user.nickname}</div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleUnfollow(user)}
        className="rounded-full px-4 py-1 text-sm"
      >
        Unfollow
      </Button>
    </div>
  )

  return (
    <div className="space-y-4">
      {filteredFollowing.length > 0 && (
        <div className="flex items-center justify-between gap-4">
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
        ) : filteredFollowing.length > 0 ? (
          filteredFollowing.map((user) => <UserCard key={user.user_id} user={user} />)
        ) : (
          <EmptyState
            title={searchQuery ? "No matching name" : "Not following anyone yet"}
            description={searchQuery ? "" : "Start following users to see them here."}
            redirectToAds={false}
          />
        )}
      </div>
    </div>
  )
}
