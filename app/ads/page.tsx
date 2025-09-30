"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import MyAdsTable from "./components/my-ads-table"
import { AdsAPI } from "@/services/api"
import { hideMyAds } from "@/services/api/api-my-ads"
import Image from "next/image"
import type { MyAd } from "./types"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { StatusBanner } from "@/components/ui/status-banner"
import StatusBottomSheet from "./components/ui/status-bottom-sheet"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserDataStore } from "@/stores/user-data-store"

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
  const { userData } = useUserDataStore()
  const userDataFromStore = userData
  const [hiddenAdverts, setHiddenAdverts] = useState(!userDataFromStore?.adverts_are_listed)
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active")
  const [errorModal, setErrorModal] = useState({
    show: false,
    title: "Error",
    message: "",
  })
  const { showAlert } = useAlertDialog()

  const isMobile = useIsMobile()
  const router = useRouter()

  const fetchAds = async (showInactive?: boolean) => {
    try {
      setLoading(true)
      setError(null)
      const userAdverts = await AdsAPI.getUserAdverts(showInactive)

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

    fetchAds(false)
  }, [showAlert, isMobile])

  useEffect(() => {
    const showInactive = activeTab === "inactive"
    fetchAds(showInactive)
  }, [activeTab])

  const handleAdUpdated = (status?: string) => {
    const reload = async () => {
      try {
        const showInactive = activeTab === "inactive"
        const userAdverts = await AdsAPI.getUserAdverts(showInactive)
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

  const handleHideMyAds = async (value: boolean) => {
    try {
      await hideMyAds(value)
      setHiddenAdverts(value)
    } catch (error) {
      console.error("Failed to hide/show ads:", error)
      setHiddenAdverts(value)
    }
  }

  const getHideMyAdsComponent = () => {
    return (
      <div className="flex items-center justify-self-end">
        <Switch
          id="hide-ads"
          checked={hiddenAdverts}
          onCheckedChange={handleHideMyAds}
          className="data-[state=checked]:bg-completed-icon"
        />
        <label htmlFor="hide-ads" className="text-sm text-neutral-10 cursor-pointer ml-2">
          Hide my ads
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Image src="/icons/info-circle.png" alt="Info" width={12} height={12} className="ml-1 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Hidden ads won't appear on the Market page.</p>
              <TooltipArrow className="fill-black" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-screen bg-white px-3">
        {showDeletedBanner && (
          <StatusBanner variant="success" message="Ad deleted" onClose={() => setShowDeletedBanner(false)} />
        )}
        <div className="flex-none container mx-auto">
          <div className="flex items-center justify-between my-6">
            {ads.length > 0 && (
              <Button
                onClick={() => router.push("/ads/create")}
                size="sm"
                className="font-bold text-base leading-4 tracking-[0%] text-center"
              >
                Create ads
              </Button>
            )}
            {getHideMyAdsComponent()}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden container mx-auto p-0">
          {error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <MyAdsTable ads={ads} onAdDeleted={handleAdUpdated} hiddenAdverts={hiddenAdverts} isLoading={loading} />
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
