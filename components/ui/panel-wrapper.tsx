"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface PanelWrapperProps {
  onBack?: () => void
  onClose: () => void
  children: React.ReactNode
}

export function PanelWrapper({ onBack, onClose, children }: PanelWrapperProps) {
  const isMobile = useIsMobile()

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/80" onClick={onClose} />
      <div
        className={`fixed inset-y-0 right-0 z-50 bg-white shadow-xl flex flex-col ${
          isMobile ? "inset-0 w-full" : "w-full"
        }`}
      >
        <div className="max-w-xl mx-auto flex flex-col w-full h-full">
          <div className={cn("flex items-center justify-end px-4 py-3", onBack && "justify-between")}>
            {onBack && <Button variant="ghost" size="sm" onClick={onBack} className="bg-grayscale-300 px-1 -ml-3">
              <Image src="/icons/arrow-left-icon.png" alt="Back" width={24} height={24} />
            </Button>}
            <Button variant="ghost" size="sm" onClick={onClose} className="bg-grayscale-300 px-1">
              <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
            </Button>
          </div>
          {children}
        </div>
      </div>
    </>
  )
}
