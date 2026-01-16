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
export async function getIntercomToken(): Promise<{ token: string; id?: string } | null> {
  console.log("getIntercomToken")
  try {
    const url = `${API.coreUrl}/service/token/helpcentre`
    console.log("fetching intercom token")
    
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeader(),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Failed to fetch Intercom token:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        url,
      })
      return null
    }

    const result: IntercomTokenResponse = await response.json()

    console.log("Got intercom token response: ", result);

    return {
      token: result.data.token,
      id: result.data.attributes?.id,
    }
  } catch (error) {
    console.error("Error fetching Intercom token:", error)
    return null
  }
}
