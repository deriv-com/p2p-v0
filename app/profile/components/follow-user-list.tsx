"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import EmptyState from "@/components/empty-state"
import { useTranslations } from "@/lib/i18n/use-translations"

interface FollowUser {
  nickname: string
  user_id: number
}

interface FollowUserListProps {
  users: FollowUser[]
  isLoading: boolean
  searchQuery: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClearSearch: () => void
  onUserClick: (userId: number) => void
  onFollowToggle: (user: FollowUser, isFollowing: boolean) => void
  followingUserIds: number[]
  emptyTitle: string
  emptyDescription: string
  searchEmptyTitle: string
  searchEmptyDescription: string
  showFollowingButton?: boolean
}

export default function FollowUserList({
  users,
  isLoading,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onUserClick,
  onFollowToggle,
  followingUserIds,
  emptyTitle,
  emptyDescription,
  searchEmptyTitle,
  searchEmptyDescription,
  showFollowingButton = false,
}: FollowUserListProps) {
  const { t } = useTranslations()

  const UserCard = ({ user }: { user: FollowUser }) => {
    const isFollowing = followingUserIds.includes(user.user_id)

    return (
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-1">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm">
              {user.nickname?.charAt(0).toUpperCase()}
            </div>
          </div>
          <Button
            onClick={() => onUserClick(user.user_id)}
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
          onClick={() => onFollowToggle(user, showFollowingButton ? true : isFollowing)}
          className="rounded-full px-4 py-1 text-sm"
        >
          {showFollowingButton ? t("profile.unfollow") : isFollowing ? "Following" : "Follow"}
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-4">
      {(users.length > 0 || searchQuery) && (
        <div className="flex items-center justify-between gap-4 mb-4">
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
              onChange={onSearchChange}
              className="pl-10 pr-10 border-0 bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              autoComplete="off"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSearch}
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
            <p className="mt-2 text-slate-600">{t("profile.loadingUsers")}</p>
          </div>
        ) : users.length > 0 ? (
          users.map((user) => <UserCard key={user.user_id} user={user} />)
        ) : (
          <EmptyState
            title={searchQuery ? searchEmptyTitle : emptyTitle}
            description={searchQuery ? searchEmptyDescription : emptyDescription}
            redirectToAds={false}
          />
        )}
      </div>
    </div>
  )
}
