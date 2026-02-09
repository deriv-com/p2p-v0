"use client"

import type React from "react"
import { useCallback, useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import EmptyState from "@/components/empty-state"
import { useTranslations } from "@/lib/i18n/use-translations"
import { getFavouriteUsers, removeAllFromClosedGroup, addToClosedGroup, removeFromClosedGroup } from "@/services/api/api-profile"
interface ClosedGroup {
  user_id: number
  nickname: string
  is_group_member: boolean
}

export default function ClosedGroupTab() {
  const { t } = useTranslations()
  const [searchQuery, setSearchQuery] = useState("")
  const [closedGroups, setClosedGroups] = useState<ClosedGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRemoving, setIsRemoving] = useState(false)

  const fetchClosedGroups = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getFavouriteUsers()
      setClosedGroups(data)
    } catch (err) {
      console.error("Failed to fetch closed groups:", err)
      setClosedGroups([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClosedGroups()
  }, [fetchClosedGroups])

  const filteredClosedGroups = useMemo(() => {
    if (!searchQuery.trim()) return closedGroups

    return closedGroups.filter((group) => group.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [closedGroups, searchQuery])

  const hasGroupMembers = useMemo(() => {
    return closedGroups.some((group) => group.is_group_member)
  }, [closedGroups])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const handleRemoveAll = useCallback(async () => {
    try {
      setIsRemoving(true)
      const result = await removeAllFromClosedGroup()
      if (result.success) {
        await fetchClosedGroups()
      }
    } catch (err) {
      console.error("Failed to remove all from closed group:", err)
    } finally {
      setIsRemoving(false)
    }
  }, [fetchClosedGroups])

  const handleToggleMembership = useCallback(async (group: ClosedGroup) => {
    try {
      if (!group.user_id) {
        return
      }

      let result
      if (group.is_group_member) {
        result = await removeFromClosedGroup(group.user_id)
      } else {
        result = await addToClosedGroup(group.user_id)
      }

      if (result.success) {
        await fetchClosedGroups()
      }
    } catch (err) {
      console.error("Failed to update closed group membership:", err)
    }
  }, [fetchClosedGroups])

  const GroupCard = ({ group }: { group: ClosedGroup }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex flex-1 items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
          {group.nickname?.charAt(0).toUpperCase()}
        </div>
        <div className="text-slate-1200 flex-1">{group.nickname}</div>
        <Button
          onClick={() => handleToggleMembership(group)}
          variant="outline"
          size="sm"
          className="min-w-fit"
        >
          {group.is_group_member ? "Remove" : "Add"}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {(filteredClosedGroups.length > 0 || searchQuery) && (
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full md:w-[360px]">
            <Image
              src="/icons/search-icon-custom.png"
              alt="Search"
              width={24}
              height={24}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
            />
            <Input
              placeholder={t("common.search")}
              value={searchQuery}
              onChange={handleSearchChange}
              className="h-14 pl-10 pr-10 border-0 bg-grayscale-500 rounded-lg focus:outline-none"
              autoComplete="off"
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

      {closedGroups.length > 0 && (<div className="flex items-center justify-between">
        <h2 className="text-grayscale-text-muted text-base">{t("profile.addFromYourFollowing")}</h2>
        {closedGroups.length > 0 && (
          <Button
            onClick={handleRemoveAll}
            disabled={isRemoving || !hasGroupMembers}
            variant="ghost"
            size="sm"
            className="px-0 underline hover:opacity-100 disabled:text-grayscale-text-placeholder"
          >
            Remove all
          </Button>
        )}
      </div>)}

      <div className="space-y-0 divide-y divide-gray-100">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
            <p className="mt-2 text-slate-600">Loading users...</p>
          </div>
        ) : filteredClosedGroups.length > 0 ? (
          filteredClosedGroups.map((group) => <GroupCard key={group.user_id} group={group} />)
        ) : (
          <EmptyState
            title={searchQuery ? "No matching name" : "No followed users yet"}
            description={
              searchQuery ? t("profile.noResultFor", { query: searchQuery }) : "You can only add users you follow to your closed group. Go to a user's profile and tap Follow to see them here."
            }
            redirectToAds={false}
          />
        )}
      </div>
    </div>
  )
}
