"use client"

import type React from "react"
import { useCallback, useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import EmptyState from "@/components/empty-state"
import { useTranslations } from "@/lib/i18n/use-translations"
import { getFavouriteUsers } from "@/services/api/api-profile"
import { Checkbox } from "@/components/ui/checkbox"

interface ClosedGroup {
  id: number
  nickname: string
  is_group_member: boolean
}

export default function ClosedGroupTab() {
  const { t } = useTranslations()
  const [searchQuery, setSearchQuery] = useState("")
  const [closedGroups, setClosedGroups] = useState<ClosedGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
  }, [])

  const GroupCard = ({ group }: { group: ClosedGroup }) => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
          {group.nickname?.charAt(0).toUpperCase()}
        </div>
        <div className="text-slate-1200 flex-1">{group.nickname}</div>
        <Checkbox checked={group.is_group_member} className="border-slate-1200 data-[state=checked]:!bg-slate-1200 data-[state=checked]:!border-slate-1200 rounded-[2px]" />
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {(filteredClosedGroups.length > 0 || searchQuery) && (
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full md:w-[50%]">
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
              className="pl-10 pr-10 border-gray-300 focus:border-black bg-transparent rounded-lg"
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

      <div className="space-y-0 divide-y divide-gray-100">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"></div>
            <p className="mt-2 text-slate-600">{t("profile.loadingGroups")}</p>
          </div>
        ) : filteredClosedGroups.length > 0 ? (
          filteredClosedGroups.map((group) => <GroupCard key={group.id} group={group} />)
        ) : (
          <EmptyState
            title={searchQuery ? t("profile.noMatchingGroup") : t("profile.noClosedGroups")}
            description={
              searchQuery ? t("profile.noResultFor", { query: searchQuery }) : t("profile.closedGroupsAppear")
            }
            redirectToAds={false}
          />
        )}
      </div>
    </div>
  )
}
