import { datadogRum } from "@datadog/browser-rum"

export const initDatadog = () => {
  console.log("[v0] Datadog: Starting initialization check")

  if (typeof window === "undefined") {
    console.log("[v0] Datadog: Skipping - running on server side")
    return
  }

  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
  const service = process.env.NEXT_PUBLIC_DATADOG_SERVICE
  const env = process.env.NEXT_PUBLIC_DATADOG_ENV
  const version = process.env.NEXT_PUBLIC_DATADOG_VERSION

  console.log("[v0] Datadog: Environment variables check", {
    hasApplicationId: !!applicationId,
    hasClientToken: !!clientToken,
    service,
    env,
    version,
  })

  if (!applicationId || !clientToken) {
    console.warn(
      "[v0] Datadog: Missing required environment variables (NEXT_PUBLIC_DATADOG_APPLICATION_ID or NEXT_PUBLIC_DATADOG_CLIENT_TOKEN)",
    )
    return
  }

  if (datadogRum.getInternalContext()) {
    console.log("[v0] Datadog: Already initialized, skipping")
    return
  }

  try {
    console.log("[v0] Datadog: Attempting to initialize with config", {
      applicationId: applicationId.substring(0, 8) + "...",
      site: "datadoghq.com",
      service,
      env,
      version,
    })

    datadogRum.init({
      applicationId,
      clientToken,
      site: "datadoghq.com",
      service: service || "p2p-v2",
      env: env || "development",
      version: version || "1.0.0",
      sessionSampleRate: Number(process.env.NEXT_PUBLIC_DATADOG_SESSION_SAMPLE_RATE) || 100,
      sessionReplaySampleRate: Number(process.env.NEXT_PUBLIC_DATADOG_SESSION_REPLAY_SAMPLE_RATE) || 20,
      trackUserInteractions: true,
      //trackResources: true,
      trackLongTasks: true,
     // defaultPrivacyLevel: "mask-user-input",
    })

   // datadogRum.startSessionReplayRecording()

    console.log("[v0] Datadog: Successfully initialized and session tracking started")
  } catch (error) {
    console.error("[v0] Datadog: Initialization failed with error:", error)
  }
}
