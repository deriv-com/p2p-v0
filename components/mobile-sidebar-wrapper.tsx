"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/i18n/use-translations"

export function MobileSidebarTrigger() {
  const { t } = useTranslations()
  const pathname = usePathname()
  const router = useRouter()
  const isProfilePage = pathname === "/profile" || pathname.startsWith("/profile/")

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/market")
    }
  }

  if (isProfilePage) {
    return (
      <Button
        onClick={handleBack}
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full bg-[#ffffff0a]"
      >
        <Image src="/icons/arrow-back.svg" width={24} height={24} alt={t("common.back")} />
      </Button>
    )
  }

  return (
    <Link
      href="/profile"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ffffff0a]"
    >
      <Image src="/icons/profile-icon-white.svg" width={24} height={24} alt={t("common.profile")} />
    </Link>
  )
}
