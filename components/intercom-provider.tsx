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
  const [intercomHash, setIntercomHash] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch Intercom token
  useEffect(() => {
    const fetchToken = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        const result = await getIntercomToken("web")
        if (result?.token) {
          setIntercomHash(result.token)
        }
      } catch (error) {
        console.error("Failed to fetch Intercom token:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchToken()
  }, [userId])

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
      ...(userId && { user_id: userId }),
      ...(userData?.email && { email: userData.email }),
      ...(userData?.first_name && { name: `${userData.first_name} ${userData.last_name}` }),
      // Security hash
      ...(intercomHash && { user_hash: intercomHash }),
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
  }, [appId, userId, userData, intercomHash, isLoading])

  return null
}
