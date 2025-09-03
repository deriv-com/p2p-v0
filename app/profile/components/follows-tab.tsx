"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { X, Search, Info } from "lucide-react"

interface FollowUser {
  id: string
  username: string
  activeAds: number
  status: "online" | "offline"
  lastSeen?: string
}

// Mock data - replace with actual API data
const mockFollowing: FollowUser[] = [
  {
    id: "1",
    username: "Brad_user",
    activeAds: 2,
    status: "online",
  },
  {
    id: "2",
    username: "Bradley-cooper",
    activeAds: 10,
    status: "offline",
    lastSeen: "2 min ago",
  },
]

const mockFollowers: FollowUser[] = [
  {
    id: "3",
    username: "Alice_trader",
    activeAds: 5,
    status: "online",
  },
  {
    id: "4",
    username: "Bob_crypto",
    activeAds: 3,
    status: "offline",
    lastSeen: "1 hour ago",
  },
  {
    id: "5",
    username: "Charlie_p2p",
    activeAds: 8,
    status: "online",
  },
  {
    id: "6",
    username: "Diana_exchange",
    activeAds: 1,
    status: "offline",
    lastSeen: "5 min ago",
  },
]

export default function FollowsTab() {
  const [searchQuery, setSearchQuery] = useState("Brad")
  const [activeOnly, setActiveOnly] = useState(false)
  const [activeTab, setActiveTab] = useState("following")

  const handleUnfollow = (userId: string, username: string) => {
    // TODO: Implement unfollow functionality
    console.log(`Unfollowing user: ${username} (${userId})`)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  const filterUsers = (users: FollowUser[]) => {
    let filtered = users

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((user) => user.username.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Filter by active only
    if (activeOnly) {
      filtered = filtered.filter((user) => user.status === "online")
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

  const followingCount = mockFollowing.length
  const followersCount = mockFollowers.length
  const filteredFollowing = filterUsers(mockFollowing)
  const filteredFollowers = filterUsers(mockFollowers)

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-transparent p-0 h-auto border-b border-gray-200 w-full justify-start rounded-none">
          <TabsTrigger
            value="following"
            className="px-0 py-3 mr-8 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent"
          >
            <span className="text-base font-normal">Following ({followingCount})</span>
          </TabsTrigger>
          <TabsTrigger
            value="followers"
            className="px-0 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none bg-transparent"
          >
            <span className="text-base font-normal">Followers ({followersCount})</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center justify-between gap-4 py-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        <TabsContent value="following" className="mt-0">
          <div className="space-y-0 divide-y divide-gray-100">
            {filteredFollowing.length > 0 ? (
              filteredFollowing.map((user) => <UserCard key={user.id} user={user} />)
            ) : (
              <div className="py-8 text-center text-gray-500">
                {searchQuery ? "No users found matching your search." : "You're not following anyone yet."}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="followers" className="mt-0">
          <div className="space-y-0 divide-y divide-gray-100">
            {filteredFollowers.length > 0 ? (
              filteredFollowers.map((user) => <UserCard key={user.id} user={user} />)
            ) : (
              <div className="py-8 text-center text-gray-500">
                {searchQuery ? "No users found matching your search." : "No followers yet."}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
