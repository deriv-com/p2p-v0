import { datadogRum } from "@datadog/browser-rum"

export const initDatadog = () => {
  if (typeof window === "undefined") {
    return
  }

  // NOTE: The warning about exposing this to the client is a false positive.
  // Datadog's clientToken is specifically designed to be used in browser code
  // and is NOT sensitive like an API key. It's safe and required to be public.
  // See: https://docs.datadoghq.com/real_user_monitoring/browser/#setup
  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN

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
  } catch (error) {
    console.error("Datadog: Initialization failed:", error)
  }
}
