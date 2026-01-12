"use client"

import { Analytics } from "@deriv-com/analytics"
import { analyticsConfig } from "./analytics-config"

/**
 * Initialize @deriv-com/analytics with Rudderstack and Growthbook
 * This should be called once on app initialization
 */
export const initializeAnalytics = () => {
  if (typeof window === "undefined") {
    return
  }

  const { rudderstackKey, growthbookKey, growthbookDecryptionKey, isProduction } = analyticsConfig

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

    // Set initial attributes
    Analytics?.setAttributes({
      user_language: navigator.language || "en",
      device_language: navigator.language,
      device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop",
    })

    // Track initial page view
    Analytics?.pageView()

    if (!isProduction) {
      console.log("[Analytics] Initialized successfully")
    }
  } catch (error) {
    console.error("[Analytics] Failed to initialize:", error)
  }
}

/**
 * Utility to get the analytics instance
 */
export const getAnalyticsInstance = () => {
  return Analytics
}

/**
 * Make analytics ID available globally for debugging
 */
if (typeof window !== "undefined") {
  ;(window as any).getMyId = () => {
    const id = Analytics?.getId()
    console.log("[Analytics] User ID:", id)
    return id
  }
}
