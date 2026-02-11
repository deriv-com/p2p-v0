"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import EmptyState from "@/components/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
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
      <div className="h-[72px] flex items-center justify-between gap-3">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {user.nickname?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 border-b border-gray-100 py-4 flex items-center justify-between">
          <Button
            onClick={() => onUserClick(user.user_id)}
            className="hover:underline hover:bg-transparent cursor-pointer font-normal text-slate-1200 px-0 text-base"
            size="sm"
            variant="ghost"
          >
            {user.nickname}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFollowToggle(user, showFollowingButton ? true : isFollowing)}
            className="rounded-full px-4 py-1 text-sm"
          >
            {showFollowingButton ? t("profile.unfollow") : isFollowing ? "Following" : "Follow"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4">
      {(users.length > 0 || searchQuery) && (
        <div className="flex items-center justify-between gap-4 mb-4">
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
              onChange={onSearchChange}
              className="h-14 pl-10 pr-10 border-0 bg-grayscale-500 rounded-lg focus:outline-none"
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

      <div className="space-y-0">
        {isLoading ? (
          <div className="space-y-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[72px] flex items-center justify-between gap-3">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0 bg-grayscale-500" />
                <div className="flex-1 border-b border-gray-100 py-4 flex items-center justify-between">
                  <Skeleton className="h-5 w-32 bg-grayscale-500" />
                  <Skeleton className="h-8 w-20 rounded-full bg-grayscale-500" />
                </div>
              </div>
            ))}
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
