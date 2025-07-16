"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import MyAdsTable from "./components/my-ads-table"
import MyAdsHeader from "./components/my-ads-header"
import { getUserAdverts } from "./api/api-ads"
import { Plus } from "lucide-react"
import type { MyAd } from "./types"
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

  const [shouldCleanUrlOnClose, setShouldCleanUrlOnClose] = useState(false)

  const fetchAds = async () => {
    try {
      setLoading(true)
      setError(null)
      const userAdverts = await getUserAdverts()
      setAds(userAdverts)
    } catch (err) {
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
        const success = searchParams.get("success")
        const type = searchParams.get("type")
        const id = searchParams.get("id")

        if (success && type && id) {
          setShouldCleanUrlOnClose(true)

          if (success === "created") {
            setSuccessModal({
              show: true,
              type: type,
              id: id,
            })
          } else if (success === "updated") {
            setUpdateModal({
              show: true,
              type: type,
              id: id,
            })
          }
        }
      } catch (err) {
        console.error("Error checking for success data:", err)
      }
    }

    checkForSuccessData()
  }, [searchParams, router])

  useEffect(() => {
    fetchAds()
  }, [])

  const cleanUrlParams = () => {
    if (shouldCleanUrlOnClose) {
      router.replace("/ads", { scroll: false })
      setShouldCleanUrlOnClose(false)
    }
  }

  const handleCloseSuccessModal = () => {
    setSuccessModal((prev) => ({ ...prev, show: false }))
    cleanUrlParams()
  }

  const handleCloseUpdateModal = () => {
    setUpdateModal((prev) => ({ ...prev, show: false }))
    cleanUrlParams()
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
