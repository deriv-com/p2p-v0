"use client"

import { useState, useEffect } from "react"
import UserInfo from "@/components/profile/user-info"
import TradeLimits from "@/components/profile/trade-limits"
import StatsTabs from "./components/stats-tabs"
import { USER, API, AUTH } from "@/lib/local-variables"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import Navigation from "@/components/navigation"

export default function ProfilePage() {
  const isMobile = useIsMobile()
  const [userData, setUserData] = useState({
    username: "",
    rating: "Not rated yet",
    completionRate: "",
    joinDate: "",
    realName: "",
    isVerified: {
      id: true,
      address: true,
      phone: true,
    },
    businessHours: {
      isOpen: true,
      availability: "",
    },
    tradeLimits: {
      buy: {
        current: 0,
        max: 0,
      },
      sell: {
        current: 0,
        max: 0,
      },
    },
    stats: {
      buyCompletion: { rate: "", period: "" },
      sellCompletion: { rate: "100% (50)", period: "" },
      avgPayTime: { time: "", period: "" },
      avgReleaseTime: { time: "", period: "" },
      tradePartners: 0,
      totalOrders30d: 0,
      totalOrdersLifetime: 0,
      tradeVolume30d: { amount: "", currency: "", period: "" },
      tradeVolumeLifetime: { amount: "", currency: "" },
    },
  })

  const { showWarningDialog } = useAlertDialog()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = USER.id
        const url = `${API.baseUrl}/users/${userId}`
        const headers = AUTH.getAuthHeader()

        const response = await fetch(url, {
          // credentials: "include",
          headers,
        })

        const responseData = await response.json()


        if (responseData.errors && responseData.errors.length > 0) {
          const errorMessage = Array.isArray(responseData.errors) ? responseData.errors.join(", ") : responseData.errors
          showWarningDialog({
            title: "Error",
            description: errorMessage,
          })
          return
        }

        if (responseData && responseData.data) {
          const data = responseData.data

          const joinDate = new Date(data.created_at)
          const now = new Date()
          const diff = now.getTime() - joinDate.getTime()
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))

          let joinDateString
          if (days === 0) {
            joinDateString = "Joined today"
          } else if (days === 1) {
            joinDateString = "Joined yesterday"
          } else {
            joinDateString = `Joined ${days} days ago`
          }

          setUserData((prevData) => ({
            ...prevData,
            username: data.nickname || prevData.username,
            rating: data.rating_average_lifetime !== null ? `${data.rating_average_lifetime}/5` : "Not rated yet",
            completionRate: `${data.completion_average_30day || 0}%`,
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
            stats: {
              ...prevData.stats,
              tradePartners: data.partner_count_lifetime || 0,
              avgPayTime: {
                time: data.release_time_average_30day ? `${data.release_time_average_30day} min` : "-",
                period: "(30d)",
              },
            },
          }))
        } else {
          showWarningDialog({
            title: "Error",
            description: "No user data found",
          })
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to load user data"
        showWarningDialog({
          title: "Error",
          description: errorMessage,
        })
        console.error("Error fetching user data:", error)
      }
    }

    fetchUserData()
  },[])

  return (
    <>
    {isMobile && <Navigation isBackBtnVisible={true} redirectUrl="/" title="P2P" />}
    <div className="px-[24px]">
      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="flex-1 order-1">
          <UserInfo
            username={userData.username}
            rating={userData.rating}
            completionRate={userData.completionRate}
            joinDate={userData.joinDate}
            realName={userData.realName}
            isVerified={userData.isVerified}
          />
          <div className="md:w-[50%] flex flex-col gap-6 order-2 mb-[16px]">
            <TradeLimits buyLimit={userData.tradeLimits.buy} sellLimit={userData.tradeLimits.sell} />
          </div>
          <StatsTabs stats={userData.stats} />
        </div>
      </div>
    </div>
    </>
  )
}
