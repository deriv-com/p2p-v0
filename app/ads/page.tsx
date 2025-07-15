"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import MyAdsTable from "./components/my-ads-table"
import MyAdsHeader from "./components/my-ads-header"
import { getUserAdverts } from "./api/api-ads"
import { USER } from "@/lib/local-variables"
import { Plus } from "lucide-react"
import type { MyAd, SuccessData } from "./types"
import MobileMyAdsList from "./components/mobile-my-ads-list"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { StatusBanner } from "@/components/ui/status-banner"

import StatusModal from "./components/ui/status-modal"
import StatusBottomSheet from "./components/ui/status-bottom-sheet"
import { useNotificationStore } from "@/stores/notification-store"

export default function AdsPage() {
  const [ads, setAds] = useState<MyAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeletedBanner, setShowDeletedBanner] = useState(false)

  const isMobile = useIsMobile()
  const router = useRouter()
  const { successModal, clearSuccessModal } = useNotificationStore()

  const [errorModal, setErrorModal] = useState({
    show: false,
    title: "Error",
    message: "",
  })

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

  const handleAdUpdated = (status?: string) => {
    console.log("Ad updated (deleted or status changed), refreshing list...")
    fetchAds()

    if (status === "deleted") {
      setShowDeletedBanner(true)
      setTimeout(() => {
        setShowDeletedBanner(false)
      }, 3000)
    }
  }

  useEffect(() => {
    const checkForSuccessData = () => {
      try {
        const creationDataStr = localStorage.getItem("adCreationSuccess")
        if (creationDataStr) {
          const successData = JSON.parse(creationDataStr) as SuccessData
          // This is kept for backward compatibility, but new flow uses Zustand
          localStorage.removeItem("adCreationSuccess")
        }

        const updateDataStr = localStorage.getItem("adUpdateSuccess")
        if (updateDataStr) {
          localStorage.removeItem("adUpdateSuccess")
        }
      } catch (err) {
        console.error("Error checking for success data:", err)
      }
    }

    fetchAds().then(() => {
      checkForSuccessData()
    })
  }, [])

  const handleCloseSuccessModal = () => {
    clearSuccessModal()
  }

  const handleCloseErrorModal = () => {
    setErrorModal((prev) => ({ ...prev, show: false }))
  }

  return (
    <div className="flex flex-col h-screen">
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
          <MyAdsTable ads={ads} onAdDeleted={handleAdUpdated} />
        )}
      </div>

      {successModal.show && !isMobile && (
        <StatusModal
          type="success"
          title={successModal.type === "created" ? "Ad created" : "Ad updated"}
          message={
            successModal.type === "created"
              ? "If your ad doesn't receive an order within 3 days, it will be deactivated."
              : "Your changes have been saved and are now live."
          }
          onClose={handleCloseSuccessModal}
          adType={successModal.adType}
          adId={successModal.adId}
          isUpdate={successModal.type === "updated"}
        />
      )}

      {successModal.show && isMobile && (
        <StatusBottomSheet
          isOpen={successModal.show}
          onClose={handleCloseSuccessModal}
          type="success"
          title={successModal.type === "created" ? "Ad created" : "Ad updated"}
          message={
            successModal.type === "created"
              ? "If your ad doesn't receive an order within 3 days, it will be deactivated."
              : "Your changes have been saved and are now live."
          }
          adType={successModal.adType}
          adId={successModal.adId}
          isUpdate={successModal.type === "updated"}
        />
      )}

      {errorModal.show && (
        <StatusModal
          type="error"
          title={errorModal.title}
          message={errorModal.message}
          onClose={handleCloseErrorModal}
        />
      )}
    </div>
  )
}
