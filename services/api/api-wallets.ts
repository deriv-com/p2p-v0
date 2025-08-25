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
