import { datadogRum } from "@datadog/browser-rum"

export const initDatadog = () => {
  console.log("[v0] Datadog initialization starting...")

  if (typeof window === "undefined") {
    console.log("[v0] Datadog: Skipping - not in browser environment")
    return
  }

  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN

  if (!applicationId || !clientToken) {
    console.warn("[v0] Datadog: Missing credentials", {
      hasApplicationId: !!applicationId,
      hasClientToken: !!clientToken,
    })
    return
  }

  if (datadogRum.getInternalContext()) {
    console.log("[v0] Datadog: Already initialized")
    return
  }

  try {
    console.log("[v0] Datadog: Initializing with config", {
      applicationId,
      service: process.env.NEXT_PUBLIC_DATADOG_SERVICE,
      env: process.env.NEXT_PUBLIC_DATADOG_ENV,
      version: process.env.NEXT_PUBLIC_DATADOG_VERSION,
    })

    datadogRum.init({
      applicationId,
      clientToken,
      site: "datadoghq.com",
      service: process.env.NEXT_PUBLIC_DATADOG_SERVICE,
      env: process.env.NEXT_PUBLIC_DATADOG_ENV,
      version: process.env.NEXT_PUBLIC_DATADOG_VERSION,
      sessionSampleRate: process.env.NEXT_PUBLIC_DATADOG_SESSION_SAMPLE_RATE ?? 10,
      sessionReplaySampleRate: process.env.NEXT_PUBLIC_DATADOG_SESSION_REPLAY_SAMPLE_RATE ?? 1,
    })

    console.log("[v0] Datadog: Successfully initialized")
  } catch (error) {
    console.error("[v0] Datadog RUM: Initialization failed:", error)
    console.error("[v0] Datadog: Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
}
