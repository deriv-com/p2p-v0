import { datadogRum } from "@datadog/browser-rum"

export const initDatadog = async () => {
  if (typeof window === "undefined") {
    return
  }

  if (datadogRum.getInternalContext()) {
    return
  }

  try {
    // Dynamically import the server action to fetch config
    const { getDatadogConfig } = await import("@/lib/datadog-config")
    const config = await getDatadogConfig()

    if (!config.applicationId || !config.clientToken) {
      return
    }

    datadogRum.init({
      applicationId: config.applicationId,
      clientToken: config.clientToken,
      site: "datadoghq.com",
      service: config.service,
      env: config.env,
      version: config.version,
      sessionSampleRate: Number(config.sessionSampleRate),
      sessionReplaySampleRate: Number(config.sessionReplaySampleRate),
    })
  } catch (error) {
    console.error("[Datadog RUM] Initialization failed:", error)
  }
}
