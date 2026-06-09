import { extractP2PErrorCode, handleP2PApiStatusCode } from "@/lib/api/p2p-api-status-handler"

/**
 * Drop-in fetch wrapper for P2P backend calls. Inspects JSON bodies for
 * embedded status codes (including `P2P_Disabled`) on both success and error
 * responses — mirrors the mobile Dio interceptor.
 */
export async function p2pFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, init)

  const contentType = response.headers.get("content-type")
  if (!contentType?.includes("application/json")) {
    return response
  }

  try {
    const body = (await response.clone().json()) as unknown
    handleP2PApiStatusCode(extractP2PErrorCode(body))
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Empty or malformed JSON bodies are ignored.
      return response
    }
    console.warn("p2pFetch: unexpected error parsing response body", error)
  }

  return response
}
