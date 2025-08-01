"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import MyAdsTable from "./components/my-ads-table"
import MyAdsHeader from "./components/my-ads-header"
import { getUserAdverts } from "./api/api-ads"
import Image from "next/image"
import type { MyAd } from "./types"
import MobileMyAdsList from "./components/mobile-my-ads-list"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { StatusBanner } from "@/components/ui/status-banner"
import StatusBottomSheet from "./components/ui/status-bottom-sheet"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import Navigation from "@/components/navigation"
import AdvertFormModal from "./components/shared/advert-form-modal"
import StatusModal from "./components/ui/status-modal" // Import StatusModal

export default function AdsPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const { showAlert } = useAlertDialog()

  const [ads, setAds] = useState<MyAd[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDeletedBanner, setShowDeletedBanner] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusModalType, setStatusModalType] = useState<"success" | "error">("success")
  const [statusModalTitle, setStatusModalTitle] = useState("")
  const [statusModalMessage, setStatusModalMessage] = useState("")
  const [advertModalOpen, setAdvertModalOpen] = useState(false)
  const [advertModalMode, setAdvertModalMode] = useState<"create" | "edit">("create")
  const [editingAd, setEditingAd] = useState<MyAd | null>(null)

  const loadAds = async () => {
    try {
      setIsLoading(true)
      const userAds = await getUserAdverts()
      setAds(userAds)
    } catch (error) {
      console.error("Error loading ads:", error)
      showAlert({
        title: "Error",
        message: "Failed to load your ads. Please try again.",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAds()

    // Check for success/error status from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get("success")
    const showModal = urlParams.get("showStatusModal")

    if (success && showModal === "true") {
      if (success === "create") {
        setStatusModalType("success")
        setStatusModalTitle("Ad created successfully")
        setStatusModalMessage("Your ad is now live and visible to other users.")
      } else if (success === "update") {
        setStatusModalType("success")
        setStatusModalTitle("Ad updated successfully")
        setStatusModalMessage("Your changes have been saved.")
      }
      setShowStatusModal(true)

      // Clean up URL params
      const newUrl = window.location.pathname
      window.history.replaceState({}, "", newUrl)
    }
  }, [showAlert])

  const handleAdUpdated = (status?: string) => {
    if (status === "deleted") {
      setShowDeletedBanner(true)
      setTimeout(() => setShowDeletedBanner(false), 5000)
    }
    loadAds()
  }

  const handleCreateAd = () => {
    setAdvertModalMode("create")
    setEditingAd(null)
    setAdvertModalOpen(true)
  }

  const handleEditAd = (ad: MyAd) => {
    setAdvertModalMode("edit")
    setEditingAd(ad)
    setAdvertModalOpen(true)
  }

  const handleModalSuccess = () => {
    loadAds()
    setAdvertModalOpen(false)
  }

  const handleModalClose = () => {
    setAdvertModalOpen(false)
    setEditingAd(null)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading your ads...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {isMobile && <Navigation isBackBtnVisible={true} redirectUrl="/" title="P2P" />}

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {showDeletedBanner && (
          <div className="mb-4">
            <StatusBanner variant="success" message="Ad deleted" onClose={() => setShowDeletedBanner(false)} />
          </div>
        )}

        <MyAdsHeader hasAds={ads.length > 0} />

        {ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Image src="/icons/my-ads-icon.png" alt="No ads" width={48} height={48} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No ads yet</h3>
              <p className="text-gray-600 max-w-md">
                Create your first ad to start trading with other users on the platform.
              </p>
            </div>
            <Button onClick={handleCreateAd} className="flex items-center gap-2">
              <Image src="/icons/plus_icon.png" alt="Create" width={16} height={16} />
              Create ad
            </Button>
          </div>
        ) : (
          <>
            {isMobile ? (
              <MobileMyAdsList ads={ads} onAdDeleted={handleAdUpdated} onEditAd={handleEditAd} />
            ) : (
              <MyAdsTable ads={ads} onAdDeleted={handleAdUpdated} onEditAd={handleEditAd} />
            )}

            <div className="mt-8 flex justify-center">
              <Button onClick={handleCreateAd} className="flex items-center gap-2">
                <Image src="/icons/plus_icon.png" alt="Create" width={16} height={16} />
                Create ad
              </Button>
            </div>
          </>
        )}
      </div>

      <AdvertFormModal
        isOpen={advertModalOpen}
        onClose={handleModalClose}
        mode={advertModalMode}
        initialData={editingAd || {}}
        adId={editingAd?.id}
        onSuccess={handleModalSuccess}
      />

      {showStatusModal && !isMobile && (
        <StatusModal
          type={statusModalType}
          title={statusModalTitle}
          message={statusModalMessage}
          onClose={() => setShowStatusModal(false)}
        />
      )}

      {showStatusModal && isMobile && (
        <StatusBottomSheet
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          type={statusModalType}
          title={statusModalTitle}
          message={statusModalMessage}
        />
      )}
    </>
  )
}
