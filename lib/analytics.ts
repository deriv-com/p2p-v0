"use client"

import { Analytics } from "@deriv-com/analytics"

export const initializeAnalytics = () => {
  if (typeof window === "undefined") {
    return
  }

  const { rudderstackKey } = analyticsConfig

  const hasRudderStack = !!(process.env.RUDDERSTACK_KEY && flags.tracking_rudderstack);
    const hasPostHog = !!(process.env.POSTHOG_KEY && flags.tracking_posthog);

    // RudderStack key is required by the Analytics package
    if (hasRudderStack) {
        const config: {
            rudderstackKey: string;
            posthogKey?: string;
            posthogHost?: string;
        } = {
            rudderstackKey: process.env.RUDDERSTACK_KEY!,
        };

        if (hasPostHog) {
            config.posthogKey = process.env.POSTHOG_KEY;
            config.posthogHost = process.env.POSTHOG_HOST;
        }

        await Analytics?.initialise(config);
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
