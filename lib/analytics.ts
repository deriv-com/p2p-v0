"use client"

import { Analytics } from "@deriv-com/analytics"

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

  if (hasRudderStack) {
      const config: {
          rudderstackKey: string;
          posthogKey?: string;
          posthogHost?: string;
      } = {
          rudderstackKey: process.env.NEXT_PUBLIC_RUDDERSTACK_KEY!,
      }

      if (hasPostHog) {
          config.posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
          config.posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST
      }

      await Analytics?.initialise(config)
  }
}
