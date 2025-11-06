import { datadogRum } from "@datadog/browser-rum"

export const initDatadog = () => {
  if (typeof window === "undefined") {
    return
  }
  
  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN

  if (!applicationId || !clientToken) {
    console.log("[v0] Datadog: no application id or client token")
    return
  }

  if (datadogRum.getInternalContext()) {
    console.log("[v0] Datadog: content existing")
    return
  }

  try {
    datadogRum.init({
      applicationId,
      clientToken,
      site: "datadoghq.com",
      service: process.env.NEXT_PUBLIC_DATADOG_SERVICE,
      env: process.env.NEXT_PUBLIC_DATADOG_ENV,
      version: process.env.NEXT_PUBLIC_DATADOG_VERSION,
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
