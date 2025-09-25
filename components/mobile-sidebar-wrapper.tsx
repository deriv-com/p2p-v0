"use client"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Sidebar from "./sidebar"
import * as AuthAPI from "@/services/api/api-auth"

const HamburgerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 12H21M3 6H21M3 18H21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export function MobileSidebarTrigger() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <HamburgerIcon />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[295px]">
        <div className="h-full flex flex-col">
          <Sidebar className="border-r-0 mr-0" />
          <div className="p-4 border-t border-slate-200">
            <Button size="sm" onClick={() => AuthAPI.logout()} className="w-full">
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
