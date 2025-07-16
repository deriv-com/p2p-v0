"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface StatusModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type: "success" | "error"
}

export default function StatusModal({ isOpen, onClose, title, message, type }: StatusModalProps) {
  const iconSrc = type === "success" ? "/icons/success_icon_round.png" : "/icons/error_icon_round.png"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
          <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
        </DialogHeader>
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          <Button onClick={onClose} className="w-full">
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Named export for backward compatibility
export { StatusModal }
