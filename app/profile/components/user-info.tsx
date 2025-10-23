"use client"

import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"
import { VerifiedBadge } from "@/components/verified-badge"
import { useUserDataStore } from "@/stores/user-data-store"

interface UserInfoProps {
  username: string
  email: string
  rating: string
  recommendation: number
  joinDate: string
  tradeBand: string
}

export default function UserInfo({ username, email, rating, joinDate, recommendation, tradeBand }: UserInfoProps) {
  const verificationStatus = useUserDataStore((state) => state.verificationStatus)

  const isFullyVerified =
    verificationStatus?.email_verified && verificationStatus?.phone_verified && verificationStatus?.kyc_verified

  return (
    <div className="w-[calc(100%+24px)] md:w-full flex flex-row items-center gap-[16px] md:gap-[24px] bg-slate-1200 p-6 rounded-b-3xl md:rounded-3xl justify-between -m-3 mb-0 md:m-0">
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="relative h-14 w-14 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
          <Image src="/icons/user-icon.png" alt="Star" width={32} height={32} />
        </div>
        <div className="flex flex-col flex-1 gap-1">
          <div className="flex items-center gap-1">
            {username && email ? <h2 className="text-base text-white font-bold">{username ?? email}</h2> : <Skeleton className="h-7 w-32 bg-white/20" />}
            {isFullyVerified && (
              <VerifiedBadge description="You have completed all required verification steps, including email, phone number, identity (KYC), and address verification." />
            )}
            {tradeBand === "bronze" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Image src="/icons/bronze.png" alt="Bronze" width={18} height={18} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <>
                      <p className="font-bold text-white mb-2">Bronze tier</p>
                      <p className="opacity-[0.72]">Default tier for new users with basic trading limits.</p>
                    </>
                    <TooltipArrow className="fill-black" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {joinDate && <div className="text-xs text-white opacity-[0.72]">{joinDate}</div>}
          <div className="flex flex-wrap gap-y-2 items-center mt-1 text-xs">
              <div className="flex items-center text-white">
                <div className="flex items-center">
                  <Image src="/icons/thumbs-up.png" alt="Recommended" width={24} height={24} className="mr-1" />
                  <span className="text-white opacity-[0.72]">
                    {recommendation ? recommendation : "Not recommended yet"}
                  </span>
                </div>
              </div>
              <>
                <div className="mx-4 h-4 w-px bg-black opacity-[0.08]"></div>
                <div className="flex items-center">
                  <Image src="/icons/star-rating.png" alt="Star" width={24} height={24} className="mr-1" />
                  <span className="text-white opacity-[0.72]">{rating ? rating : "Not rated yet"}</span>
                </div>
              </>
          </div>
        </div>
      </div>
    </div>
  )
}
