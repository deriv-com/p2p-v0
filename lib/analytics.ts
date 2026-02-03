"use client"

import { Analytics } from "@deriv-com/analytics"
import { useUserDataStore } from "@/stores/user-data-store"

export const initializeAnalytics = async () => {
  if (typeof window === "undefined") {
    return
  }

  // Initialize analytics with defaults immediately (non-blocking)
  const hasRudderStack = !!(process.env.NEXT_PUBLIC_RUDDERSTACK_KEY)
  const hasPostHog = !!(process.env.NEXT_PUBLIC_POSTHOG_KEY)

  const config = {
    ...(hasRudderStack && {
      rudderstackKey: process.env.NEXT_PUBLIC_RUDDERSTACK_KEY,
    }),
    ...(hasPostHog && {
      posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    }),
  }
  
  await Analytics?.initialise(config)

  const externalId = useUserDataStore.getState().externalId
  if(externalId) Analytics.identifyEvent(externalId)

  // Fetch remote config asynchronously in the background (non-blocking)
  const remoteConfigURL = process.env.NEXT_PUBLIC_REMOTE_CONFIG_URL
  if (remoteConfigURL) {
    fetch(remoteConfigURL)
      .then(res => res.json())
      .then(flags => {
        // Update analytics if needed based on remote config
        console.log("[v0] Remote config loaded:", flags)
      })
      .catch(err => {
        console.log("[v0] Remote config fetch failed:", err.message)
      })
  }
}
