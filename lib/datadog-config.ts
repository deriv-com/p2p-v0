"use server"

// This keeps sensitive env vars on the server side only
export async function getDatadogConfig() {
  return {
    applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID,
    clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    service: process.env.NEXT_PUBLIC_DATADOG_SERVICE,
    env: process.env.NEXT_PUBLIC_DATADOG_ENV,
    version: process.env.NEXT_PUBLIC_DATADOG_VERSION,
    sessionSampleRate: process.env.NEXT_PUBLIC_DATADOG_SESSION_SAMPLE_RATE ?? "10",
    sessionReplaySampleRate: process.env.NEXT_PUBLIC_DATADOG_SESSION_REPLAY_SAMPLE_RATE ?? "1",
  }
}
