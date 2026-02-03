"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function MobileSidebarTrigger() {
  const pathname = usePathname()
  const router = useRouter()
  const isProfilePage = pathname === "/profile" || pathname.startsWith("/profile/")

  if (isProfilePage) {
    return (
      <Button
        onClick={() => router.back()}
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full bg-[#ffffff0a]"
      >
        <Image src="/icons/arrow-back.svg" width={20} height={20} alt="Back" />
      </Button>
    )
  }

  return (
    <Link
      href="/profile"
      className="h-8 w-8 text-center max-w-full py-2"
    >
      <div className="h-8 w-8 flex items-center justify-center flex-shrink-0 rounded-full bg-[#ffffff0a]">
        <Image src="/icons/profile-icon-white.svg" width={24} height={24} alt="Profile" />
      </div>
    </Link>
  )
}
