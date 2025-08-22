import { AUTH } from "@/lib/local-variables"

export async function fetchTransactions() {
  return fetch(
    "https://staging-api.champion.trade/v1/wallets/transactions?wallet_id=7c9d042b-bbf4-4ba8-89a8-ed41fabb82b2",
    {
      method: "GET",
      credentials: "include",
      headers: {
        ...AUTH.getAuthHeader(),
      },
    },
  )
    .then((res) => res.json())
    .then((data) => console.log("✅ Transactions:", data))
    .catch((err) => console.error("❌ Error:", err))
}
