"use client"

import Image from "next/image"
import { useIsMobile } from "@/hooks/use-mobile"

export default function CustomBell() {
  const isMobile = useIsMobile()

  // Only show custom bell on responsive screens (mobile)
  if (!isMobile) {
    return null
  }

  return <Image src="/icons/bell-sm.png" alt="Notifications" width={24} height={24} />
}
