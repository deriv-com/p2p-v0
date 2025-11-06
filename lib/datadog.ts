import { datadogRum } from "@datadog/browser-rum"

export const initDatadog = () => {
  if (typeof window === "undefined") {
    return
  }
  
  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID || "5c8975a3-ec86-4a64-8a3a-e6888fdde082"
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN || "pub08554ab30284600af157441bfb0fa923"

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
      service: process.env.NEXT_PUBLIC_DATADOG_SERVICE,
      env: process.env.NEXT_PUBLIC_DATADOG_ENV,
      version: process.env.NEXT_PUBLIC_DATADOG_VERSION || "1.0.0",
      sessionSampleRate: 100,
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
