"use client"

import { Analytics } from "@deriv-com/analytics"

export const initializeAnalytics = () => {
  if (typeof window === "undefined") {
    return
  }

  const { rudderstackKey } = analyticsConfig

  if (!rudderstackKey) {
    console.warn("[Analytics] Rudderstack key is not configured. Analytics tracking will be disabled.")
    return
  }

  try {
    Analytics?.initialise({
      rudderstackKey,
      growthbookKey,
      growthbookDecryptionKey,
      growthbookOptions: {
        antiFlicker: false,
        navigateDelay: 0,
        antiFlickerTimeout: 3500,
        subscribeToChanges: true,
        enableDevMode: !isProduction,
        trackingCallback: (experiment, result) => {
          if (!isProduction) {
            console.log("[Analytics] Experiment tracked:", experiment, result)
          }
        },
        navigate: (url) => {
          window.location.href = url
        },
      },
    })

    Analytics?.setAttributes({
      user_language: navigator.language || "en",
      device_language: navigator.language,
      device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop",
    })

    if (!isProduction) {
      console.log("[Analytics] Initialized successfully")
    }
  } catch (error) {
    console.error("Failed to initialize:", error)
  }
}
