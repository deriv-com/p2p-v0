"use client"

import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface StatusBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  type: "success" | "error" | "warning"
  title: string
  message: string
  subMessage?: string
  adId?: string
  adType?: string
  actionButtonText?: string
  isUpdate?: boolean
}

export default function StatusBottomSheet({
  isOpen,
  onClose,
  type,
  title,
  message,
  subMessage,
  adId,
  adType,
  actionButtonText = "OK",
  isUpdate = false,
}: StatusBottomSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="p-0 rounded-t-3xl border-none">
        <div className="bg-gray-100 relative p-6 pb-12 rounded-t-3xl">
          <div className="flex justify-center">
            {type === "success" ? (
              <Image src="/icons/success_icon_round.png" alt="Success" width={56} height={56} className="w-14 h-14" />
            ) : (
              <Image src="/icons/error_icon_round.png" alt="Error" width={56} height={56} className="w-14 h-14" />
            )}
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-black hover:text-gray-700 p-2"
            aria-label="Close"
          >
            <Image src="/icons/button-close.png" alt="Close" width={48} height={48} className="w-12 h-12" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-12">
            <h2
              className="font-bold mb-6"
              style={{
                fontSize: "20px",
                lineHeight: "100%",
                letterSpacing: "0%",
                fontWeight: 700,
              }}
            >
              {title}
            </h2>

            {type === "success" && (
              <>
                <p
                  className="text-gray-900 mb-6"
                  style={{
                    fontSize: "16px",
                    lineHeight: "24px",
                    letterSpacing: "0%",
                    fontWeight: 400,
                  }}
                >
                  {isUpdate
                    ? `You've successfully updated Ad${adType && adId ? ` (${adType} ${adId})` : "."}`
                    : `You've successfully created Ad${adType && adId ? ` (${adType} ${adId})` : "."}`}
                </p>

                <p
                  className="text-gray-900"
                  style={{
                    fontSize: "16px",
                    lineHeight: "24px",
                    letterSpacing: "0%",
                    fontWeight: 400,
                  }}
                >
                  {message}
                </p>
              </>
            )}

            {type !== "success" && (
              <p
                className="text-gray-900"
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                  letterSpacing: "0%",
                  fontWeight: 400,
                }}
              >
                {message}
              </p>
            )}

            {subMessage && (
              <p
                className="text-gray-900 mt-6"
                style={{
                  fontSize: "16px",
                  lineHeight: "24px",
                  letterSpacing: "0%",
                  fontWeight: 400,
                }}
              >
                {subMessage}
              </p>
            )}
          </div>

          <Button onClick={onClose} variant="black" className="w-full">
            {actionButtonText}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
