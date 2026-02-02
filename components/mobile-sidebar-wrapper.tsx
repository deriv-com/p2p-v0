"use client"

import Link from "next/link"
import Image from "next/image"

export function MobileSidebarTrigger() {
  return (
    <Link
      href="/profile"
      className="h-8 w-8 text-center max-w-full py-2 rounded-full bg-[#ffffff0a]"
    >
      <div className="h-8 w-8 flex items-center justify-center flex-shrink-0">
        <Image src="/icons/profile-icon-white.svg" width={24} height={24} />
      </div>
    </Link>
  )
}
