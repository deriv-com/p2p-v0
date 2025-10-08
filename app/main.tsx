"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import MobileFooterNav from "@/components/mobile-footer-nav"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { WebSocketProvider } from "@/contexts/websocket-context"
import * as AuthAPI from "@/services/api/api-auth"
import { useUserDataStore } from "@/stores/user-data-store"
import "./globals.css"

export default function Main({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)
  const setVerificationStatus = useUserDataStore((state) => state.setVerificationStatus)

  useEffect(() => {
    isMountedRef.current = true

    const PUBLIC_ROUTES = ["/login"]
    const isPublic = PUBLIC_ROUTES.includes(pathname)

    const fetchSessionData = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        const response = await AuthAPI.getSession()

        if (abortController.signal.aborted || !isMountedRef.current) {
          return
        }

        if (response?.errors && !isPublic) {
          setIsHeaderVisible(false)
          router.push("/login")
        } else {
          if (!response?.errors) {
            await AuthAPI.fetchUserIdAndStore()

            try {
              const onboardingStatus = await AuthAPI.getOnboardingStatus()

              if (isMountedRef.current && !abortController.signal.aborted) {
                setVerificationStatus({
                  email_verified: onboardingStatus.verification.email_verified,
                  phone_verified: onboardingStatus.verification.phone_verified,
                  kyc_verified: onboardingStatus.kyc.status,
                })
              }
            } catch (error) {
              console.error("Error fetching onboarding status:", error)
            }
          }
          if (isMountedRef.current && !abortController.signal.aborted) {
            router.push(pathname)
          }
        }
      } catch (error) {
        if (abortController.signal.aborted || !isMountedRef.current) {
          return
        }
        console.error("Error fetching session data:", error)
      }
    }

    fetchSessionData()

    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [pathname, router, setVerificationStatus])

  if (pathname === "/login") {
    return <div className="container mx-auto overflow-hidden max-w-7xl">{children}</div>
  }

  return (
    <WebSocketProvider>
      <div className="hidden md:flex p-6 h-screen overflow-hidden m-auto relative max-w-[1232px]">
        {isHeaderVisible && <Sidebar className="hidden md:flex" />}
        <div className="flex-1">
          <div className="container mx-auto">{children}</div>
        </div>
      </div>
      <div className="md:hidden container mx-auto h-[calc(100%-2rem)] relative">
        {isHeaderVisible && <Header className="flex-shrink-0" />}
        <main className="flex-1 overflow-hidden">{children}</main>
        <MobileFooterNav className="flex-shrink-0" />
      </div>
    </WebSocketProvider>
  )
}
