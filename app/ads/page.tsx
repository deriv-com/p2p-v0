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
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { useUserDataStore } from "@/stores/user-data-store"
import { TemporaryBanAlert } from "@/components/temporary-ban-alert"
import { P2PAccessRemoved } from "@/components/p2p-access-removed"
import { useTranslations } from "@/lib/i18n/use-translations"

export default function AdsPage() {
  const { t } = useTranslations()
  const [ads, setAds] = useState<MyAd[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeletedBanner, setShowDeletedBanner] = useState(false)
  const { userData, userId } = useUserDataStore()
  const tempBanUntil = userData?.temp_ban_until
  const isDisabled = userData?.status === "disabled"
  const [hiddenAdverts, setHiddenAdverts] = useState(false)
  const [errorModal, setErrorModal] = useState({
    show: false,
    title: "Error",
    message: "",
  })
  const { showAlert } = useAlertDialog()
  const hasFetchedRef = useRef(false)

  const isMobile = useIsMobile()
  const router = useRouter()
  const fetchAds = async () => {
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
      hasFetchedRef.current = true
      fetchAds()
    }
  }, [userId])

  useEffect(() => {
    if (userData?.adverts_are_listed !== undefined) {
      setHiddenAdverts(!userData.adverts_are_listed)
    }
  }, [userData?.adverts_are_listed])

  const handleAdUpdated = (status?: string) => {
    fetchAds()

    if (status === "deleted") {
      setShowDeletedBanner(true)
      setTimeout(() => setShowDeletedBanner(false), 3000)
    }
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
    return (
      <div className="flex items-center justify-self-end flex-shrink-0">
        <Switch
          id="hide-ads"
          checked={hiddenAdverts}
          onCheckedChange={handleHideMyAds}
          className="data-[state=checked]:bg-completed-icon"
          disabled={tempBanUntil}
        />
        <label htmlFor="hide-ads" className="text-sm text-neutral-10 cursor-pointer ml-2 whitespace-nowrap">
          {t("myAds.hideMyAds")}
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Image
                src="/icons/info-circle.png"
                alt="Info"
                width={12}
                height={12}
                className="ml-1 cursor-pointer flex-shrink-0"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="opacity-[0.72]">{t("myAds.hideMyAdsTooltip")}</p>
              <TooltipArrow className="fill-black" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  if (isDisabled) {
    return (
      <div className="flex flex-col h-screen overflow-hidden px-3">
        <P2PAccessRemoved />
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
                onClick={() => router.push("/ads/create")}
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
      </div>
    </>
  )
}
