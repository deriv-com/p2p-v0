"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function Header() {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const navItems = [
    { href: "/", label: "Buy/Sell" },
    { href: "/orders", label: "Orders" },
    { href: "/ads", label: "My Ads" },
    { href: "/profile", label: "Profile" },
  ]

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/placeholder-logo.png"
              alt="P2P Logo"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "text-black border-b-2 border-black"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Create Ad Button - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/ads/create">
              <Button variant="default" className="flex items-center gap-2">
                <Image src="/icons/plus_icon.png" alt="Plus" width={16} height={16} />
                Create Ad
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <Image src="/icons/ellipsis-vertical-md.png" alt="Menu" width={20} height={20} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
