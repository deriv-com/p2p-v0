"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import MobileFooterNav from "@/components/mobile-footer-nav"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import * as AuthPrevAPI from "@/services/api/api-auth-prev"
import "./globals.css"
import { AUTH, NOTIFICATIONS } from "@/lib/local-variables"

async function fetchSubscriberHash() {
  try {
    const url = `${NOTIFICATIONS.subscriberHashUrl}/hash`

    const response = await fetch(url, {
      method: "GET",
      headers: AUTH.getAuthHeader(),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch subscriber hash: ${response.status}`)
    }

    const responseData = await response.json()

    const subscriberData = responseData.data?.subscriber || responseData.subscriber

    if (!subscriberData) {
      throw new Error("Invalid response structure: missing subscriber data")
    }

    return {
      subscriberHash: subscriberData.subscriberHash,
      subscriberId: subscriberData.subscriberId,
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

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

          // Test fetchSubscriberHash on app load
          console.log("Testing fetchSubscriberHash...")
          const subscriberData = await fetchSubscriberHash()
          console.log("Subscriber data:", subscriberData)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }

    fetchSessionData()
  }, [pathname, router])

  if (pathname === "/login") {
    return <div className="container mx-auto overflow-hidden max-w-[1232px]">{children}</div>
  }

  return (
    <>
      <div className="hidden md:flex p-6 h-screen overflow-hidden m-auto max-w-[1232px]">
        {isHeaderVisible && <Sidebar />}
        <div className="flex-1">
          {isHeaderVisible && <Header />}
          <div className="container mx-auto p-4">{children}</div>
        </div>
      </div>
      <div className="md:hidden container mx-auto p-4 h-[calc(100%-2rem)]">
        {isHeaderVisible && <Header className="flex-shrink-0" />}
        <main className="flex-1 overflow-hidden">{children}</main>
        <MobileFooterNav className="flex-shrink-0" />
      </div>
    </>
  )
}
