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
    datadogRum?.init({
      applicationId,
      clientToken,
      site: "datadoghq.com",
      service: process.env.NEXT_PUBLIC_DATADOG_SERVICE,
      env: process.env.NEXT_PUBLIC_DATADOG_ENV,
      version: process.env.NEXT_PUBLIC_DATADOG_VERSION,
      sessionSampleRate: 10,
      sessionReplaySampleRate: process.env.NEXT_PUBLIC_DATADOG_SESSION_REPLAY_SAMPLE_RATE ?? 1,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: "mask-user-input",
    })
  } catch (error) {
    console.error("Datadog RUM: Initialization failed:", error)
  }
}
