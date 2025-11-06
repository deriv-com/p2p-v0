import { datadogRum } from "@datadog/browser-rum"

export const initDatadog = () => {
  if (typeof window === "undefined") {
    return
  }

  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
  const env = process.env.NEXT_PUBLIC_DATADOG_ENV
  const service = process.env.NEXT_PUBLIC_DATADOG_SERVICE
  const version = process.env.NEXT_PUBLIC_DATADOG_VERSION

  console.log("[v0] Datadog: Initialization attempt", {
    hasApplicationId: !!applicationId,
    hasClientToken: !!clientToken,
    env,
    service,
    version,
  })

  if (!applicationId || !clientToken) {
    console.warn("[v0] Datadog: Missing required configuration (applicationId or clientToken)")
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

    console.log("[v0] Datadog: Initializing with config", {
      sessionSampleRate,
      sessionReplaySampleRate,
      env,
      service,
    })

    datadogRum.init({
      applicationId,
      clientToken,
      site: "datadoghq.com",
      service,
      env,
      version,
      sessionSampleRate,
      sessionReplaySampleRate,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input",
      allowedTracingUrls: [(url) => url.startsWith(window.location.origin)],
    })

    console.log("[v0] Datadog: Initialization successful")

    datadogRum.startSessionReplayRecording()
    console.log("[v0] Datadog: Session replay started")
  } catch (error) {
    console.error("[v0] Datadog: Initialization failed", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
