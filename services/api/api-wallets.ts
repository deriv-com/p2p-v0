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

export async function getCurrencies(): Promise<any> {
  try {
    const url = `${API.coreUrl}${API.endpoints.configCurrencies}`
    const headers = AUTH.getAuthHeader()

    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.log("Error fetching currencies:", error)
    return null
  }
}
