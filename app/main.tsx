"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import MobileFooterNav from "@/components/mobile-footer-nav"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import * as AuthPrevAPI from "@/services/api/api-auth-prev"
import "./globals.css"

export default function Main({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()
  const [isHeaderVisible, setIsHeaderVisible] = useState(false)

  useEffect(() => {
    const PUBLIC_ROUTES = ["/login"]
    const isPublic = PUBLIC_ROUTES.includes(pathname)

    const fetchSessionData = async () => {
      try {
        const response = await AuthPrevAPI.getSession()
        if (response?.errors && !isPublic) {
          setIsHeaderVisible(false)
          router.push("/login")
        } else {
           AuthPrevAPI.getSocketToken(response.access_token) 
          setIsHeaderVisible(true)
          router.push(pathname)
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchSessionData();
  }, [pathname, router])

  if (pathname === "/login") {
    return <div className="container mx-auto overflow-hidden max-w-[1232px]">{children}</div>
  }

  return (
    <>
      <div className="hidden md:flex p-6 h-screen overflow-hidden m-auto max-w-[1232px] relative">
        {isHeaderVisible && <Sidebar />}
        <div className="flex-1">{isHeaderVisible && <Header />}
          <div className="container mx-auto p-[24px] pt-[8px]">{children}</div>
        </div>
      </div>
      <div className="md:hidden container mx-auto p-[24px] pt-[8px] h-[calc(100%-2rem)] relative">
        {isHeaderVisible && <Header className="flex-shrink-0" />}
        <main className="flex-1 overflow-hidden">{children}</main>
        <MobileFooterNav className="flex-shrink-0" />
      </div>
    </>
  )
}
