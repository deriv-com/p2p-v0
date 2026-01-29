"use client"

import { useEffect, useMemo } from "react"
import UserInfo from "./components/user-info"
import TradeLimits from "./components/trade-limits"
import StatsTabs from "./components/stats-tabs"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { useUserDataStore } from "@/stores/user-data-store"
import { TemporaryBanAlert } from "@/components/temporary-ban-alert"
import { P2PAccessRemoved } from "@/components/p2p-access-removed"
import { useTranslations } from "@/lib/i18n/use-translations"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet"
import { useSearchParams } from "next/navigation"

export default function ProfilePage() {
  const { hideAlert, showWarningDialog, showAlert } = useAlertDialog()
  const { userData: user } = useUserDataStore()
  const tempBanUntil = user?.temp_ban_until
  const userEmail = user?.email
  const isDisabled = user?.status === "disabled"
  const { t } = useTranslations()
  const searchParams = useSearchParams()
  const shouldShowKyc = searchParams.get("show_kyc_popup") === "true"

  // Transform user data for display - memoized to avoid unnecessary recalculations
  const transformedUserData = useMemo(() => {
    if (!user) return {}

    const joinDate = new Date(user.registered_at || Date.now())
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

    return {
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
    }
  }, [user, t])

  useEffect(() => {
    if (shouldShowKyc) {
      showAlert({
        title: t("profile.gettingStarted"),
        description: (
          <div className="space-y-4 mb-6 mt-2">
            <KycOnboardingSheet route="profile" onClose={hideAlert} />
          </div>
        ),
        confirmText: undefined,
        cancelText: undefined,
        onConfirm: () => { },
        onCancel: () => hideAlert(),
      })
    }
  }, [shouldShowKyc, showAlert, hideAlert, t])

  if (isDisabled) {
    return (
      <div className="flex flex-col h-screen overflow-hidden px-3">
        <P2PAccessRemoved />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="md:px-3 overflow-x-hidden overflow-y-auto h-full">
        <div className="flex flex-col md:flex-row gap-6 h-full">
          <div className="flex-1 order-1 h-full">
            <UserInfo
              username=""
              email=""
              rating=""
              recommendation={0}
              joinDate=""
              realName=""
              isVerified={{ id: false, address: false, phone: false }}
              isLoading={true}
              tradeBand=""
            />
            <div className="md:w-[50%] flex flex-col gap-6 order-2 my-4 px-3 md:px-0">
              <TradeLimits
                buyLimit={{ current: 0, max: 0 }}
                sellLimit={{ current: 0, max: 0 }}
                userData={{}}
              />
            </div>
            <StatsTabs stats={{}} isLoading={true} activeTab={shouldShowKyc ? "payment" : "stats"} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="md:px-3 overflow-x-hidden overflow-y-auto h-full">
        <div className="flex flex-col md:flex-row gap-6 h-full">
          <div className="flex-1 order-1 h-full">
            <UserInfo
              username={transformedUserData?.username}
              email={userEmail}
              rating={transformedUserData?.rating}
              recommendation={transformedUserData?.recommendation}
              joinDate={transformedUserData?.joinDate}
              realName={transformedUserData?.realName}
              isVerified={transformedUserData?.isVerified}
              isLoading={false}
              tradeBand={transformedUserData?.trade_band}
            />
            {tempBanUntil && <TemporaryBanAlert tempBanUntil={tempBanUntil} />}
            <div className="md:w-[50%] flex flex-col gap-6 order-2 my-4 px-3 md:px-0">
              <TradeLimits
                buyLimit={transformedUserData?.tradeLimits?.buy}
                sellLimit={transformedUserData?.tradeLimits?.sell}
                userData={transformedUserData}
              />
            </div>
            <StatsTabs stats={transformedUserData} isLoading={false} activeTab={shouldShowKyc ? "payment" : "stats"} />
          </div>
        </div>
      </div>
    </>
  )
}
