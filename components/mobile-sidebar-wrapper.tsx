"use client"

import { useState, useEffect } from "react"
import { getHomeUrl } from "@/lib/utils"
import { useUserDataStore, getCachedSignup } from "@/stores/user-data-store"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useTranslations } from "@/lib/i18n/use-translations"

export function MobileSidebarTrigger() {
  const { t } = useTranslations()
  const { isWalletAccount, userData } = useUserDataStore()
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
    <Button
      variant="ghost"
      size="sm"
      className="md:hidden px-4 bg-[#ffffff0a] text-white text-sm gap-[6px] hover:bg-[#ffffff0a] hover:text-white"
      onClick={() => {
        const homeUrl = getHomeUrl(isV1Signup, "home", isWalletAccount)
        window.location.href = homeUrl
      }}
    >
      <Image src="/icons/home-logo.svg" alt="Home" width={14} height={22} />
      <span>{t("navigation.home")}</span>
    </Button>
  )
}
