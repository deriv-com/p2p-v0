"use client"

import { useEffect } from "react"
import { useUserDataStore } from "@/stores/user-data-store"

declare global {
  interface Window {
    Intercom: any
    intercomSettings: any
  }
}

export function IntercomProvider({ appId }: { appId: string }) {
  const { userData, userId } = useUserDataStore()

  useEffect(() => {
    // Load Intercom script
    const script = document.createElement("script")
    script.src = `https://widget.intercom.io/widget/rfwdy059`
    script.async = true
    document.body.appendChild(script)

    // Initialize Intercom
    window.intercomSettings = {
      api_base: "https://api-iam.intercom.io",
      app_id: appId,
      hide_default_launcher: true,
      // User identification (optional)
      ...(userId && { user_id: userId }),
      ...(userData?.email && { email: userData.email }),
      ...(userData?.first_name && { name: `${userData.first_name} ${userData.last_name}` }),
    }

    if (window.Intercom) {
      window.Intercom("reattach_activator")
      window.Intercom("update", window.intercomSettings)
    }

    return () => {
      if (window.Intercom) {
        window.Intercom("shutdown")
      }
    }
  }, [appId, userId, userData])

  return null
}
