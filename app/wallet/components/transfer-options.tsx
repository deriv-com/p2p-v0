"use client"

import type React from "react"
import Image from "next/image"

interface TransferOptionsProps {
  onClose: () => void
  onSendClick: () => void
  onReceiveClick: () => void
}

export default function TransferOptions({ onClose, onSendClick, onReceiveClick }: TransferOptionsProps) {
  const handleSendClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    onSendClick()
  }

  const handleReceiveClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onClose()
    onReceiveClick()
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-black text-lg font-bold">Choose transfer type</h2>
      </div>

      <div className="space-y-4">
        <div
          className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={handleSendClick}
        >
          <Image src="/icons/arrow-up.png" alt="Send" width={48} height={48} className="w-12 h-12" />
          <div>
            <h3 className="text-black text-lg font-bold">Send</h3>
          </div>
        </div>

        <div
          className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={handleReceiveClick}
        >
          <Image src="/icons/arrow-down.png" alt="Receive" width={48} height={48} className="w-12 h-12" />
          <div>
            <h3 className="text-black text-lg font-bold">Receive</h3>
          </div>
        </div>
      </div>
    </>
  )
}
