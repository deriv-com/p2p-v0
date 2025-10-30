"use client"

export const runtime = "edge"

import { useParams } from "next/navigation"
import ShareAdPage from "@/app/ads/components/share-ad-page"

export default function ShareAd() {
  const { id } = useParams() as { id: string }

  return <ShareAdPage adId={id} />
}
