import { useState, useEffect, useCallback, useMemo } from "react"
import { getFavouriteUsers, getFollowers } from "@/services/api/api-profile"
import { toggleFavouriteAdvertiser } from "@/services/api/api-buy-sell"

export interface FollowUser {
  nickname: string
  user_id: number
}

export function useFollows() {
  const [following, setFollowing] = useState<FollowUser[]>([])
  const [followers, setFollowers] = useState<FollowUser[]>([])
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(true)
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("follows")

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

  const handleToggleFollow = useCallback(
    async (userId: number, shouldFollow: boolean) => {
      try {
        const result = await toggleFavouriteAdvertiser(userId, shouldFollow)
        if (result.success) {
          await fetchFollowing()
        }
        return result
      } catch (error) {
        console.error("Error toggling follow:", error)
        throw error
      }
    },
    [fetchFollowing]
  )

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
  }, [])

  const filteredUsers = useMemo(() => {
    const users = activeTab === "follows" ? following : followers
    if (!searchQuery.trim()) return users
    return users.filter((user) => user.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [following, followers, searchQuery, activeTab])

  const followingUserIds = useMemo(() => following.map((user) => user.user_id), [following])

  const isLoading = activeTab === "follows" ? isLoadingFollowing : isLoadingFollowers

  return {
    following,
    followers,
    isLoadingFollowing,
    isLoadingFollowers,
    isLoading,
    searchQuery,
    activeTab,
    filteredUsers,
    followingUserIds,
    fetchFollowing,
    fetchFollowers,
    handleToggleFollow,
    handleSearchChange,
    handleClearSearch,
    setActiveTab,
    setSearchQuery,
  }
}
