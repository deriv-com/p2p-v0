// Datadog RUM client tokens are safe for client-side use, but v0 flags them as sensitive
// Re-enable in production by uncommenting the code below

// import { datadogRum } from "@datadog/browser-rum"

export const initDatadog = () => {
  // Datadog initialization disabled for v0 preview environment
  // Uncomment the code below to re-enable in production
  /*
  if (typeof window === "undefined") {
    return
  }

  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN
  const env = process.env.NEXT_PUBLIC_DATADOG_ENV
  const service = process.env.NEXT_PUBLIC_DATADOG_SERVICE
  const version = process.env.NEXT_PUBLIC_DATADOG_VERSION

  if (!applicationId || !clientToken) {
    return
  }

  if (datadogRum.getInternalContext()) {
    return
  }

  try {
    const sessionSampleRate = process.env.NEXT_PUBLIC_DATADOG_SESSION_SAMPLE_RATE
      ? Number(process.env.NEXT_PUBLIC_DATADOG_SESSION_SAMPLE_RATE)
      : 100
    const sessionReplaySampleRate = process.env.NEXT_PUBLIC_DATADOG_SESSION_REPLAY_SAMPLE_RATE
      ? Number(process.env.NEXT_PUBLIC_DATADOG_SESSION_REPLAY_SAMPLE_RATE)
      : 100

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
    })
  } catch (error) {
    console.error("Datadog: Initialization failed", {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
  }
  */
}
