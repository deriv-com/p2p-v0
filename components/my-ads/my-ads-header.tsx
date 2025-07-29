"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface MyAdsHeaderProps {
  totalAds: number
  activeAds: number
}

export default function MyAdsHeader({ totalAds, activeAds }: MyAdsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Advertisements</h1>
        <p className="text-gray-600 mt-1">
          {totalAds} total ads • {activeAds} active
        </p>
      </div>
      
      <Link href="/ads/create">
        <Button className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white">
          <Image src="/icons/plus_icon.png" alt="Create" width={16} height={16} />
          Create Ad
        </Button>
      </Link>
    </div>
  )
}
