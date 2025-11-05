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
      service: process.env.NEXT_PUBLIC_DATADOG_SERVICE || "p2p-v2",
      env: process.env.NEXT_PUBLIC_DATADOG_ENV || "development",
      version: process.env.NEXT_PUBLIC_DATADOG_VERSION || "1.0.0",
      sessionSampleRate: 100, // Increased to 100% for testing
      sessionReplaySampleRate: 100, // Increased to 100% for testing
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input",
    }) 
    datadogRum.startSessionReplayRecording()
  } catch (error) {
    console.error("Datadog: Initialization failed:", error)
  }
}
