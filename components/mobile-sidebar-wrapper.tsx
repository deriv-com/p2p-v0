"use client"

import Link from "next/link"
import Image from "next/image"

export function MobileSidebarTrigger() {
  return (
    <Link
      href="/profile"
      className="px-1 text-center max-w-full py-2"
    >
      <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
        <Image src="/icons/profile-icon-white.svg" width={24} height={24} />
      </div>
    </Link>
  )
}
