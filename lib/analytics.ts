"use client"

import { Analytics } from "@deriv-com/analytics"
import { useUserDataStore } from "@/stores/user-data-store"

export const initializeAnalytics = async () => {
  if (typeof window === "undefined") {
    return
  }

  const remoteConfigURL = process.env.NEXT_PUBLIC_REMOTE_CONFIG_URL
  let flags = {
    tracking_rudderstack: true,
    tracking_posthog: true
  }

  if (remoteConfigURL) {
    flags = await fetch(remoteConfigURL)
        .then(res => res.json())
        .catch(() => {
          return {
            tracking_rudderstack: true,
            tracking_posthog: true
          }
        })
  }

  const hasRudderStack = !!(process.env.NEXT_PUBLIC_RUDDERSTACK_KEY && flags.tracking_rudderstack)
  const hasPostHog = !!(process.env.NEXT_PUBLIC_POSTHOG_KEY && flags.tracking_posthog)

  let posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST
  if (hasPostHog && window.location.origin) {
    if (window.location.origin.includes('deriv.me')) {
      posthogHost = process.env.NEXT_PUBLIC_POSTHOG_ME_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST
    } else if (window.location.origin.includes('deriv.be')) {
      posthogHost = process.env.NEXT_PUBLIC_POSTHOG_BE_HOST || process.env.NEXT_PUBLIC_POSTHOG_HOST
    }
  }

  const config = {
    ...(hasRudderStack && {
      rudderstackKey: process.env.NEXT_PUBLIC_RUDDERSTACK_KEY,
    }),
    ...(hasPostHog && {
      posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      posthogHost,
    }),
  }
  
  await Analytics?.initialise(config)

  const externalId = useUserDataStore.getState().externalId
  if(externalId) Analytics.identifyEvent(externalId)
}
