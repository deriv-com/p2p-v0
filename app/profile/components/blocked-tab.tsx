"use client"

import type React from "react"

import { useCallback, useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { getBlockedUsers } from "@/services/api/api-profile"
import { toggleBlockAdvertiser } from "@/services/api/api-buy-sell"
import Image from "next/image"
import EmptyState from "@/components/empty-state"
import { useToast } from "@/hooks/use-toast"

interface BlockedUser {
  nickname: string
  user_id: number
}

export default function BlockedTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showAlert } = useAlertDialog()
  const { toast } = useToast()

  const fetchBlockedUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getBlockedUsers()
      setBlockedUsers(data)
    } catch (err) {
      console.error("Failed to fetch blocked users:", err)
      setError("Failed to load blocked users list")
      setBlockedUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlockedUsers()
  }, [fetchBlockedUsers])

  const filteredBlockedUsers = useMemo(() => {
    if (!searchQuery.trim()) return blockedUsers

    return blockedUsers.filter((user) => user.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [blockedUsers, searchQuery])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleUnblock = (user: BlockedUser) => {
    showAlert({
      title: `Unblock ${user.nickname}?`,
      description: "You'll be able to see their ads and they can place orders on yours again.",
      confirmText: "Unblock",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          const result = await toggleBlockAdvertiser(user.user_id, false)

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
                  <span>{`${user.nickname} unblocked.`}</span>
                </div>
              ),
              className: "bg-black text-white border-black h-[48px] rounded-lg px-[16px] py-[8px]",
              duration: 2500,
            })
            await fetchBlockedUsers()
          }
        } catch (error) {
          console.error("Error unblocking user:", error)
        }
      },
    })
  }

  const UserCard = ({ user }: { user: BlockedUser }) => (
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
        onClick={() => handleUnblock(user)}
        className="rounded-full px-4 py-1 text-sm"
      >
        Unblock
      </Button>
    </div>
  )

  return (
    <div className="space-y-4">
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

      <div className="space-y-0 divide-y divide-gray-100">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : filteredBlockedUsers.length > 0 ? (
          filteredBlockedUsers.map((user) => <UserCard key={user.user_id} user={user} />)
        ) : (
          <EmptyState
            title={searchQuery ? "No matching name" : "No blocked users"}
            description={searchQuery ? "" : "Users you block will appear here."}
            redirectToAds={false}
          />
        )}
      </div>
    </div>
  )
}
