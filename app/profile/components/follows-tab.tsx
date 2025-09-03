"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search } from "lucide-react"
import { getFavouriteUsers } from "@/services/api/api-profile"
import Image from "next/image"

interface FollowUser {
  nickname: string
}

export default function FollowsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [following, setFollowing] = useState<FollowUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const handleUnfollow = (userId: string, nickname: string) => {
    console.log(`Unfollowing user: ${nickname} (${userId})`)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  const filterUsers = (value: string) => {
    let filtered = following

    if (value) {
      filtered = filtered.filter((user) => user.nickname?.toLowerCase().includes(value.toLowerCase()))
    }

    return filtered
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
        onClick={() => handleUnfollow(user.id, user.nickname)}
        className="rounded-full px-4 py-1 text-sm"
      >
        Unfollow
      </Button>
    </div>
  )


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
                onChange={filterUsers}
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
        ) : following.length > 0 ? (
          following.map((user) => <UserCard key={user.id} user={user} />)
        ) : (
          <div className="py-8 text-center text-gray-500">
            {searchQuery ? "No users found matching your search." : "You're not following anyone yet."}
          </div>
        )}
      </div>
    </div>
  )
}
