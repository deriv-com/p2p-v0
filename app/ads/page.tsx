"use client"

import { TooltipTrigger } from "@/components/ui/tooltip"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import MyAdsTable from "./components/my-ads-table"
import { AdsAPI } from "@/services/api"
import { hideMyAds } from "@/services/api/api-my-ads"
import Image from "next/image"
import type { MyAd } from "./types"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import StatusBottomSheet from "./components/ui/status-bottom-sheet"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { useUserDataStore } from "@/stores/user-data-store"
import { useTranslations } from "@/lib/i18n/use-translations"
import { TemporaryBanAlert } from "@/components/temporary-ban-alert"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet"

interface StatusData {
  success: "create" | "update"
  type: string
  id: string
  showStatusModal: boolean
}

export default function AdsPage() {
  const { t } = useTranslations()
  const [ads, setAds] = useState<MyAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeletedBanner, setShowDeletedBanner] = useState(false)
  const [statusData, setStatusData] = useState<StatusData | null>(null)
  const { userData, userId, onboardingStatus, verificationStatus } = useUserDataStore()
  const isPoiExpired = userId && onboardingStatus?.kyc?.poi_status !== "approved"
  const isPoaExpired = userId && onboardingStatus?.kyc?.poa_status !== "approved"
  const tempBanUntil = userData?.temp_ban_until
  const [hiddenAdverts, setHiddenAdverts] = useState(false)
  const [errorModal, setErrorModal] = useState({
    show: false,
    title: "Error",
    message: "",
  })
  const { showAlert } = useAlertDialog()
  const hasFetchedRef = useRef(false)
  const [showKycPopup, setShowKycPopup] = useState(false)
   const abortControllerRef = useRef<AbortController | null>(null)

  const isMobile = useIsMobile()
  const router = useRouter()

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const shouldShowKyc = searchParams.get("show_kyc_popup") === "true"
    if (shouldShowKyc) {
      setShowKycPopup(true)
    }
  }, [])

  useEffect(() => {
    if (showKycPopup) {
      const title = t("profile.gettingStarted")

      if(isPoiExpired && isPoaExpired) title = t("profile.verificationExpired")
      else if(isPoiExpired) title = t("profile.identityVerificationExpired")
      else if(isPoaExpired) title = t("profile.addressVerificationExpired")
      
      showAlert({
        title,
        description: (
          <div className="space-y-4 my-2">
            <KycOnboardingSheet route="ads" />
          </div>
        ),
        confirmText: undefined,
        cancelText: undefined,
        onConfirm: () => setShowKycPopup(false),
        onCancel: () => setShowKycPopup(false),
      })
      setShowKycPopup(false)
    }
  }, [showKycPopup, showAlert, t])

  const handleCreateAd = () => {
    if (!userId || !verificationStatus?.phone_verified || isPoiExpired || isPoaExpired) {
      setShowKycPopup(true)
      return
    }
    router.push("/ads/create")
  }

  const fetchAds = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const userAdverts = await AdsAPI.getUserAdverts(true)

      setAds(userAdverts)
    } catch (err) {
      setError(t("myAds.errorLoadingAds"))
      setAds([])
      setErrorModal({
        show: true,
        title: t("myAds.errorLoadingAdsTitle"),
        message: err instanceof Error ? err.message : t("myAds.errorLoadingAdsMessage"),
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(false)
    if (userId && !hasFetchedRef.current) {
      fetchAds()
      hasFetchedRef.current = true
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [userId])

  useEffect(() => {
    if (userData?.adverts_are_listed !== undefined) {
      setHiddenAdverts(!userData.adverts_are_listed)
    }
  }, [userData?.adverts_are_listed])

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const success = searchParams.get("success")
    const type = searchParams.get("type")
    const id = searchParams.get("id")
    const showStatusModal = searchParams.get("showStatusModal")

    if (!success || !type || !id || showStatusModal !== "true") {
      return
    }

    if ((success === "create" || success === "update") && !isMobile) {
      const adTypeDisplay = type.toUpperCase()
      const createDescription = t("myAds.adCreatedMessage", { type: adTypeDisplay, id })
      const updateDescription = t("myAds.adUpdatedMessage", { type: adTypeDisplay, id })

      showAlert({
        title: success === "create" ? t("myAds.adCreated") : t("myAds.adUpdated"),
        description: success === "create" ? createDescription : updateDescription,
        confirmText: t("common.ok"),
        type: "success",
      })
    }

    if (success === "create" || success === "update") {
      setStatusData({
        success,
        type,
        id,
        showStatusModal: true,
      })

      fetchAds()
    }
  }, [showAlert, isMobile, t])

  const handleAdUpdated = (status?: string) => {
    fetchAds()

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
        confirmText: t("common.ok"),
        onConfirm: handleCloseErrorModal,
        type: "warning",
      })
    }
  }, [errorModal.show, errorModal.title, errorModal.message, showAlert, t])

  const handleHideMyAds = async (value: boolean) => {
    const previousValue = hiddenAdverts
    setHiddenAdverts(value)

    try {
      await hideMyAds(value)
    } catch (error) {
      console.error("Failed to hide/show ads:", error)
      setHiddenAdverts(previousValue)

      showAlert({
        title: value ? t("myAds.unableToHideAds") : t("myAds.unableToShowAds"),
        description: value ? t("myAds.hideAdsError") : t("myAds.showAdsError"),
        confirmText: t("common.ok"),
        type: "warning",
      })
    }
  }

  const getHideMyAdsComponent = () => {
    const hasNoAds = ads.length > 0
    return (
      <div className="flex items-center justify-self-end self-end flex-shrink-0">
        <Switch
          id="hide-ads"
          checked={hiddenAdverts}
          onCheckedChange={handleHideMyAds}
          className="data-[state=checked]:bg-completed-icon"
          disabled={tempBanUntil || !hasNoAds}
        />
        <label htmlFor="hide-ads" className="text-sm text-grayscale-600 cursor-pointer ml-2 whitespace-nowrap">
          {t("myAds.hideMyAds")}
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Image
                src="/icons/info-circle.svg"
                alt="Info"
                width={24}
                height={24}
                className="ml-1 cursor-pointer flex-shrink-0"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-white">{t("myAds.hideMyAdsTooltip")}</p>
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
        <div className="flex-none container mx-auto">
          <div className="w-[calc(100%+24px)] md:w-full h-[80px] bg-slate-1200 p-6 rounded-b-3xl md:rounded-3xl text-white text-xl font-bold -m-3 mb-4 md:mx-0 md:mt-0">
            {t("myAds.title")}
          </div>
          {tempBanUntil && <TemporaryBanAlert tempBanUntil={tempBanUntil} />}
          <div className="flex flex-wrap items-center justify-between gap-3 my-6">
            {ads.length > 0 && (
              <Button
                onClick={handleCreateAd}
                size="sm"
                className="font-bold text-base leading-4 tracking-[0%] text-center whitespace-nowrap"
                disabled={!!tempBanUntil}
              >
                <Image src="/icons/plus-white.png" alt="Plus icon" className="mr-1" height={22} width={13} />
                {t("myAds.createAd")}
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
            title={statusData.success === "create" ? t("myAds.adCreated") : t("myAds.adUpdated")}
            message={
              statusData.success === "create"
                ? t("myAds.adCreatedMessage", { type: statusData.type.toUpperCase(), id: statusData.id })
                : t("myAds.adUpdatedMessage", { type: statusData.type.toUpperCase(), id: statusData.id })
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
