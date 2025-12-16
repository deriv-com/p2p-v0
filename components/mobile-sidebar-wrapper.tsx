"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Sidebar from "./sidebar"
import Image from "next/image"

export function MobileSidebarTrigger() {
  const [isV1Signup, setIsV1Signup] = useState(() => {
    const cached = getCachedSignup()
    if (cached !== null) return cached === "v1"
    return userData?.signup === "v1"
  })

  useEffect(() => {
    if (userData?.signup === "v1") {
      setIsV1Signup(true)
    } else if (userData?.signup) {
      setIsV1Signup(false)
    }
  }, [userData?.signup])

  return (
    <Button variant="ghost" size="sm" className="md:hidden px-2" onClick={() => {
      const homeUrl = getHomeUrl(isV1Signup, "home")
      window.location.href = homeUrl
    }}>
      <Image src="/icons/menu.png" alt="Menu" width={24} height={24} />
    </Button>
  )
}
