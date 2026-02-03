"use client"

import { useEffect, useState } from "react"
import UserInfo from "./components/user-info"
import TradeLimits from "./components/trade-limits"
import StatsTabs from "./components/stats-tabs"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { useUserDataStore } from "@/stores/user-data-store"
import { TemporaryBanAlert } from "@/components/temporary-ban-alert"
import { P2PAccessRemoved } from "@/components/p2p-access-removed"
import { useTranslations } from "@/lib/i18n/use-translations"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet"
import { useProfileData } from "@/hooks/use-profile-data"

export default function ProfilePage() {
  const { hideAlert, showAlert } = useAlertDialog()
  const { userData: user } = useUserDataStore()
  const { t } = useTranslations()
  const [showKycPopup, setShowKycPopup] = useState(false)

  const tempBanUntil = user?.temp_ban_until
  const userEmail = user?.email
  const isDisabled = user?.status === "disabled"

  const { userData, isLoading } = useProfileData()

  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
  const shouldShowKyc = searchParams.get("show_kyc_popup") === "true"

  useEffect(() => {
    if (shouldShowKyc) {
      setShowKycPopup(true)
    }
  }, [shouldShowKyc])

  useEffect(() => {
    if (showKycPopup) {
      showAlert({
        title: t("profile.gettingStarted"),
        description: (
          <div className="space-y-4 mb-6 mt-2">
            <KycOnboardingSheet route="profile" onClose={hideAlert} />
          </div>
        ),
        confirmText: undefined,
        cancelText: undefined,
        onConfirm: () => setShowKycPopup(false),
        onCancel: () => setShowKycPopup(false),
      })
      setShowKycPopup(false)
    }
  }, [showKycPopup, showAlert, t, hideAlert])

  if (isDisabled) {
    return (
      <div className="flex flex-col h-screen overflow-hidden px-3">
        <P2PAccessRemoved />
      </div>
    )
  }

  return (
    <>
      <div className="md:px-3 overflow-x-hidden overflow-y-auto h-full">
        <div className="flex flex-col md:flex-row gap-6 h-full">
          <div className="flex-1 order-1 h-full">
            <UserInfo
              username={userData?.username}
              email={userEmail}
              rating={userData?.rating}
              recommendation={userData?.recommendation}
              joinDate={userData?.joinDate}
              realName={userData?.realName}
              isVerified={userData?.isVerified}
              isLoading={isLoading}
              tradeBand={userData?.trade_band}
            />
            {tempBanUntil && <TemporaryBanAlert tempBanUntil={tempBanUntil} />}
            <div className="md:w-[50%] flex flex-col gap-6 order-2 my-4 px-3 md:px-0">
              <TradeLimits
                buyLimit={userData?.tradeLimits?.buy}
                sellLimit={userData?.tradeLimits?.sell}
                userData={userData}
              />
            </div>
            <StatsTabs stats={userData} isLoading={isLoading} activeTab={shouldShowKyc ? "payment" : "stats"} />
          </div>
        </div>
      </div>
    </>
  )
}
