"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getUserAdverts } from "./api/api-ads"
import { MyAdsHeader } from "./components/my-ads-header"
import { MyAdsTable } from "./components/my-ads-table"
import { MyAdsMobileView } from "./components/my-ads-mobile-view"
import { StatusModal } from "./components/ui/status-modal"
import { StatusBottomSheet } from "./components/ui/status-bottom-sheet"
import { useMobile } from "@/hooks/use-mobile"
import type { MyAd } from "@/services/api/api-my-ads"

interface StatusFeedback {
  success: "create" | "update"
  type: string
  id: string
}

interface ErrorModal {
  show: boolean
  title: string
  message: string
}

export default function AdsPage() {
  const [ads, setAds] = useState<MyAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFeedback, setStatusFeedback] = useState<StatusFeedback | null>(null)
  const [errorModal, setErrorModal] = useState<ErrorModal>({
    show: false,
    title: "",
    message: "",
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const isMobile = useMobile()

  console.log("🎨 AdsPage render:", { loading, statusFeedback, adsCount: ads.length })

  useEffect(() => {
    const fetchAds = async () => {
      try {
        console.log("🚀 AdsPage: Starting to fetch ads...")
        setLoading(true)
        setError(null)

        console.log("📡 Fetching adverts for user ID:", "current_user")
        const userAdverts = await getUserAdverts()
        console.log("📊 User adverts response:", userAdverts)

        setAds(userAdverts)
        console.log("✅ Successfully fetched", userAdverts.length, "ads")

        // After ads loaded, check for URL params and set feedback
        console.log("🔍 AdsPage: Checking URL params after ads loaded...")
        const success = searchParams.get("success")
        const type = searchParams.get("type")
        const id = searchParams.get("id")

        console.log("🔍 URL params:", { success, type, id })

        if (success && type && id && (success === "create" || success === "update")) {
          console.log("✅ Valid success params found, setting status feedback")
          setStatusFeedback({ success, type, id })
          console.log("🧹 Cleaning URL...")
          router.replace("/ads", { scroll: false })
        } else {
          console.log("❌ No valid success params found")
        }
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
  }, [searchParams, router])

  const handleCloseStatusModal = () => {
    console.log("🎭 Closing status modal")
    setStatusFeedback(null)
  }

  const handleCloseErrorModal = () => {
    setErrorModal({ show: false, title: "", message: "" })
  }

  const getStatusModalProps = () => {
    if (!statusFeedback) return null

    const isCreate = statusFeedback.success === "create"
    const actionText = isCreate ? "created" : "updated"

    return {
      title: `Ad ${actionText} successfully`,
      message: `Your ${statusFeedback.type} ad has been ${actionText} successfully.`,
      type: "success" as const,
    }
  }

  const statusModalProps = getStatusModalProps()
  const shouldShowModal = !loading && statusFeedback && statusModalProps

  console.log("🎭 Modal visibility check:", {
    loading,
    statusFeedback: !!statusFeedback,
    shouldShowModal,
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        <MyAdsHeader />

        {isMobile ? (
          <MyAdsMobileView ads={ads} loading={loading} error={error} onAdsUpdate={setAds} />
        ) : (
          <MyAdsTable ads={ads} loading={loading} error={error} onAdsUpdate={setAds} />
        )}

        {/* Status Modal - Desktop */}
        {!isMobile && shouldShowModal && (
          <>
            {console.log("🎭 Rendering desktop StatusModal")}
            <StatusModal
              isOpen={true}
              onClose={handleCloseStatusModal}
              title={statusModalProps.title}
              message={statusModalProps.message}
              type={statusModalProps.type}
            />
          </>
        )}

        {/* Status Bottom Sheet - Mobile */}
        {isMobile && shouldShowModal && (
          <>
            {console.log("🎭 Rendering mobile StatusBottomSheet")}
            <StatusBottomSheet
              isOpen={true}
              onClose={handleCloseStatusModal}
              title={statusModalProps.title}
              message={statusModalProps.message}
              type={statusModalProps.type}
            />
          </>
        )}

        {/* Error Modal */}
        {errorModal.show && (
          <>
            {console.log("🎭 Rendering error modal")}
            {isMobile ? (
              <StatusBottomSheet
                isOpen={true}
                onClose={handleCloseErrorModal}
                title={errorModal.title}
                message={errorModal.message}
                type="error"
              />
            ) : (
              <StatusModal
                isOpen={true}
                onClose={handleCloseErrorModal}
                title={errorModal.title}
                message={errorModal.message}
                type="error"
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
