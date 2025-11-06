import { datadogRum } from "@datadog/browser-rum"

export const initDatadog = () => {
  if (typeof window === "undefined") {
    return
  }
  
  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN

  if (!applicationId || !clientToken) {
    return
  }

  if (datadogRum.getInternalContext()) {
    return
  }

  try {
    datadogRum.init({
      applicationId,
      clientToken,
      site: "datadoghq.com",
      service: process.env.NEXT_PUBLIC_DATADOG_SERVICE || "dp2p.deriv.com",
      env: process.env.NEXT_PUBLIC_DATADOG_ENV || "staging",
      version: process.env.NEXT_PUBLIC_DATADOG_VERSION || "1.0.0",
      sessionSampleRate: 10,
      sessionReplaySampleRate: 100,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input",
    })
    console.log("[v0] Datadog: Init successful, starting session replay...")
  } catch (error) {
    console.error("Datadog: Initialization failed:", error)
  }
}
