"use client"

import type React from "react"
import Image from "next/image"

interface TransferProps {
  onClose: () => void
  onSendClick: () => void
  onReceiveClick: () => void
}

export default function Transfer({ onClose, onSendClick, onReceiveClick }: TransferProps) {
  const handleSendClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSendClick()
  }

  const handleReceiveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onReceiveClick()
  }

  return (
    <>
      <div>
        <h2 className="text-black text-base font-bold">Choose transfer type</h2>
      </div>

      <div className="space-y-2">
        <div
          className="flex items-center gap-4 cursor-pointer bg-slate-75 rounded-2xl min-h-[56px] p-4 w-full transition-colors hover:bg-gray-200"
          onClick={handleSendClick}
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <Image src="/icons/arrow-up.png" alt="Send" width={23} height={22} />
          </div>
          <div>
            <h3 className="text-black text-base font-bold">Send</h3>
          </div>
        </div>

        <div
          className="flex items-center gap-4 cursor-pointer bg-slate-75 rounded-2xl min-h-[56px] p-4 w-full transition-colors hover:bg-gray-200"
          onClick={handleReceiveClick}
        >
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <Image src="/icons/arrow-down.png" alt="Receive" width={23} height={22} />
          </div>
          <div>
            <h3 className="text-black text-base font-bold">Receive</h3>
          </div>
        </div>
      </div>
    </>
  )
}
