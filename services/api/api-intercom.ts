import { API } from "@/lib/local-variables"

const getAuthHeader = () => ({
  "Content-Type": "application/json",
})

interface IntercomTokenResponse {
  data: {
    token: string
    attributes?: {
      id: string
    }
  }
}

/**
 * Get Intercom token for user authentication
 */
export async function getIntercomToken(platform: string = "web"): Promise<{ token: string; id?: string } | null> {
  try {
    const response = await fetch(
      `${API.coreUrl}/service/token/helpcentre`,
      {
        method: "GET",
        credentials: "include",
        headers: getAuthHeader(),
      }
    )

    if (!response.ok) {
      console.error("Failed to fetch Intercom token:", response.statusText)
      return null
    }

    const result: IntercomTokenResponse = await response.json()

    return {
      token: result.data.token,
      id: result.data.attributes?.id,
    }
  } catch (error) {
    console.error("Error fetching Intercom token:", error)
    return null
  }
}
