"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAdStore } from "@/store/ad-store"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface StatusBottomSheetProps {
  open: boolean
  setOpen: (open: boolean) => void
  status: "success" | "error" | null
}

export function StatusBottomSheet({ open, setOpen, status }: StatusBottomSheetProps) {
  const router = useRouter()
  const resetAd = useAdStore((state) => state.reset)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [open])

  const handleNavigation = () => {
    resetAd()
    setOpen(false)
    router.push("/ads")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="text-center">
        <SheetHeader>
          <SheetTitle>{status === "success" ? "Ad Created!" : "Ad Creation Failed"}</SheetTitle>
          <SheetDescription>
            {status === "success"
              ? "Your ad has been successfully created and is now live."
              : "There was an error creating your ad. Please try again."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4">
          <Image
            src={status === "success" ? "/icons/success_icon_round.png" : "/icons/error_icon_round.png"}
            alt={status === "success" ? "Success" : "Error"}
            width={64}
            height={64}
            className="w-16 h-16"
          />
        </div>

        <Button onClick={handleNavigation}>{status === "success" ? "Go to Ads" : "Try Again"}</Button>
      </SheetContent>
    </Sheet>
  )
}
