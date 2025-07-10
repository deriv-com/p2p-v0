"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, X } from "lucide-react"
import { useRouter } from "next/navigation"
import BalanceInfoPopup from "@/components/balance-info-popup"

interface NavigationProps {
  isBackBtnVisible?: boolean
  isVisible?: boolean
  redirectUrl?: string
  title: string
}

export default function Navigation({ isBackBtnVisible = true, redirectUrl = "/", title }: NavigationProps) {
  const [isBalanceInfoOpen, setIsBalanceInfoOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="mb-4">
      {/* Mobile Navigation Header */}
      <div className="md:hidden flex items-center p-4 bg-white border-b border-gray-200">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-black">P2P</h1>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between -mx-4 md:-mx-0 md:px-0 border-b md:border-none">
        {isBackBtnVisible && title ? (
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
