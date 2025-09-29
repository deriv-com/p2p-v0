import { AUTH, API, WALLETS, USER } from "@/lib/local-variables"

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
    const url = `${API.coreUrl}/core/business/config/currencies`
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

export async function walletTransfer(params: {
  amount: string
  currency: string
  destination_wallet_id: string
  request_id: string
  source_wallet_id: string
}): Promise<any> {
  try {
    const url = `${API.coreUrl}/wallets/transfers`
    const headers = AUTH.getAuthHeader()

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(params),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.log("Error performing wallet transfer:", error)
    return null
  }
}

export async function fetchBalance(selectedCurrency: string): Promise<number> {
  try {
    const userId = USER.id
    const url = `${API.baseUrl}/users/${userId}`

    const response = await fetch(url, {
      credentials: "include",
      headers: {
        ...AUTH.getAuthHeader(),
        accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`)
    }

    const responseData = await response.json()

    if (responseData && responseData.data) {
      const data = responseData.data
      const balance = data.balances?.find((b: any) => b.currency === selectedCurrency)?.amount
      return balance ? Number.parseFloat(balance) : 0
    }

    return 0
  } catch (error) {
    console.error("Error fetching user balance:", error)
    throw error
  }
}
