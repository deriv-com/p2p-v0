"use client"

import type React from "react"
import { ArrowUp, ArrowDown } from "lucide-react"

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
        <h2 className="text-black" style={{ fontSize: "18px", fontStyle: "normal", fontWeight: 700 }}>
          Choose transfer type
        </h2>
      </div>

      <div className="space-y-4">
        <div
          className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={handleSendClick}
        >
          <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
            <ArrowUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-black" style={{ fontSize: "18px", fontStyle: "normal", fontWeight: 700 }}>
              Send
            </h3>
          </div>
        </div>

        <div
          className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          onClick={handleReceiveClick}
        >
          <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center">
            <ArrowDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-black" style={{ fontSize: "18px", fontStyle: "normal", fontWeight: 700 }}>
              Receive
            </h3>
          </div>
        </div>
      </div>
    </>
  )
}
