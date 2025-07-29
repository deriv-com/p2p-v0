"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface MyAdsHeaderProps {
  hasAds: boolean
}

export default function MyAdsHeader({ hasAds }: MyAdsHeaderProps) {
  const router = useRouter()

  if (!hasAds) {
    return null
  }

  return (
    <div className="mt-4 mb-6">
      <div className="container mx-auto">
        <Button
          onClick={() => router.push("/create-ad")}
          className="bg-[#00D2FF] hover:bg-[#00BFEA] text-black w-[155px] h-[48px] min-w-[96px] min-h-[48px] max-h-[48px] rounded-[24px] flex items-center justify-center gap-2 font-extrabold text-base leading-4 tracking-[0%] text-center"
        >
          <Image src="/icons/plus_icon.png" alt="Create" width={14} height={20} />
          Create ad
        </Button>
      </div>
    </div>
  )
}
