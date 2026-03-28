"use client"

import { Analytics, cacheTrackEvents } from "@deriv-com/analytics"
import { useLanguageStore } from "@/stores/language-store"
import { useUserDataStore } from "@/stores/user-data-store"

export const initializeAnalytics = () => {
  if (typeof window === "undefined") {
    return
  }

  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";
  const POSTHOGKEY = isProduction ? process.env.NEXT_PUBLIC_POSTHOG_PRODUCTION_KEY ?? "" : process.env.NEXT_PUBLIC_POSTHOG_STAGING_KEY ?? "";

  const RUDDERSTACKKEY = isProduction
    ? process.env.NEXT_PUBLIC_RUDDERSTACK_PRODUCTION_KEY ?? ""
    : process.env.NEXT_PUBLIC_RUDDERSTACK_STAGING_KEY ?? "";

  const { clientId, residenceCountry } = useUserDataStore.getState()
  const { locale } = useLanguageStore.getState()

  Analytics.initialise({
    rudderstackKey: RUDDERSTACKKEY,
    posthogOptions: {
      apiKey: POSTHOGKEY,
      config: {
        autocapture: false
      }
    },
  }).then(() => {
    cacheTrackEvents.pageView();
    if (clientId) {
      Analytics.identifyEvent(clientId, {
        language: locale,
        country_of_residence: residenceCountry,
      })
    }
  }).catch((error: unknown) => {
    console.error(error)
  });
}

export const backfillAnalyticsProperties = () => {
  if (typeof window === "undefined") {
    return
  }

  const { externalId, userData, residenceCountry } = useUserDataStore.getState()
  if (Analytics && externalId && residenceCountry) {
    Analytics.backfillPersonProperties({
      user_id: externalId,
      email: userData?.email,
      country_of_residence: residenceCountry,
    })
  }
}

export const resetAnalytics = () => {
  if (typeof window === "undefined") {
    return
  }

  if (Analytics) {
    Analytics.reset();
  }
}
