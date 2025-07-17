"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import MyAdsTable from "./components/my-ads-table"
import MyAdsHeader from "./components/my-ads-header"
import { getUserAdverts } from "./api/api-ads"
import { USER } from "@/lib/local-variables"
import { Plus } from "lucide-react"
import type { MyAd } from "./types"
import MobileMyAdsList from "./components/mobile-my-ads-list"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { StatusBanner } from "@/components/ui/status-banner"
import StatusModal from "./components/ui/status-modal"
import StatusBottomSheet from "./components/ui/status-bottom-sheet"

interface StatusData {
  success: "create" | "update"
  type: string
  id: string
  showStatusModal: boolean
}

export default function AdsPage() {
  const [ads, setAds] = useState<MyAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeletedBanner, setShowDeletedBanner] = useState(false)
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const [errorModal, setErrorModal] = useState({
    show: false,
    title: "Error",
    message: "",
  })

  const isMobile = useIsMobile()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
  console.log("Inside use effect");
    // Read and store params data in local variable
    const success = searchParams.get("success")
    const type = searchParams.get("type")
    const id = searchParams.get("id")
    const showStatusModal = searchParams.get("showStatusModal")

    if (success && type && id && showStatusModal === "true" && (success === "create" || success === "update")) {
      setStatusData({
        success,
        type,
        id,
        showStatusModal: true,
      })
    }

    // Fetch ads
    const fetchAds = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(`Fetching adverts for user ID: ${USER.id}`)
        const userAdverts = await getUserAdverts()
        console.log("User adverts response:", userAdverts)
        setAds(userAdverts)
      } catch (err) {
        console.error("Error fetching ads:", err)
        setError("Failed to load ads. Please try again later.")
        setAds([])
        setErrorModal({
          show: true,
          title: "Error Loading Ads",
          message: err instanceof Error ? err.message : "Failed to load ads. Please try again later.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [])

  const handleAdUpdated = (status?: string) => {
    console.log("Ad updated, refreshing list...")
    const reload = async () => {
      try {
        const userAdverts = await getUserAdverts()
        setAds(userAdverts)
      } catch (err) {
        console.error("Error reloading ads:", err)
      }
    }
    reload()

    if (status === "deleted") {
      setShowDeletedBanner(true)
      setTimeout(() => setShowDeletedBanner(false), 3000)
    }
  }

  const handleCloseStatusModal = () => {
    setStatusData((prev) => (prev ? { ...prev, showStatusModal: false } : null))
    }
/*  const handleCloseErrorModal = () => {
    setErrorModal((prev) => ({ ...prev, show: false }))
    }*/

return <div></div>



  ) 
}
