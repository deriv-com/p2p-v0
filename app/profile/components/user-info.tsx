"use client"

import { useEffect, useState } from ""
import Image from "next/image"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet"

interface UserInfoProps {
  username: string
  rating: string
  recommendation: number
  joinDate: string
  isVerified: {
    id: boolean
    address: boolean
    phone: boolean
    email?: boolean
  }
  isLoading?: boolean
}

export default function UserInfo({ username, rating, joinDate, isVerified, recommendation, isLoading }: UserInfoProps) {
  const [isKycSheetOpen, setIsKycSheetOpen] = useState(false)

  useEffect(() => {
    if (!USER.id) {
      setIsKycSheetOpen(true)
    }

    console.log("mounted")
  }, [])
  
  return (
    <div className="w-[calc(100%+24px)] md:w-full flex flex-row items-center gap-[16px] md:gap-[24px] bg-slate-1200 p-6 rounded-b-3xl md:rounded-3xl justify-between -m-3 mb-0 md:m-0">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
          <Image src="/icons/user-icon.png" alt="Star" width={32} height={32} />
        </div>
        <div className="flex-1">
          <h2 className="text-base text-white font-bold">{username}</h2>
          <div className="flex flex-wrap ml-[-56px] md:ml-[0] gap-y-2 items-center mt-4 md:mt-1 text-sm">
            {rating && (
              <div className="flex items-center">
                <Image src="/icons/star-icon.png" alt="Star" width={16} height={16} className="mr-1" />
                <span className="text-neutral-10">{rating ? rating : "Not rated yet"}</span>
              </div>
            )}

            {rating && <div className="mx-4 h-4 w-px bg-slate-300"></div>}

            {!isLoading && recommendation && recommendation > 0 &&  (
              <div className="flex items-center text-neutral-10">
                <div className="flex items-center">
                  <Image src="/icons/thumbs-up-icon.png" alt="Recommended" width={16} height={16} className="mr-1" />
                  <span>{recommendation}</span>
                </div>
                <span>% (Recommended)</span>
              </div>
            )}

            {joinDate && (<div className="mx-4 h-4 w-px bg-slate-300">
              <div className="text-neutral-10">{joinDate}</div>
            </div>)}
          </div>
          <div className="flex flex-wrap ml-[-56px] md:ml-[0] gap-2 mt-3">
            {isVerified?.id && (
              <div className="bg-success-bg text-success px-2 h-[24px] rounded-sm text-xs flex items-center">
                <Image src="/icons/check-icon.png" alt="Check" width={12} height={12} className="mr-1" />
                ID
              </div>
            )}
            {isVerified?.address && (
              <div className="bg-success-bg text-success px-2 h-[24px] rounded-sm text-xs flex items-center">
                <Image src="/icons/check-icon.png" alt="Check" width={12} height={12} className="mr-1" />
                Address
              </div>
            )}
            {isVerified?.phone && (
              <div className="bg-success-bg text-success px-2 h-[24px] rounded-sm text-xs flex items-center">
                <Image src="/icons/check-icon.png" alt="Check" width={12} height={12} className="mr-1" />
                Phone number
              </div>
            )}
            {isVerified?.email && (
              <div className="bg-success-bg text-success px-3 h-[24px] rounded-sm text-xs flex items-center">
                <Image src="/icons/check-icon.png" alt="Check" width={12} height={12} className="mr-1" />
                Email
              </div>
            )}
          </div>
        </div>
      </div>
      <KycOnboardingSheet isSheetOpen={isKycSheetOpen} setSheetOpen={setIsKycSheetOpen} />
    </div>
  )
}
