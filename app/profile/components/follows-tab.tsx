"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { X, Search, Info } from "lucide-react"
import { getFavouriteUsers } from "@/services/api/api-profile"

interface FollowUser {
  username: string
}

export default function FollowsTab() {
  const [searchQuery, setSearchQuery] = useState("Brad")
  const [activeOnly, setActiveOnly] = useState(false)
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

  const handleUnfollow = (userId: string, username: string) => {
    console.log(`Unfollowing user: ${username} (${userId})`)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  const filterUsers = (value: string) => {
    let filtered = following

    if (value) {
      filtered = filtered.filter((user) => user.username?.toLowerCase().includes(value.toLowerCase()))
    }

    return filtered
  }

  const UserCard = ({ user }: { user: FollowUser }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
            {user.username.charAt(0).toUpperCase()}
          </div>
          {user.status === "online" && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div>
          <div className="font-medium text-gray-900">{user.username}</div>
          <div className="text-sm text-gray-500">
            {user.activeAds} active ads
            {user.status === "online" ? (
              <span className="ml-2">Online</span>
            ) : (
              <span className="ml-2">Last seen {user.lastSeen}</span>
            )}
          </div>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleUnfollow(user.id, user.username)}
        className="rounded-full px-4 py-1 text-sm"
      >
        Unfollow
      </Button>
    </div>
  )


  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-base font-normal">Following ({following.length})</h3>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => filterUsers(e.target.value)}
            className="pl-10 pr-10 rounded-full border-gray-300"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={activeOnly} onCheckedChange={setActiveOnly} className="data-[state=checked]:bg-gray-400" />
          <span className="text-sm text-gray-600">Active only</span>
          <Info className="w-4 h-4 text-gray-400" />
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
