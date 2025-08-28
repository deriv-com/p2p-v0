"use client"

import type React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface TransferOptionsProps {
  onClose: () => void
  onP2PTransferClick: () => void
  onAccountTransferClick: () => void
}

export default function TransferOptions({ onClose, onP2PTransferClick, onAccountTransferClick }: TransferOptionsProps) {
  const handleP2PTransferClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    onP2PTransferClick()
  }

  const handleAccountTransferClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    onAccountTransferClick()
  }

  return (
    <>
      <div className="mb-2">
        <h2 className="text-lg font-bold" style={{ fontSize: "18px", fontStyle: "normal", fontWeight: 700 }}>
          Transfer with
        </h2>
      </div>

      <div className="space-y-3">
        <div
          className={cn(
            "flex p-4 justify-center items-center gap-4 self-stretch",
            "rounded-2xl bg-slate-75 cursor-pointer hover:bg-accent/80",
          )}
          onClick={handleP2PTransferClick}
        >
          <div className="flex-shrink-0 w-12 h-12 bg-slate-75 rounded-full flex items-center justify-center">
            <Image src="/icons/up-down-arrows.png" alt="P2P Transfer" width={24} height={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-black leading-6 mb-1">P2P Transfer</h3>
            <p className="text-muted-foreground text-sm font-normal leading-[22px]">
              Transfer funds directly to other P2P users instantly and securely.
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex p-4 justify-center items-center gap-4 self-stretch",
            "rounded-2xl bg-slate-75 cursor-pointer hover:bg-accent/80",
          )}
          onClick={handleAccountTransferClick}
        >
          <div className="flex-shrink-0 w-12 h-12 bg-slate-75 rounded-full flex items-center justify-center">
            <Image src="/icons/exchange-icon.png" alt="Account Transfer" width={20} height={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-black leading-6 mb-1">Account Transfer</h3>
            <p className="text-muted-foreground text-sm font-normal leading-[22px]">
              Transfer funds between your different wallet accounts and currencies.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
