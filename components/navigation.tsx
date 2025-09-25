"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { NovuNotifications } from "@/components/novu-notifications"
import { cn } from "@/lib/utils"

interface NavigationProps {
  isBackBtnVisible?: boolean
  isVisible?: boolean
  onBack?: () => void
  onClose?: () => void
  redirectUrl?: string
  title: string
  showNotificationIcon?: boolean
}

export default function Navigation({
  isBackBtnVisible = true,
  onBack,
  onClose,
  redirectUrl = "/",
  title,
  showNotificationIcon = false,
}: NavigationProps) {
  const router = useRouter()

  const getHeaderComponent = () => {
    if (isBackBtnVisible) {
      if (onBack && onClose) {
        return (
          <div className="flex w-full justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} size="sm" className="bg-grayscale-300 px-1">
                <Image src="/icons/arrow-left-icon.png" alt="Back" width={24} height={24} />
              </Button>
              <h1 className="text-xl font-bold">{title}</h1>
            </div>
        
              <Button variant="ghost" onClick={onClose} size="sm" className="bg-grayscale-300 px-1">
                <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
              </Button>
            </div>
          </div>
        )
      } else {
        return (
          <div className="flex gap-4 items-center justify-between w-full">
            <div className="flex gap-4 items-center">
              <Button
                variant="ghost"
                onClick={() => router.push(redirectUrl)}
                size="sm"
                className="bg-grayscale-300 px-1"
              >
                <Image src="/icons/arrow-left-icon.png" alt="Back" width={24} height={24} />
              </Button>
              <h1 className="text-xl font-bold">{title}</h1>
            </div>
            {showNotificationIcon && (
              <div className="text-slate-600 hover:text-slate-700">
                <NovuNotifications />
              </div>
            )}
          </div>
        )
      }
    }

    return (
      <div className="flex w-full justify-between items-center">
        <h1 className="text-xl font-bold">{title}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              if (onClose) {
                onClose()
              } else {
                router.push(redirectUrl)
              }
            }}
            size="sm"
            className="bg-grayscale-300 px-1"
          >
            <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "mb-4 border-b py-[12px] px-[16px] md:py-[4px] md:border-0 md:px-[24px]",
        showNotificationIcon && "bg-slate-1200 pr-[14px]",
      )}
    >
      <div className="flex items-center justify-between md:px-0">{getHeaderComponent()}</div>
    </div>
  )
}
