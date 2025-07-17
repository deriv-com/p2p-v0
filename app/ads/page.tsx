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


  return (
    <div className="flex flex-col h-screen bg-white">
      {showDeletedBanner && (
        <StatusBanner variant="success" message="Ad deleted" onClose={() => setShowDeletedBanner(false)} />
      )}

      <div className="flex-none container mx-auto pr-4">
        <MyAdsHeader hasAds={ads.length > 0} />
        {ads.length > 0 && !isMobile && (
          <Button
            onClick={() => router.push("/ads/create")}
            variant="cyan"
            size="pill"
            className="font-extrabold text-base leading-4 tracking-[0%] text-center mb-6"
          >
            <Plus className="h-5 w-5" />
            Create ad
          </Button>
        )}
      </div>

      {ads.length > 0 && isMobile && (
        <div className="fixed bottom-20 right-4 z-10">
          <Button
            onClick={() => router.push("/ads/create")}
            variant="cyan"
            size="pill"
            className="font-extrabold text-base leading-4 tracking-[0%] text-center shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Create ad
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden container mx-auto p-0">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading your ads...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : isMobile ? (
          <MobileMyAdsList ads={ads} onAdDeleted={handleAdUpdated} />
        ) : (
          <MyAdsTable ads={ads} onAdDeleted={() => {console.log("test")}} />//handleAdUpdated}} />
        )}
      </div>

      {/* Status modal - only show if statusData exists, not loading, no error modal, and showStatusModal is true */}
      {statusData && statusData.showStatusModal && !loading && !errorModal.show && !isMobile && (
        <StatusModal
          type="success"
          title={statusData.success === "create" ? "Ad created" : "Ad updated"}
          message={
            statusData.success === "create"
              ? "If your ad doesn't receive an order within 3 days, it will be deactivated."
              : "Your changes have been saved and are now live."
          }
          onClose={handleCloseStatusModal}
          adType={statusData.type}
          adId={statusData.id}
          isUpdate={statusData.success === "update"}
          showStatusModel ={statusData.showStatusModal}
        />
      )}

      {statusData && statusData.showStatusModal && !loading && !errorModal.show && isMobile && (
        <StatusBottomSheet
          isOpen
          onClose={handleCloseStatusModal}
          type="success"
          title={statusData.success === "create" ? "Ad created" : "Ad updated"}
          message={
            statusData.success === "create"
              ? "If your ad doesn't receive an order within 3 days, it will be deactivated."
              : "Your changes have been saved and are now live."
          }
          adType={statusData.type}
          adId={statusData.id}
          isUpdate={statusData.success === "update"}
        />
      )}

      
    </div>
  )
}
