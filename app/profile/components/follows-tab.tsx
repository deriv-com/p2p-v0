"use client"

import type React from "react"

import { useCallback, useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useIsMobile } from "@/components/ui/use-mobile"
import { X } from "lucide-react"
import { getFavouriteUsers } from "@/services/api/api-profile"
import Image from "next/image"
import EmptyState from "@/components/empty-state"

interface FollowUser {
  nickname: string
  user_id: number
}

export default function FollowsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [following, setFollowing] = useState<FollowUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<FollowUser | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await getFavouriteUsers()
        setFollowing(data)
      } catch (err) {
        console.error("Failed to fetch favourite users:", err)
        setError("Failed to load following list")
        setFollowing([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFollowing()
  }, [])

  const filteredFollowing = useMemo(() => {
    if (!searchQuery.trim()) return following

    return following.filter((user) => user.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [following, searchQuery])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleUnfollow = (user: FollowUser) => {
    setSelectedUser(user)
    setShowUnfollowDialog(true)
  }

  const handleConfirmUnfollow = () => {
    if (selectedUser) {
      console.log(`Unfollowing user: ${selectedUser.nickname} (${selectedUser.user_id})`)
      // TODO: Add actual unfollow API call here
      setFollowing((prev) => prev.filter((user) => user.user_id !== selectedUser.user_id))
    }
    setShowUnfollowDialog(false)
    setSelectedUser(null)
  }

  const handleCancelUnfollow = () => {
    setShowUnfollowDialog(false)
    setSelectedUser(null)
  }

  const UserCard = ({ user }: { user: FollowUser }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
            {user.nickname?.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="font-medium text-gray-900">{user.nickname}</div>
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

  const UnfollowConfirmationDialog = () => {
    if (!selectedUser) return null

    const title = `Unfollow ${selectedUser.nickname}?`
    const description = "You're about to unfollow this user. You'll lose quick access to their profile and active ads."

    if (isMobile) {
      return (
        <Sheet open={showUnfollowDialog} onOpenChange={setShowUnfollowDialog}>
          <SheetContent side="bottom" className="rounded-t-[32px] p-6">
            <SheetHeader className="text-left mb-6">
              <div className="flex items-center justify-between mb-4">
                <SheetTitle className="text-xl font-bold">{title}</SheetTitle>
                <Button variant="ghost" size="sm" onClick={handleCancelUnfollow} className="p-1 h-auto">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SheetDescription className="text-gray-600 text-base">{description}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-3">
              <Button onClick={handleConfirmUnfollow} variant="black" className="w-full rounded-full">
                Unfollow
              </Button>
              <Button onClick={handleCancelUnfollow} variant="outline" className="w-full rounded-full bg-transparent">
                Cancel
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )
    }

    return (
      <Dialog open={showUnfollowDialog} onOpenChange={setShowUnfollowDialog}>
        <DialogContent className="sm:max-w-md rounded-[32px] p-6">
          <DialogHeader className="text-left mb-6">
            <div className="flex items-center justify-between mb-4">
              <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
              <Button variant="ghost" size="sm" onClick={handleCancelUnfollow} className="p-1 h-auto">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <DialogDescription className="text-gray-600 text-base">{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-3 sm:flex-col">
            <Button onClick={handleConfirmUnfollow} variant="black" className="w-full rounded-full">
              Unfollow
            </Button>
            <Button onClick={handleCancelUnfollow} variant="outline" className="w-full rounded-full bg-transparent">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative mb-4">
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
            className="pl-10 pr-10 border-grayscale-500 focus:border-grayscale-500 md:border-gray-300 md:focus:border-black bg-grayscale-500 md:bg-transparent rounded-lg"
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

      <div className="space-y-0 divide-y divide-gray-100">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
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

      <UnfollowConfirmationDialog />
    </div>
  )
}
