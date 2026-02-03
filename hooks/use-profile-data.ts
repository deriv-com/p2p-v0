import { useState, useEffect } from "react"
import { useTranslations } from "@/lib/i18n/use-translations"

export interface UserProfileData {
  username?: string
  email?: string
  rating?: string
  recommendation?: number
  joinDate?: string
  realName?: string
  isVerified?: {
    id: boolean
    address: boolean
    phone: boolean
  }
  tradeLimits?: {
    buy: {
      current: number
      max: number
    }
    sell: {
      current: number
      max: number
    }
  }
  trade_band?: string
}

export function useProfileData() {
  const [userData, setUserData] = useState<UserProfileData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslations()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/users/me`
        const response = await fetch(url, {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const responseData = await response.json()

        if (responseData.errors?.length > 0) {
          const firstError = responseData.errors[0]
          if (![401, 403, 404].includes(firstError.status)) {
            setError(Array.isArray(responseData.errors) ? responseData.errors.join(", ") : String(responseData.errors))
          }
          return
        }

        if (responseData?.data) {
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

          setUserData({
            username: data.nickname,
            email: data.email,
            is_online: data.is_online ?? true,
            rating:
              data.statistics_lifetime.rating_average !== null
                ? `${data.statistics_lifetime.rating_average}/5`
                : t("profile.notRatedYet"),
            recommendation:
              data.statistics_lifetime?.recommend_average !== null
                ? t("profile.recommendedBy", {
                    count: data.statistics_lifetime.recommend_count,
                    plural: data.statistics_lifetime.recommend_count === 1 ? "" : "s",
                  })
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
            trade_band: data.trade_band,
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("profile.errorLoadingProfile"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [t])

  return {
    userData,
    isLoading,
    error,
    setUserData,
  }
}
