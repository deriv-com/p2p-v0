"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import MobileFooterNav from "@/components/mobile-footer-nav"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import { WebSocketProvider } from "@/contexts/websocket-context"
import * as AuthPrevAPI from "@/services/api/api-auth-prev"
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

  useEffect(() => {
    const PUBLIC_ROUTES = ["/login"]
    const isPublic = PUBLIC_ROUTES.includes(pathname)

    const fetchSessionData = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        const response = await AuthPrevAPI.getSession()

        if (abortController.signal.aborted) {
          return
        }

        if (response?.errors && !isPublic) {
          setIsHeaderVisible(false)
          router.push("/login")
        } else {
          AuthPrevAPI.getSocketToken(response.access_token)
          router.push(pathname)
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          return
        }
        console.error("Error fetching data:", error)
      }
    }

    fetchSessionData()
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [pathname, router])

  useEffect(() => {
    let startX = 0
    let startY = 0
    let isHorizontalSwipe = false

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      isHorizontalSwipe = false
      
      // Prevent swipe navigation if touch starts near edges
      if (startX < 50 || startX > window.innerWidth - 50) {
        e.preventDefault()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY) {
        return
      }

      const currentX = e.touches[0].clientX
      const currentY = e.touches[0].clientY
      const diffX = Math.abs(startX - currentX)
      const diffY = Math.abs(startY - currentY)

      // Detect if this is a horizontal swipe
      if (diffX > diffY && diffX > 10) {
        isHorizontalSwipe = true
      }

      // Prevent horizontal swipes that start from edges
      if (isHorizontalSwipe && (startX < 50 || startX > window.innerWidth - 50)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      // Prevent any remaining navigation attempts
      if (isHorizontalSwipe && (startX < 50 || startX > window.innerWidth - 50)) {
        e.preventDefault()
        e.stopPropagation()
      }
      
      startX = 0
      startY = 0
      isHorizontalSwipe = false
    }

    // Prevent default behavior for gesture events (Safari specific)
    const handleGestureStart = (e: Event) => {
      e.preventDefault()
    }

    const handleGestureChange = (e: Event) => {
      e.preventDefault()
    }

    const handleGestureEnd = (e: Event) => {
      e.preventDefault()
    }

    // Add touch event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: false })
    
    // Add Safari-specific gesture event listeners
    document.addEventListener('gesturestart', handleGestureStart, { passive: false })
    document.addEventListener('gesturechange', handleGestureChange, { passive: false })
    document.addEventListener('gestureend', handleGestureEnd, { passive: false })

    // Prevent overscroll behavior
    document.body.style.overscrollBehaviorX = 'none'

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('gesturestart', handleGestureStart)
      document.removeEventListener('gesturechange', handleGestureChange)
      document.removeEventListener('gestureend', handleGestureEnd)
      
      // Reset overscroll behavior
      document.body.style.overscrollBehaviorX = 'auto'
    }
  }, [])

  if (pathname === "/login") {
    return <div className="container mx-auto overflow-hidden max-w-[1232px]">{children}</div>
  }

  return (
    <WebSocketProvider>
      <div className="hidden md:flex p-6 h-screen overflow-hidden m-auto max-w-[1232px] relative">
        {isHeaderVisible && <Sidebar />}
        <div className="flex-1">
          {isHeaderVisible && <Header />}
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
