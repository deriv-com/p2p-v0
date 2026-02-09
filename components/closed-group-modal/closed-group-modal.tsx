"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import ClosedGroupTab from "@/app/profile/components/closed-group"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ClosedGroupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ClosedGroupModal({ open, onOpenChange }: ClosedGroupModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0">
          <DialogTitle>Closed group</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <Image src="/icons/close-icon.svg" alt="Close" width={24} height={24} />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="mt-4">
          <ClosedGroupTab />
        </div>
      </DialogContent>
    </Dialog>
  )
}
