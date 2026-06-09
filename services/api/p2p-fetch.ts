import { extractP2PErrorCode, handleP2PApiStatusCode } from "@/lib/api/p2p-api-status-handler"

/**
 * Drop-in fetch wrapper for P2P backend calls. Inspects JSON bodies for
 * embedded status codes (including `P2P_Disabled`) on both success and error
 * responses — mirrors the mobile Dio interceptor.
 */
export async function p2pFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init)

  try {
    const cloned = response.clone()
    const text = await cloned.text()
    if (text) {
      const body = JSON.parse(text) as unknown
      handleP2PApiStatusCode(extractP2PErrorCode(body))
    }
  } catch {
    // Non-JSON or empty bodies are ignored.
  }

  return response
}
