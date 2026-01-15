"use client"

import { useEffect, useState } from "react"
import { useUserDataStore } from "@/stores/user-data-store"
import { getIntercomToken } from "@/services/api/api-intercom"

declare global {
  interface Window {
    Intercom: any
    intercomSettings: any
  }
}

export function IntercomProvider({ appId }: { appId: string }) {
  const { userData, userId } = useUserDataStore()
  const [intercomJwt, setIntercomJwt] = useState<string | null>(null)
  const [intercomUserId, setIntercomUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  console.log("IntercomProvider mounted", {
    appId,
    userId,
    userEmail: userData?.email,
  })

  // Fetch Intercom token
  useEffect(() => {
    const fetchToken = async () => {
      // Only fetch token if we have both userId and user email (indicating full authentication)
      if (!userId || !userData?.email) {
        console.log("Skipping Intercom token fetch - user not fully authenticated", {
          userId,
          hasEmail: !!userData?.email,
        })
        setIsLoading(false)
        return
      }

      console.log("Fetching Intercom token...", { platform: "web" })
      try {
        const result = await getIntercomToken("web")
        if (result?.token) {
          // This endpoint returns an Intercom Identity Verification token (JWT).
          // When Intercom "Messenger Security" is enabled, you must pass this as `intercom_user_jwt`,
          // not `user_hash` (HMAC).
          setIntercomJwt(result.token)
          setIntercomUserId(result.id ?? userId)
          console.log("Intercom token received successfully", {
            intercom_user_jwt: result.token,
            intercom_user_id: result.id ?? userId,
          })
        } else {
          setIntercomUserId(userId)
          console.warn("Intercom token not received, continuing without JWT", {
            intercom_user_id: userId,
          })
        }
      } catch (error) {
        console.error("Failed to fetch Intercom token:", error)
        setIntercomUserId(userId)
      } finally {
        setIsLoading(false)
      }
    }

    fetchToken()
  }, [userId, userData?.email])

  // Initialize Intercom
  useEffect(() => {
    // Don't initialize until we have the hash or confirmed we don't need it
    if (isLoading) return

    // Load Intercom script
    const script = document.createElement("script")
    script.src = `https://widget.intercom.io/widget/${appId}`
    script.async = true
    document.body.appendChild(script)

    // Initialize Intercom settings
    window.intercomSettings = {
      api_base: "https://api-iam.intercom.io",
      app_id: appId,
      hide_default_launcher: true,
      // User identification
      ...(intercomUserId && { user_id: intercomUserId }),
      ...(userData?.email && { email: userData.email }),
      ...(userData?.first_name && { name: `${userData.first_name} ${userData.last_name}` }),
      // Messenger Security (Identity Verification)
      ...(intercomJwt && { intercom_user_jwt: intercomJwt }),
    }

    if (window.Intercom) {
      window.Intercom("reattach_activator")
      window.Intercom("update", window.intercomSettings)
    }

    return () => {
      if (window.Intercom) {
        window.Intercom("shutdown")
      }
      // Clean up script
      const scriptElement = document.querySelector(`script[src*="widget.intercom.io"]`)
      if (scriptElement) {
        scriptElement.remove()
      }
    }
  }, [appId, userData, intercomJwt, intercomUserId, isLoading])

  return null
}
