"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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

export default function AdsPage() {
  const [ads, setAds] = useState<MyAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successModal, setSuccessModal] = useState<{
    show: boolean
    type: string
    id: string
  }>({
    show: false,
    type: "",
    id: "",
  })
  const [showDeletedBanner, setShowDeletedBanner] = useState(false)

  const [updateModal, setUpdateModal] = useState<{
    show: boolean
    type: string
    id: string
  }>({
    show: false,
    type: "",
    id: "",
  })

  const isMobile = useIsMobile()
  const router = useRouter()
  const searchParams = useSearchParams()

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
        // Check URL parameters first (new approach)
        const success = searchParams.get("success")
        const type = searchParams.get("type")
        const id = searchParams.get("id")

        console.log("🔍 Checking URL params:", { success, type, id })
        console.log("🔍 Full URL:", window.location.href)
        console.log("🔍 Search params string:", searchParams.toString())

        if (success && type && id) {
          if (success === "created") {
            console.log("✅ Found creation success in URL params")
            setSuccessModal({
              show: true,
              type: type,
              id: id,
            })
          } else if (success === "updated") {
            console.log("✅ Found update success in URL params")
            setUpdateModal({
              show: true,
              type: type,
              id: id,
            })
          }

          // Clean up URL parameters after a short delay to ensure modal is shown
          console.log("🧹 Cleaning up URL parameters")
          setTimeout(() => {
            router.replace("/ads", { scroll: false })
          }, 100)
          return
        }

        // Fallback to localStorage (backward compatibility)
        const creationDataStr = localStorage.getItem("adCreationSuccess")
        if (creationDataStr) {
          console.log("📦 Found creation success in localStorage (fallback)")
          const successData = JSON.parse(creationDataStr) as SuccessData
          setSuccessModal({
            show: true,
            type: successData.type,
            id: successData.id,
          })
          localStorage.removeItem("adCreationSuccess")
        }

        const updateDataStr = localStorage.getItem("adUpdateSuccess")
        if (updateDataStr) {
          console.log("📦 Found update success in localStorage (fallback)")
          const updateData = JSON.parse(updateDataStr) as SuccessData
          setUpdateModal({
            show: true,
            type: updateData.type,
            id: updateData.id,
          })
          localStorage.removeItem("adUpdateSuccess")
        }
      } catch (err) {
        console.error("❌ Error checking for success data:", err)
      }
    }

    fetchAds().then(() => {
      checkForSuccessData()
    })
  }, [searchParams, router])

  const handleCloseSuccessModal = () => {
    console.log("🔒 Closing success modal")
    setSuccessModal((prev) => ({ ...prev, show: false }))
  }

  const handleCloseUpdateModal = () => {
    console.log("🔒 Closing update modal")
    setUpdateModal((prev) => ({ ...prev, show: false }))
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
          title="Ad created"
          message="If your ad doesn't receive an order within 3 days, it will be deactivated."
          onClose={handleCloseSuccessModal}
          adType={successModal.type}
          adId={successModal.id}
          isUpdate={false}
        />
      )}

      {successModal.show && isMobile && (
        <StatusBottomSheet
          isOpen={successModal.show}
          onClose={handleCloseSuccessModal}
          type="success"
          title="Ad created"
          message="If your ad doesn't receive an order within 3 days, it will be deactivated."
          adType={successModal.type}
          adId={successModal.id}
          isUpdate={false}
        />
      )}

      {updateModal.show && !isMobile && (
        <StatusModal
          type="success"
          title="Ad updated"
          message="Your changes have been saved and are now live."
          onClose={handleCloseUpdateModal}
          adType={updateModal.type}
          adId={updateModal.id}
          isUpdate={true}
        />
      )}

      {updateModal.show && isMobile && (
        <StatusBottomSheet
          isOpen={updateModal.show}
          onClose={handleCloseUpdateModal}
          type="success"
          title="Ad updated"
          message="Your changes have been saved and are now live."
          adType={updateModal.type}
          adId={updateModal.id}
          isUpdate={true}
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
