import { create } from "zustand"

interface WalletState {
  isWalletAccount: boolean
  setIsWalletAccount: (value: boolean) => void
  clearWalletAccount: () => void
}

const getStoredWalletStatus = (): boolean => {
  if (typeof window === "undefined") return false
  try {
    const stored = localStorage.getItem("is_wallet_account")
    return stored === "true"
  } catch {
    return false
  }
}

const storeWalletStatus = (value: boolean) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("is_wallet_account", value.toString())
  } catch {
    // Ignore localStorage errors
  }
}

const clearStoredWalletStatus = () => {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem("is_wallet_account")
  } catch {
    // Ignore localStorage errors
  }
}

export const useWalletStore = create<WalletState>((set) => ({
  isWalletAccount: getStoredWalletStatus(),

  setIsWalletAccount: (value) => {
    storeWalletStatus(value)
    set({ isWalletAccount: value })
  },

  clearWalletAccount: () => {
    clearStoredWalletStatus()
    set({ isWalletAccount: false })
  },
}))
