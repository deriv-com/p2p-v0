"use client"

import { useState } from "react"
import Image from "next/image"
import { useIsMobile } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function VerifiedBadge() {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  const handleClick = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const content = (
    <div className="flex flex-col gap-4">
      <p className="text-base text-grayscale-600 leading-relaxed">
        This user has completed all required verification steps, including email, phone number, identity (KYC), and
        address verification. You can trade with confidence knowing this account is verified.
      </p>
      <Button onClick={handleClose} className="w-full bg-status-error hover:bg-status-error/90 text-white">
        OK
      </Button>
    </div>
  )

  if (isMobile) {
    return (
      <>
        <button onClick={handleClick} className="cursor-pointer focus:outline-none" aria-label="Verified account">
          <Image src="/icons/verified-badge.png" alt="Verified" width={18} height={18} />
        </button>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-xl font-bold text-left">Fully verified account</SheetTitle>
            </SheetHeader>
            {content}
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <>
      <button onClick={handleClick} className="cursor-pointer focus:outline-none" aria-label="Verified account">
        <Image src="/icons/verified-badge.png" alt="Verified" width={18} height={18} />
      </button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md rounded-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-left">Fully verified account</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    </>
  )
}
