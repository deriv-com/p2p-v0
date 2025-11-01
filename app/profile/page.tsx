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

export default function ProfilePage() {
  const [userData, setUserData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const { showWarningDialog } = useAlertDialog()
  const { userData: user } = useUserDataStore()
  const tempBanUntil = user?.temp_ban_until
  const userEmail = user?.email
  const isDisabled = user?.status === "disabled"
  const t = useTranslations()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/users/me`
        const headers = {
          "Content-Type": "application/json",
        }

        const response = await fetch(url, {
          credentials: "include",
          headers,
        })

        const responseData = await response.json()
        setIsLoading(false)

        if (responseData.errors && responseData.errors.length > 0) {
          const errorMessage = Array.isArray(responseData.errors) ? responseData.errors.join(", ") : responseData.errors

          if (responseData.errors[0].status != 401 && responseData.errors[0].status != 404) {
            showWarningDialog({
              title: t("common.error"),
              description: errorMessage,
            })
          }

          return
        }

        if (responseData && responseData.data) {
          const data = responseData.data

          const joinDate = new Date(data.registered_at)
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

          setUserData(() => ({
            ...data,
            username: data.nickname,
            is_online: data.is_online ?? true,
            rating:
              data.statistics_lifetime.rating_average !== null
                ? `${data.statistics_lifetime.rating_average}/5`
                : t("profile.notRatedYet"),
            recommendation:
              data.statistics_lifetime?.recommend_average !== null
                ? t("profile.recommendedBy", { count: data.statistics_lifetime.recommend_count })
                : t("profile.notRecommendedYet"),
            completionRate: data.completion_average_30day ? `${data.completion_average_30day}%` : "-",
            buyCompletion: data.buy_time_average_30day ? data.buy_time_average_30day : "-",
            sellCompletion: data.completion_average_30day ? data.completion_average_30day : "-",
            joinDate: joinDateString,
            tradeLimits: {
              buy: {
                current: data.daily_limits_remaining?.buy || 0,
                max: data.daily_limits?.buy || 0,
              },
              sell: {
                current: data.daily_limits_remaining?.sell || 0,
                max: data.daily_limits?.sell || 0,
              },
            },
            isVerified: {
              id: true,
              address: true,
              phone: true,
            },
          }))
        } else {
          showWarningDialog({
            title: t("common.error"),
            description: t("profile.noUserData"),
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t("profile.errorLoadingProfile")
        showWarningDialog({
          title: t("common.error"),
          description: errorMessage,
        })
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  }, [t])

  if (isDisabled) {
    return (
      <div className="flex flex-col h-screen overflow-hidden px-3">
        <P2PAccessRemoved />
      </div>
    )
  }

  return (
    <>
      <div className="px-3 pt-3 md:pt-0">
        <div className="flex flex-col md:flex-row gap-6 h-full">
          <div className="flex-1 order-1">
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
            <div className="md:w-[50%] flex flex-col gap-6 order-2 my-4">
              <TradeLimits
                buyLimit={userData?.tradeLimits?.buy}
                sellLimit={userData?.tradeLimits?.sell}
                userData={userData}
              />
            </div>
            <StatsTabs stats={userData} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </>
  )
}
