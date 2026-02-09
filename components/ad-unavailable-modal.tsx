"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/i18n/use-translations"

interface AdUnavailableModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdUnavailableModal({ isOpen, onClose }: AdUnavailableModalProps) {
  const { t } = useTranslations()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold text-left flex-1">Ad no longer available</h1>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <Image src="/icons/close-icon.png" alt="Close" width={24} height={24} />
          </button>
        </div>

        <p className="text-gray-600 text-base mb-8">
          This ad is no longer accessible. Try placing an order on a different ad.
        </p>

        <Button
          onClick={onClose}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-full text-base transition-colors"
        >
          Got it
        </Button>
      </div>
    </div>
  )
}
