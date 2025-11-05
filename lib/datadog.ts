import { datadogRum } from "@datadog/browser-rum"

export const initDatadog = () => {
  console.log("[v0] initDatadog called")

  if (typeof window === "undefined") {
    console.log("[v0] Datadog: Running on server, skipping initialization")
    return
  }

  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN

  console.log("[v0] Datadog env vars:", {
    applicationId: applicationId ? "present" : "missing",
    clientToken: clientToken ? "present" : "missing",
  })

  if (!applicationId || !clientToken) {
    console.warn("[v0] Datadog RUM: Missing applicationId or clientToken")
    return
  }

  if (datadogRum.getInternalContext()) {
    console.log("[v0] Datadog: Already initialized")
    return
  }

  try {
    const sessionSampleRate = process.env.NEXT_PUBLIC_DATADOG_SESSION_SAMPLE_RATE
      ? Number(process.env.NEXT_PUBLIC_DATADOG_SESSION_SAMPLE_RATE)
      : 100

    const sessionReplaySampleRate = process.env.NEXT_PUBLIC_DATADOG_SESSION_REPLAY_SAMPLE_RATE
      ? Number(process.env.NEXT_PUBLIC_DATADOG_SESSION_REPLAY_SAMPLE_RATE)
      : 100

    console.log("[v0] Datadog: Initializing with config:", {
      applicationId,
      sessionSampleRate,
      sessionReplaySampleRate,
    })

    datadogRum.init({
      applicationId,
      clientToken,
      site: "datadoghq.com",
      service: process.env.NEXT_PUBLIC_DATADOG_SERVICE || "p2p-v2",
      env: process.env.NEXT_PUBLIC_DATADOG_ENV || "production",
      version: process.env.NEXT_PUBLIC_DATADOG_VERSION || "1.0.0",
      sessionSampleRate,
      sessionReplaySampleRate,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input",
    })

    datadogRum.startSessionReplayRecording()

    console.log("[v0] Datadog RUM: Initialized successfully")
  } catch (error) {
    console.error("[v0] Datadog RUM: Initialization failed:", error)
  }
}
