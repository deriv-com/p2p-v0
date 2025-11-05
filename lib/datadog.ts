import { datadogRum } from "@datadog/browser-rum"

export const initDatadog = () => {
  console.log("[v0] Datadog: Initialization starting...")

  if (typeof window === "undefined") {
    console.log("[v0] Datadog: Skipping - not in browser environment")
    return
  }

  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN

  console.log("[v0] Datadog: Environment variables check", {
    hasApplicationId: !!applicationId,
    hasClientToken: !!clientToken,
    applicationId: applicationId ? `${applicationId.substring(0, 8)}...` : "missing",
  })

  if (!applicationId || !clientToken) {
    console.warn("[v0] Datadog: Missing required environment variables")
    return
  }

  if (datadogRum.getInternalContext()) {
    console.log("[v0] Datadog: Already initialized, skipping")
    return
  }

  try {
    console.log("[v0] Datadog: Calling datadogRum.init()...")

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

    console.log("[v0] Datadog: Init successful, starting session replay...")

    datadogRum.startSessionReplayRecording()

    console.log("[v0] Datadog: Fully initialized and recording")
  } catch (error) {
    console.error("[v0] Datadog: Initialization failed:", error)
  }
}
