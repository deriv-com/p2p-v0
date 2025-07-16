"use client"

import { useState } from "react"
import Link from "next/link"
import BalanceInfoPopup from "@/components/balance-info-popup"
import Image from "next/image"

interface NavigationProps {
  isBackBtnVisible?: boolean
  isVisible?: boolean
  redirectUrl?: string
  title: string
}

export default function Navigation({ isBackBtnVisible = true, redirectUrl = "/", title }: NavigationProps) {
  const [isBalanceInfoOpen, setIsBalanceInfoOpen] = useState(false)

  return (
    <div className="mb-4 border-b -mx-[24px] md:-mx-0 px-[16px] py-[4px]">
      <div className="flex items-center justify-between md:px-0">
        {isBackBtnVisible && title ? (
          <Link href={redirectUrl} className="flex items-center text-slate-1400">
            <Image src="/icons/arrow-left-icon.png" alt="Back" width={20} height={20} className="mr-[16px]" />
            <h1 className="text-xl font-bold">{title}</h1>
          </Link>
        ) : (
          <>
            <h1 className="text-xl font-bold">{title}</h1>
            <Link href={redirectUrl}>
              <Image src="/icons/close-icon.png" alt="Close" width={20} height={20} className="h-5 w-5" />
            </Link>
          </>
        )}
      </div>
      <BalanceInfoPopup isOpen={isBalanceInfoOpen} onClose={() => setIsBalanceInfoOpen(false)} />
    </div>
  )
}
