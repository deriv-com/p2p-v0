"use client"

import { Analytics } from "@deriv-com/analytics"

export const initializeAnalytics = () => {
  if (typeof window === "undefined") {
    return
  }

  const hasRudderStack = !!(process.env.RUDDERSTACK_KEY && flags.tracking_rudderstack);
  const hasPostHog = !!(process.env.POSTHOG_KEY && flags.tracking_posthog);

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
}
