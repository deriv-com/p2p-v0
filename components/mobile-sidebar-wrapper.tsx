"use client"

import Link from "next/link"
import { SvgIcon } from "@/components/icons/svg-icon"
import ProfileIcon from "@/public/icons/profile-icon.svg"

export function MobileSidebarTrigger() {
  return (
    <Link
      href="/profile"
      className="px-1 text-center max-w-full py-2"
    >
      <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
        <SvgIcon src={ProfileIcon} />
      </div>
    </Link>
  )
}
