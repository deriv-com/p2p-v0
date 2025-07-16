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

type StatusModalState = {
  show: boolean
  type: string
  id: string
  mode: "create" | "update" | "error" | null
  title?: string
  message?: string
}

export default function AdsPage() {
  const [ads, setAds] = useState<MyAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeletedBanner, setShowDeletedBanner] = useState(false)
  const [statusModal, setStatusModal] = useState<StatusModalState>({
    show: false,
    type: "",
    id: "",
    mode: null,
  })

  const isMobile = useIsMobile()
  const router = useRouter()
  const searchParams = useSearchParams()

  const fetchAds = async () => {
    try {
      setLoading(true)
      setError(null)
      const userAdverts = await getUserAdverts()
      setAds(userAdverts)
    } catch (err) {
      setError("Failed to load ads. Please try again later.")
      setAds([])
      setStatusModal({
        show: true,
        mode: "error",
        type: "",
        id: "",
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
      setTimeout(() => setShowDeletedBanner(false), 3000)
    }
  }

  useEffect(() => {
    fetchAds()

    // Parse status info from URL query params once on mount
    const type = searchParams.get("type") || ""
    const id = searchParams.get("id") || ""
    const mode = searchParams.get("mode") // "create", "update", or "error"

    if (mode === "create" || mode === "update") {
      setStatusModal({
        show: true,
        type,
        id,
        mode,
      })
    } else if (mode === "error") {
      const title = searchParams.get("title") || "Error"
      const message = searchParams.get("message") || "An error occurred."
      setStatusModal({
        show: true,
        type: "",
        id: "",
        mode,
        title,
        message,
      })
    }
  }, [])

  const closeStatusModal = () => {
    setStatusModal((prev) => ({ ...prev, show: false, mode: null }))
    router.replace("/ads", undefined, { scroll: false }) // remove params without reload & scroll jump
  }

  return (
    <div className="flex flex-col h-screen">
      {showDeletedBanner && (
        <StatusBanner
          variant="success"
          message="Ad deleted"
          onClose={() => setShowDeletedBanner(false)}
        />
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

      {/* Single Status Modal controlled by statusModal state */}
      {statusModal.show && statusModal.mode === "create" && !isMobile && (
        <StatusModal
          type="success"
          title="Ad created"
          message="If your ad doesn't receive an order within 3 days, it will be deactivated."
          onClose={closeStatusModal}
          adType={statusModal.type}
          adId={statusModal.id}
          isUpdate={false}
        />
      )}

      {statusModal.show && statusModal.mode === "create" && isMobile && (
        <StatusBottomSheet
          isOpen={statusModal.show}
          onClose={closeStatusModal}
          type="success"
          title="Ad created"
          message="If your ad doesn't receive an order within 3 days, it will be deactivated."
          adType={statusModal.type}
          adId={statusModal.id}
          isUpdate={false}
        />
      )}

      {statusModal.show && statusModal.mode === "update" && !isMobile && (
        <StatusModal
          type="success"
          title="Ad updated"
          message="Your changes have been saved and are now live."
          onClose={closeStatusModal}
          adType={statusModal.type}
          adId={statusModal.id}
          isUpdate={true}
        />
      )}

      {statusModal.show && statusModal.mode === "update" && isMobile && (
        <StatusBottomSheet
          isOpen={statusModal.show}
          onClose={closeStatusModal}
          type="success"
          title="Ad updated"
          message="Your changes have been saved and are now live."
          adType={statusModal.type}
          adId={statusModal.id}
          isUpdate={true}
        />
      )}

      {statusModal.show && statusModal.mode === "error" && (
        <StatusModal
          type="error"
          title={statusModal.title || "Error"}
          message={statusModal.message || "An error occurred."}
          onClose={closeStatusModal}
        />
      )}
    </div>
  )
}
