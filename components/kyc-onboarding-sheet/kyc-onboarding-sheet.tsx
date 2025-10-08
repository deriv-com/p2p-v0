"use client"

import Image from "next/image"
import { getHomeUrl } from "@/lib/utils"

function KycOnboardingSheet() {
  return (
    <div
      className="w-full p-2 rounded-2xl md:rounded-none border md:border-none md:border-b border-gray-200 hover:cursor-pointer"
      onClick={() => {window.location.href = `https://${getHomeUrl()}/dashboard/userprofile`}}
    >
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 flex items-center justify-center">
          <Image src={"/icons/account-profile.png" || "/placeholder.svg"} alt="Set up and verify your profile" width={24} height={24} />
        </div>
        <div className="text-left text-slate-1200 text-base font-normal flex-1">Set up and verify your profile</div>
        <Image src="/icons/chevron-right-gray.png" alt="Go" width={24} height={24} />
      </div>
    </div>
  )
}

export { KycOnboardingSheet }
export default KycOnboardingSheet
