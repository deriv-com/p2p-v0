"use client"

import { useState, useEffect } from "react"
import { API, AUTH, USER } from "@/lib/local-variables"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { KycOnboardingSheet } from "@/components/kyc-onboarding-sheet"

export default function ProfilePage() {
  const [isKycSheetOpen, setIsKycSheetOpen] = useState(false)
  const { showWarningDialog } = useAlertDialog()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const url = `${API.baseUrl}/users/me`
        const headers = AUTH.getAuthHeader()

        const response = await fetch(url, {
          credentials: "include",
          headers,
        })

        const responseData = await response.json()
        setIsLoading(false)

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

          setUserData(() => ({
            ...data,
            username: data.nickname,
            rating: data.rating_average_lifetime !== null ? `${data.rating_average_lifetime}/5` : "Not rated yet",
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

    if(USER.id) {
      fetchUserData()
    } else {
      setIsKycSheetOpen(true)
    }

    console.log("mounted")
  }, [])

  return (
    <>
      <KycOnboardingSheet isSheetOpen={isKycSheetOpen} setSheetOpen={setIsKycSheetOpen} />
    </>
  )
}
