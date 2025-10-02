"use client"

import Image from "next/image"

interface UserInfoProps {
  username: string
  rating: string
  recommendation: number
  joinDate: string
  tradeBand: string
}

export default function UserInfo({ username, rating, joinDate, recommendation, tradeBand }: UserInfoProps) {
  return (
    <div className="w-[calc(100%+24px)] md:w-full flex flex-row items-center gap-[16px] md:gap-[24px] bg-slate-1200 p-6 rounded-b-3xl md:rounded-3xl justify-between -m-3 mb-0 md:m-0">
      <div className="flex flex-col md:flex-row items-start gap-4">
        <div className="h-14 w-14 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg">
          <Image src="/icons/user-icon.png" alt="Star" width={32} height={32} />
        </div>
        <div className="flex flex-col flex-1 gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base text-white font-bold">{username}</h2>
            {tradeBand === "bronze" && <Image src="/icons/bronze.png" alt="Bronze" width={18} height={18} />}
           </div>
          {joinDate && (<div className="text-xs text-white opacity-[0.72]">
              {joinDate}
            </div>)}
          <div className="flex flex-wrap gap-y-2 items-center mt-1 text-xs">
            {recommendation && (
              <div className="flex items-center text-white">
                <div className="flex items-center">
                  <Image src="/icons/thumbs-up.png" alt="Recommended" width={24} height={24} className="mr-1" />
                  <span className="text-white opacity-[0.72]">{recommendation? recommendation : "Not recommended yet"}</span>
                </div>
              </div>
            )}
            {rating && (
              <>
                <div className="mx-4 h-4 w-px bg-black opacity-[0.08]"></div>
                <div className="flex items-center">
                  <Image src="/icons/star-rating.png" alt="Star" width={24} height={24} className="mr-1" />
                  <span className="text-white opacity-[0.72]">{rating ? rating : "Not rated yet"}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
