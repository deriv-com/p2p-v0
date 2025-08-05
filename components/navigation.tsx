"use client"

import { useState } from "react"
import Link from "next/link"
import BalanceInfoPopup from "@/components/balance-info-popup"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface NavigationProps {
  isBackBtnVisible?: boolean
  isVisible?: boolean
  onBack?: () => void
  onClose?: () => void
  redirectUrl?: string
  title: string
}

export default function Navigation({ isBackBtnVisible = true, onBack, onClose, redirectUrl = "/", title }: NavigationProps) {
  const [isBalanceInfoOpen, setIsBalanceInfoOpen] = useState(false)

  const getHeaderComponent = () => {
    if(isBackBtnVisible && title){
      if(onBack) {
        return (
            <Button variant="ghost" onClick={onBack}>
              <Image src="/icons/arrow-left-icon.png" alt="Back" width={20} height={20} className="mr-[16px]" />
            </Button>
            <h1 className="text-xl font-bold">{title}</h1>
          )
      } else if(onClose) {
        return (
            <h1 className="text-xl font-bold">{title}</h1>
            <Button variant="ghost" onClick={onClose}>
              <Image src="/icons/close-circle.png" alt="Close" width={20} height={20} className="mr-[16px]" />
            </Button>
          )
      } else {
        return(<Link href={redirectUrl} className="flex items-center text-slate-1400">
            <Image src="/icons/arrow-left-icon.png" alt="Back" width={20} height={20} className="mr-[16px]" />
            <h1 className="text-xl font-bold">{title}</h1>
          </Link>)
      }
    }
    
    return (<>
        <h1 className="text-xl font-bold">{title}</h1>
        <Link href={redirectUrl}>
          <Image src="/icons/close-circle.png" alt="Close" width={20} height={20} className="h-5 w-5" />
        </Link>
      </>)
  }
  
  return (
    <div className="mb-4 border-b py-[12px] px-[16px] md:py-[4px] md:border-0 md:px-[24px]">
      <div className="flex items-center justify-between md:px-0">
        {getHeaderComponent()}
      </div>
      <BalanceInfoPopup isOpen={isBalanceInfoOpen} onClose={() => setIsBalanceInfoOpen(false)} />
    </div>
  )
}
