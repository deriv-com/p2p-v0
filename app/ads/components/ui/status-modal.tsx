"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface StatusModalProps {
  type: "success" | "error"
  title: string
  message: string
  onClose: () => void
  adType?: string
  adId?: string
  isUpdate?: boolean
}

export default function StatusModal({
  type,
  title,
  message,
  onClose,
  adType,
  adId,
  isUpdate = false,
}: StatusModalProps) {
  const iconSrc = type === "success" ? "/icons/success_icon_round.png" : "/icons/error_icon_round.png"

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src={iconSrc || "/placeholder.svg"}
              alt={type === "success" ? "Success" : "Error"}
              width={64}
              height={64}
            />
          </div>
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="text-center">
          <p className="text-gray-600 mb-6">{message}</p>
          {adType && adId && (
            <div className="bg-gray-50 p-3 rounded-lg mb-6">
              <p className="text-sm text-gray-500">
                {isUpdate ? "Updated" : "Created"} {adType} ad
              </p>
              <p className="font-medium">ID: {adId}</p>
            </div>
          )}
          <Button onClick={onClose} className="w-full">
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
