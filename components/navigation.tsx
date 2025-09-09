"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/Image"

interface NavigationProps {
  isBackBtnVisible?: boolean
  isVisible?: boolean
  onBack?: () => void
  onClose?: () => void
  redirectUrl?: string
  title: string
}

export default function Navigation({
  isBackBtnVisible = true,
  onBack,
  onClose,
  redirectUrl = "/",
  title,
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
        )
      } else {
        return (
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
        )
      }
    }

    return (
      <div className="flex w-full justify-between items-center">
        <h1 className="text-xl font-bold">{title}</h1>
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
    )
  }

  return (
    <div className="mb-4 border-b py-[12px] px-[16px] md:py-[4px] md:border-0 md:px-[24px]">
      <div className="flex items-center justify-between md:px-0">{getHeaderComponent()}</div>
    </div>
  )
}
