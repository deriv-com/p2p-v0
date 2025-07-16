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

interface StatusFeedback {
  success: "create" | "update"
  type: string
  id: string
}

export default function AdsPage() {
  const [ads, setAds] = useState<MyAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeletedBanner, setShowDeletedBanner] = useState(false)
  const [statusFeedback, setStatusFeedback] = useState<StatusFeedback | null>(null)

  const isMobile = useIsMobile()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [errorModal, setErrorModal] = useState({
    show: false,
    title: "Error",
    message: "",
  })

  // Read URL params ONCE immediately
  useEffect(() => {
    console.log("🔍 AdsPage: Checking URL params...")
    const success = searchParams.get("success")
    const type = searchParams.get("type")
    const id = searchParams.get("id")

    console.log("🔍 URL params:", { success, type, id })

    if (success && type && id && (success === "create" || success === "update")) {
      console.log("✅ Valid success params found, storing feedback...")
      // Store immediately
      setStatusFeedback({ success, type, id })
      // Clean URL
      console.log("🧹 Cleaning URL...")
      router.replace("/ads", { scroll: false })
    } else {
      console.log("❌ No valid success params found")
    }
  }, [searchParams, router])

  // Fetch ads on mount
  useEffect(() => {
    console.log("🚀 AdsPage: Starting to fetch ads...")

    const fetchAds = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(`📡 Fetching adverts for user ID: ${USER.id}`)
        const userAdverts = await getUserAdverts()
        console.log("📊 User adverts response:", userAdverts)
        console.log(`✅ Successfully fetched ${userAdverts.length} ads`)
        setAds(userAdverts)
      } catch (err) {
        console.error("❌ Error fetching ads:", err)
        setError("Failed to load ads. Please try again later.")
        setAds([])

        setErrorModal({
          show: true,
          title: "Error Loading Ads",
          message: err instanceof Error ? err.message : "Failed to load ads. Please try again later.",
        })
      } finally {
        console.log("🏁 Ads fetch completed, setting loading to false")
        setLoading(false)
      }
    }

    fetchAds()
  }, [])

  // Log when modal should show
  useEffect(() => {
    console.log("🎭 Modal visibility check:", {
      loading,
      statusFeedback,
      shouldShowModal: !loading && statusFeedback,
      isMobile,
    })
  }, [loading, statusFeedback, isMobile])

  const handleAdUpdated = (status?: string) => {
    console.log("🔄 Ad updated, refreshing list...", { status })
    // Re-fetch
    const reload = async () => {
      try {
        const userAdverts = await getUserAdverts()
        console.log("🔄 Reloaded ads:", userAdverts.length)
        setAds(userAdverts)
      } catch (err) {
        console.error("❌ Error reloading ads:", err)
      }
    }
    reload()

    if (status === "deleted") {
      console.log("🗑️ Showing deleted banner")
      setShowDeletedBanner(true)
      setTimeout(() => {
        console.log("🗑️ Hiding deleted banner")
        setShowDeletedBanner(false)
      }, 3000)
    }
  }

  const handleCloseStatusFeedback = () => {
    console.log("❌ Closing status feedback modal")
    setStatusFeedback(null)
  }

  const handleCloseErrorModal = () => {
    console.log("❌ Closing error modal")
    setErrorModal((prev) => ({ ...prev, show: false }))
  }

  console.log("🎨 AdsPage render:", {
    loading,
    adsCount: ads.length,
    error,
    statusFeedback,
    showDeletedBanner,
    isMobile,
  })

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
          <MyAdsTable ads={ads} onAdDeleted={handleAdUpdated} />
        )}
      </div>

      {/* Show status modal ONLY if ads finished loading and we have feedback */}
      {!loading && statusFeedback && !isMobile && (
        <>
          {console.log("🎭 Rendering desktop StatusModal")}
          <StatusModal
            type="success"
            title={statusFeedback.success === "create" ? "Ad created" : "Ad updated"}
            message={
              statusFeedback.success === "create"
                ? "If your ad doesn't receive an order within 3 days, it will be deactivated."
                : "Your changes have been saved and are now live."
            }
            onClose={handleCloseStatusFeedback}
            adType={statusFeedback.type}
            adId={statusFeedback.id}
            isUpdate={statusFeedback.success === "update"}
          />
        </>
      )}

      {!loading && statusFeedback && isMobile && (
        <>
          {console.log("🎭 Rendering mobile StatusBottomSheet")}
          <StatusBottomSheet
            isOpen
            onClose={handleCloseStatusFeedback}
            type="success"
            title={statusFeedback.success === "create" ? "Ad created" : "Ad updated"}
            message={
              statusFeedback.success === "create"
                ? "If your ad doesn't receive an order within 3 days, it will be deactivated."
                : "Your changes have been saved and are now live."
            }
            adType={statusFeedback.type}
            adId={statusFeedback.id}
            isUpdate={statusFeedback.success === "update"}
          />
        </>
      )}

      {errorModal.show && (
        <>
          {console.log("🎭 Rendering error modal")}
          <StatusModal
            type="error"
            title={errorModal.title}
            message={errorModal.message}
            onClose={handleCloseErrorModal}
          />
        </>
      )}
    </div>
  )
}
