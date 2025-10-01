import { useUserDataStore } from "@/stores/user-data-store"

const getAuthHeader = () => ({
  "Content-Type": "application/json",
  "X-Branch": "master",
  "X-Data-Source": "live",
})

export async function fetchTransactions() {
  const userData = useUserDataStore.getState().userData
  console.log("user data->"+userData);
  const walletId = userData?.balances?.find((b) => b.currency === "USD")?.wallet_id

  const url = `${process.env.NEXT_PUBLIC_CORE_URL}/wallets/transactions?wallet_id=${walletId}`

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
  const url = `${process.env.NEXT_PUBLIC_CORE_URL}/wallets`

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
    const url = `${process.env.NEXT_PUBLIC_CORE_URL}/core/business/config/currencies`
    const headers = getAuthHeader()

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
    const url = `${process.env.NEXT_PUBLIC_CORE_URL}/wallets/transfers`
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
    console.log("Error performing wallet transfer:", error)
    return null
  }
}

export async function fetchBalance(selectedCurrency: string): Promise<number> {
  try {
    const userId = useUserDataStore.getState().userId
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/users/${userId}`

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
