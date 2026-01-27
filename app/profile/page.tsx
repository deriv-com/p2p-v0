"use client"

import { useState, useEffect } from "react"
import UserInfo from "./components/user-info"
import TradeLimits from "./components/trade-limits"
import StatsTabs from "./components/stats-tabs"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { useUserDataStore } from "@/stores/user-data-store"
import { TemporaryBanAlert } from "@/components/temporary-ban-alert"
import { P2PAccessRemoved } from "@/components/p2p-access-removed"
import { useTranslations } from "@/lib/i18n/use-translations"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet"

export default function ProfilePage() {
  const [userData, setUserData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const { showAlert } = useAlertDialog()
  const { userData: user, isUserDataLoaded } = useUserDataStore()
  const tempBanUntil = user?.temp_ban_until
  const userEmail = user?.email
  const isDisabled = user?.status === "disabled"
  const { t } = useTranslations()
  const [showKycPopup, setShowKycPopup] = useState(false)
  const searchParams = new URLSearchParams(window.location.search)
  const shouldShowKyc = searchParams.get("show_kyc_popup") === "true"

  useEffect(() => {
    if (shouldShowKyc) {
      setShowKycPopup(true)
    }
  }, [])

  useEffect(() => {
    if (showKycPopup) {
      showAlert({
        title: t("profile.gettingStarted"),
        description: (
          <div className="space-y-4 mb-6 mt-2">
            <KycOnboardingSheet route="profile" />
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

  useEffect(() => {
    if (user && isUserDataLoaded) {
      const joinDate = new Date(user.registered_at)
      const now = new Date()
      const diff = now.getTime() - joinDate.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))

      let joinDateString
      if (days === 0) {
        joinDateString = t("profile.joinedToday")
      } else if (days === 1) {
        joinDateString = t("profile.joinedYesterday")
      } else {
        joinDateString = t("profile.joinedDaysAgo", { days })
      }

      setUserData({
        ...user,
        username: user.nickname,
        is_online: user.is_online ?? true,
        rating:
          user.statistics_lifetime?.rating_average !== null
            ? `${user.statistics_lifetime?.rating_average}/5`
            : t("profile.notRatedYet"),
        recommendation:
          user.statistics_lifetime?.recommend_average !== null
            ? t("profile.recommendedBy", {
              count: user.statistics_lifetime?.recommend_count,
              plural: user.statistics_lifetime?.recommend_count === 1 ? "" : "s",
            })
            : t("profile.notRecommendedYet"),
        completionRate: user.completion_average_30day ? `${user.completion_average_30day}%` : "-",
        buyCompletion: user.buy_time_average_30day ? user.buy_time_average_30day : "-",
        sellCompletion: user.completion_average_30day ? user.completion_average_30day : "-",
        joinDate: joinDateString,
        tradeLimits: {
          buy: {
            current: user.daily_limits_remaining?.buy || 0,
            max: user.daily_limits?.buy || 0,
          },
          sell: {
            current: user.daily_limits_remaining?.sell || 0,
            max: user.daily_limits?.sell || 0,
          },
        },
        isVerified: {
          id: true,
          address: true,
          phone: true,
        },
      })
      setIsLoading(false)
    }
  }, [user, isUserDataLoaded])

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
