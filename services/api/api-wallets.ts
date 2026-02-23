import { useUserDataStore } from "@/stores/user-data-store"
import { getCoreUrl } from "@/lib/get-core-url"

const getAuthHeader = () => ({
  "Content-Type": "application/json",
})

export async function fetchTransactions(selectedCurrencyCode?: string) {
  const userData = useUserDataStore.getState().userData

  const walletId = userData?.wallet_id

  let url = `${getCoreUrl()}/v1/wallets/transactions?wallet_id=${walletId}`
  if (selectedCurrencyCode) {
    url += `&transaction_currency=${selectedCurrencyCode}`
  }

  return fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      ...getAuthHeader(),
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
  const url = `${getCoreUrl()}/v1/wallets`

  return fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      ...getAuthHeader(),
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
    const url = `${getCoreUrl()}/v1/core/business/config/currencies`
    const headers = getAuthHeader()

    const response = await fetch(url, {
      method: "POST",
      headers,
      credentials: "include",
    })

    const data = await response.json()
    return data
  } catch (error) {
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
    const url = `${getCoreUrl()}/v1/wallets/transfers`
    const headers = getAuthHeader()

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
    return null
  }
}

export async function fetchBalance(selectedCurrency: string): Promise<number> {
  try {
    const userId = useUserDataStore.getState().userId

    if (!userId) {
      return 0
    }

    const url = `${getCoreUrl()}/p2p/v1/users/${userId}`

    const response = await fetch(url, {
      credentials: "include",
      headers: {
        ...getAuthHeader(),
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

export async function fetchUserBalances(): Promise<any> {
  try {
    const userId = useUserDataStore.getState().userId

    if (!userId) {
      return { balances: [] }
    }

    const url = `${getCoreUrl()}/p2p/v1/users/${userId}`

    const response = await fetch(url, {
      credentials: "include",
      headers: {
        ...getAuthHeader(),
        accept: "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`)
    }

    const responseData = await response.json()

    if (responseData?.data?.balances) {
      return { balances: responseData.data.balances }
    }

    return { balances: [] }
  } catch (error) {
    console.error("Error fetching user balances:", error)
    throw error
  }
}

export async function fetchExchangeRate(params: {
  source_currency: string
  destination_currency: string
}): Promise<any> {
  try {
    const url = `${getCoreUrl()}/v1/wallets/exchange-rate?source_currency=${params.source_currency}&destination_currency=${params.destination_currency}`
    const headers = getAuthHeader()

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching exchange rate:", error)
    return null
  }
}

export async function walletExchangeTransfer(params: {
  amount: string
  source_currency: string
  destination_wallet_id: string
  request_id: string
  source_wallet_id: string
  destination_currency: string
  rate_token: string
  exchange_rate: string
}): Promise<any> {
  try {
    const url = `${getCoreUrl()}/v1/wallets/transfers/exchange`
    const headers = getAuthHeader()

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
    console.error("Error in exchange transfer:", error)
    return null
  }
}

export async function fetchTransactionByReferenceId(referenceId: string): Promise<any> {
  try {
    const url = `${getCoreUrl()}/v1/wallets/transactions?reference_id=${referenceId}`
    const headers = getAuthHeader()

    const response = await fetch(url, {
      method: "GET",
      headers,
      credentials: "include",
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching transaction by reference ID:", error)
    return null
  }
}
