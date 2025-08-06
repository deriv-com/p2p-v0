"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import MyAdsTable from "./components/my-ads-table"
import { getUserAdverts } from "./api/api-ads"
import Image from "next/image"
import type { MyAd } from "./types"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { StatusBanner } from "@/components/ui/status-banner"
import StatusBottomSheet from "./components/ui/status-bottom-sheet"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import Navigation from "@/components/navigation"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
  const [hideMyAds, setHideMyAds] = useState(false)
  const [errorModal, setErrorModal] = useState({
    show: false,
    title: "Error",
    message: "",
  })
  const { showAlert } = useAlertDialog()

  const isMobile = useIsMobile()
  const router = useRouter()

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const success = searchParams.get("success")
    const type = searchParams.get("type")
    const id = searchParams.get("id")
    const showStatusModal = searchParams.get("showStatusModal")

    if (
      success &&
      type &&
      id &&
      showStatusModal === "true" &&
      (success === "create" || success === "update") &&
      !isMobile
    ) {
      const adTypeDisplay = type.toUpperCase()
      const createDescription = `You've successfully created Ad (${adTypeDisplay} ${id}).\n\nIf your ad doesn't receive an order within 3 days, it will be deactivated.`
      const updateDescription = `You've successfully updated Ad (${adTypeDisplay} ${id}).\n\nYour changes have been saved and are now live.`

      showAlert({
        title: success === "create" ? "Ad created" : "Ad updated",
        description: success === "create" ? createDescription : updateDescription,
        confirmText: "OK",
        type: "success",
      })
    }

    if (success && type && id && showStatusModal === "true" && (success === "create" || success === "update")) {
      setStatusData({
        success,
        type,
        id,
        showStatusModal: true,
      })
    }

    const fetchAds = async () => {
      try {
        setLoading(true)
        setError(null)
        const userAdverts = await getUserAdverts()

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
  }, [showAlert, isMobile])

  const handleAdUpdated = (status?: string) => {
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

  const handleCloseErrorModal = () => {
    setErrorModal((prev) => ({ ...prev, show: false }))
  }

  useEffect(() => {
    if (errorModal.show) {
      showAlert({
        title: errorModal.title,
        description: errorModal.message,
        confirmText: "OK",
        onConfirm: handleCloseErrorModal,
        type: "warning",
      })
    }
  }, [errorModal.show, errorModal.title, errorModal.message, showAlert])

  const getHideMyAdsComponent = () => {
   return (<div className="flex items-center gap-2">
          <Switch
            id="hide-ads"
            checked={hideMyAds}
            onCheckedChange={setHideMyAds}
            className="data-[state=checked]:bg-completed-icon"
          />
          <label htmlFor="hide-ads" className="text-sm text-neutral-10 cursor-pointer">
            Hide my ads
          </label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                  <Image src="/icons/info-circle.png" alt="Info" width={12} height={12} className="ml-1 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Hidden ads won't appear on the Buy/Sell page.</p>
                <TooltipArrow className="fill-black" />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>)
  }

  return (
    <>
      {isMobile && <Navigation isBackBtnVisible={true} redirectUrl="/" title="P2P" />}
      <div className="flex flex-col h-screen bg-white px-[24px]">
        {showDeletedBanner && (
          <StatusBanner variant="success" message="Ad deleted" onClose={() => setShowDeletedBanner(false)} />
        )}
        <div className="flex-none container mx-auto pr-4">
          {ads.length > 0 && !isMobile && (
            <div className="flex items-center justify-between mb-6">
              <Button
                onClick={() => router.push("/ads/create")}
                variant="cyan"
                size="pill"
                className="font-extrabold text-base leading-4 tracking-[0%] text-center"
              >
                <Image src="/icons/plus_icon.png" alt="Plus" width={14} height={24} />
                Create ad
              </Button>
                {getHideMyAdsComponent()}
            </div>
          )}
          
          {ads.length > 0 && isMobile && (
            <div className="flex items-center justify-between mb-4">
              {getHideMyAdsComponent()}
            </div>
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
              <Image src="/icons/plus_icon.png" alt="Plus" width={14} height={24} />
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
          ) : hideMyAds ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="bg-gray-100 rounded-full p-6 mb-6">
                <Image src="/icons/search-icon.png" alt="Search" width={48} height={48} className="text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Your ads are hidden</h2>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                Toggle "Hide my ads" to show your ads in the list.
              </p>
            </div>
          ) : (
            <MyAdsTable ads={ads} onAdDeleted={handleAdUpdated} />
          )}
        </div>
      
        {statusData && statusData.showStatusModal && !loading && !errorModal.show && isMobile && (
          <StatusBottomSheet
            isOpen
            onClose={handleCloseStatusModal}
            type="success"
            title={statusData.success === "create" ? "Ad created" : "Ad updated"}
            message={
              statusData.success === "create"
                ? `You've successfully created Ad (${statusData.type.toUpperCase()} ${statusData.id}).\n\nIf your ad doesn't receive an order within 3 days, it will be deactivated.`
                : `You've successfully updated Ad (${statusData.type.toUpperCase()} ${statusData.id}).\n\nYour changes have been saved and are now live.`
            }
            adType={statusData.type}
            adId={statusData.id}
            isUpdate={statusData.success === "update"}
          />
        )}
      </div>
    </>
  )
}
