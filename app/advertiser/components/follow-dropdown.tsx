"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"

interface FollowDropdownProps {
  isFollowing: boolean
  isGroupMember: boolean
  isLoading: boolean
  onUnfollow: () => void
  onAddToClosedGroup: () => void
  onRemoveFromClosedGroup: () => void
  nickname: string
}

export default function FollowDropdown({
  isFollowing,
  isGroupMember,
  isLoading,
  onUnfollow,
  onAddToClosedGroup,
  onRemoveFromClosedGroup,
  nickname
}: FollowDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  const handleUnfollow = () => {
    onUnfollow()
    setIsOpen(false)
  }

  const handleAddToClosedGroup = () => {
    onAddToClosedGroup()
    setIsOpen(false)
  }

  const handleRemoveFromClosedGroup = () => {
    onRemoveFromClosedGroup()
    setIsOpen(false)
  }

  if (!isFollowing) {
    return null
  }

  if (!isMobile) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            Following
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="p-2">
          {isGroupMember ? (<DropdownMenuItem
            onClick={handleRemoveFromClosedGroup}
            className="flex items-center gap-2 py-3 px-4 cursor-pointer"
          >
            <Image src="/icons/star.svg" alt="Add to closed group" width={20} height={20} />
            <span className="text-base text-grayscale-600">Remove from closed group</span>
          </DropdownMenuItem>) : (<DropdownMenuItem
            onClick={handleAddToClosedGroup}
            className="flex items-center gap-2 py-3 px-4 cursor-pointer"
          >
            <Image src="/icons/star.svg" alt="Add to closed group" width={20} height={20} />
            <span className="text-base text-grayscale-600">Add to closed group</span>
          </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={handleUnfollow}
            className="flex items-center gap-2 py-3 px-4 cursor-pointer"
          >
            <Image src="/icons/unfollow.svg" alt="Unfollow" width={20} height={20} />
            <span className="text-base text-grayscale-600">Unfollow</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <>
      <Button variant="outline" size="sm" disabled={isLoading} onClick={() => setIsOpen(true)}>
        Following
      </Button>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent side="bottom" className="h-auto p-6 rounded-t-2xl">
          <DrawerHeader>
            <DrawerTitle className="font-bold text-xl">{nickname}</DrawerTitle>
          </DrawerHeader>
          <div>
            <Button
              onClick={handleAddToClosedGroup}
              className="w-full gap-3 py-3 text-left font-normal flex justify-start px-0"
              variant="ghost"
            >
              <Image src="/icons/star.svg" alt="Add to closed group" width={20} height={20} />
              <span className="text-base text-grayscale-600">Add to closed group</span>
            </Button>
            <Button
              onClick={handleUnfollow}
              className="w-full gap-3 py-3 text-left font-normal flex justify-start px-0"
              variant="ghost"
            >
              <Image src="/icons/unfollow.svg" alt="Unfollow" width={20} height={20} />
              <span className="text-base text-grayscale-600">Unfollow</span>
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
