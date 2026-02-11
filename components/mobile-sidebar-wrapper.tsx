"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useChatVisibilityStore } from "@/stores/chat-visibility-store"

export function MobileSidebarTrigger() {
  const pathname = usePathname()
  const router = useRouter()
  const { isChatVisible } = useChatVisibilityStore()
  const isProfilePage = pathname === "/profile" || pathname.startsWith("/profile/")
  const isOrderDetailPage = pathname.match(/^\/orders\/[^/]+$/)

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/market")
    }
  }

  // Show back button on profile page or when in chat view on order details
  if (isProfilePage || (isOrderDetailPage && isChatVisible)) {
    return (
      <Button
        onClick={handleBack}
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full bg-[#ffffff0a]"
      >
        <Image src="/icons/arrow-back.svg" width={24} height={24} alt="Back" />
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
