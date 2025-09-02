import { AUTH, API, WALLETS } from "@/lib/local-variables"

export async function fetchTransactions() {
  const url = `${API.coreUrl}${API.endpoints.walletsTransactions}?wallet_id=${WALLETS.defaultParams.wallet_id}`

  return fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      ...AUTH.getAuthHeader(),
    },
  })
    .then((res) => res.json())
    .then((data) => {
      return data
    })
    .catch((err) => {
      console.error("❌ Error:", err)
      throw err
    })
}

export async function fetchWalletsList() {
  const url = `${API.coreUrl}/wallets`

  return fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      ...AUTH.getAuthHeader(),
    },
  })
    .then((res) => res.json())
    .then((data) => {
      return data
    })
    .catch((err) => {
      console.error("❌ Error:", err)
      throw err
    })
}

export async function getCurrencies(): Promise<string[]> {
  try {
    const url = `${API.baseUrl}${API.endpoints.settings}`
    const headers = AUTH.getAuthHeader()

    const response = await fetch(url, {
      headers,
      credentials: "include",
    })

    await response.text()
  } catch (error) {
    console.log("Error fetching currencies:", error)
  }

  // TODO: Returning a default array for now until the API response structure is finalised and we have required data
  return ["USD", "BTC", "ETH", "LTC", "BRL", "VND"]
}
