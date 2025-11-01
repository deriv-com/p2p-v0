import { datadogRum } from "@datadog/browser-rum"

export const initDatadog = () => {
  if (typeof window === "undefined") {
    return
  }

  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN

  if (!applicationId || !clientToken) 
    return
  }

  if (datadogRum.getInternalContext()) {
    return
  }

  try {
    datadogRum.init({
      applicationId,
      clientToken,
      site: process.env.NEXT_PUBLIC_DATADOG_SITE || "datadoghq.com",
      service: process.env.NEXT_PUBLIC_DATADOG_SERVICE || "p2p-v2",
      env: process.env.NEXT_PUBLIC_DATADOG_ENV || process.env.NEXT_PUBLIC_BRANCH || "development",
      version: "1.0.0",
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20
    })

    datadogRum.startSessionReplayRecording()

    console.log("[Datadog RUM] Successfully initialized")
  } catch (error) {
    console.error("[Datadog RUM] Initialization failed:", error)
  }
}
