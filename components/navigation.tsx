"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, X } from "lucide-react"
import BalanceInfoPopup from "@/components/balance-info-popup"

interface NavigationProps {
  isBackBtnVisible?: boolean
  isVisible?: boolean
  redirectUrl?: string
  title: string
}

export default function Navigation({
  isBackBtnVisible = true,
  redirectUrl = "/",
  title,
}: NavigationProps) {
  const [isBalanceInfoOpen, setIsBalanceInfoOpen] = useState(false)

  return (
    <div className="mb-4 border-b -mx-[24px] md:-mx-0 px-[16px] py-[4px]">
      <div className="flex items-center justify-between md:px-0">
        {(isBackBtnVisible && title) ? (
          <Link href={redirectUrl} className="flex items-center text-slate-1400">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <h1 className="text-xl font-bold">{title}</h1>
          </Link>
        ) : (
          <>
            <h1 className="text-xl font-bold">{title}</h1>
            <Link href={redirectUrl}>
              <X className="h-5 w-5" />
            </Link>
          </>
        )}
      </div>
      <BalanceInfoPopup isOpen={isBalanceInfoOpen} onClose={() => setIsBalanceInfoOpen(false)} />
    </div>
  )
}
