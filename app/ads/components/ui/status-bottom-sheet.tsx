import type React from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface StatusBottomSheetProps {
  children: React.ReactNode
  title: string
  description?: string
  statusContent: React.ReactNode
}

const StatusBottomSheet = ({ children, title, description, statusContent }: StatusBottomSheetProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle className="mt-4">{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        {statusContent}
        <div className="pb-6" />
      </SheetContent>
    </Sheet>
  )
}

export default StatusBottomSheet
