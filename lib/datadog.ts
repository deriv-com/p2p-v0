import { datadogRum } from "@datadog/browser-rum"

export const initDatadog = () => {
  if (typeof window === "undefined") {
    return
  }

  const applicationId = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID
  const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN

  if (!applicationId || !clientToken) {
    console.warn("[Datadog RUM] Missing required environment variables. Skipping initialization.")
    return
  }

  if (datadogRum.getInternalContext()) {
    return
  }

  try {
    datadogRum.init({
      applicationId,
      clientToken,
      site: process.env.NEXT_PUBLIC_DATADOG_SITE || "datadoghq.com",
      service: process.env.NEXT_PUBLIC_DATADOG_SERVICE || "p2p-v2",
      env: process.env.NEXT_PUBLIC_DATADOG_ENV || process.env.NEXT_PUBLIC_BRANCH || "development",
      version: "1.0.0",
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20
    })

    datadogRum.startSessionReplayRecording()

    console.log("[Datadog RUM] Successfully initialized")
  } catch (error) {
    console.error("[Datadog RUM] Initialization failed:", error)
  }
}

// Helper function to set user context
export const setDatadogUser = (userId: string, userEmail?: string, userName?: string) => {
  if (typeof window === "undefined") return

  try {
    datadogRum.setUser({
      id: userId,
      email: userEmail,
      name: userName,
    })
  } catch (error) {
    console.error("[Datadog RUM] Failed to set user:", error)
  }
}

// Helper function to add custom context
export const addDatadogContext = (key: string, value: any) => {
  if (typeof window === "undefined") return

  try {
    datadogRum.addRumGlobalContext(key, value)
  } catch (error) {
    console.error("[Datadog RUM] Failed to add context:", error)
  }
}

// Helper function to track custom actions
export const trackDatadogAction = (name: string, context?: Record<string, any>) => {
  if (typeof window === "undefined") return

  try {
    datadogRum.addAction(name, context)
  } catch (error) {
    console.error("[Datadog RUM] Failed to track action:", error)
  }
}

// Helper function to track custom errors
export const trackDatadogError = (error: Error, context?: Record<string, any>) => {
  if (typeof window === "undefined") return

  try {
    datadogRum.addError(error, context)
  } catch (error) {
    console.error("[Datadog RUM] Failed to track error:", error)
  }
}
