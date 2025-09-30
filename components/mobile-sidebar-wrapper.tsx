"use client"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Sidebar from "./sidebar"
import Image from "next/image"

export function MobileSidebarTrigger() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden px-2">
          <Image src="/icons/menu.png" alt="Menu" width={24} height={24} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[295px]">
        <div className="h-full flex flex-col">
          <Sidebar className="h-full border-r-0 mr-0 mt-6" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
