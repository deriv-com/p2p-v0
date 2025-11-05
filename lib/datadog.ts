import { datadogRum } from "@datadog/browser-rum"

export const initDatadog = () => {
  if (typeof window === "undefined") {
    return
  }

  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN

  if (!applicationId || !clientToken) {
    console.warn("Datadog RUM: Missing applicationId or clientToken")
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

    console.log("Datadog RUM: Initialized successfully")
  } catch (error) {
    console.error("Datadog RUM: Initialization failed:", error)
  }
}
