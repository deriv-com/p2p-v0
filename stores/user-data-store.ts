import { create } from "zustand"
import type { OnboardingStatusResponse } from "@/services/api/api-auth"
import { useUserDataStore } from "@/stores/user-data-store"

export interface UserData {
  adverts_are_listed?: boolean
  email?: string
  first_name?: string
  last_name?: string
  nickname?: string
  signup?: string
  wallet_id?: string
  temp_ban_until?: number | null
  is_online?: boolean
  balances?: Array<{ amount: string; currency: string }>
  status?: string
}

export interface VerificationStatus {
  email_verified: boolean
  phone_verified: boolean
  kyc_verified: boolean
  p2p_allowed: boolean
}

interface UserDataState {
  userData: UserData | null
  userId: string | null
  externalId: string | null
  clientId: string | null
  residenceCountry: string | null
  brandClientId: string | null
  brand: string | null
  verificationStatus: VerificationStatus | null
  onboardingStatus: OnboardingStatusResponse | null
  socketToken: string | null
  isWalletAccount: boolean
  setUserData: (data: UserData) => void
  setExternalId: (id: string) => void
  setUserId: (id: string) => void
  setClientId: (id: string) => void
  setResidenceCountry: (country: string) => void
  setBrandClientId: (id: string) => void
  setBrand: (brand: string) => void
  updateUserData: (data: Partial<UserData>) => void
  setVerificationStatus: (status: VerificationStatus) => void
  setOnboardingStatus: (status: OnboardingStatusResponse) => void
  setSocketToken: (token: string | null) => void
  setIsWalletAccount: (isWallet: boolean) => void
  clearUserData: () => void
}

const initialState = {
  userData: null,
  userId: null,
  clientId: null,
  externalId: null,
  residenceCountry: null,
  brandClientId: null,
  brand: null,
  verificationStatus: null,
  onboardingStatus: null,
  socketToken: null,
  isWalletAccount: typeof window !== "undefined" ? localStorage.getItem("is_wallet_account") === "true" : false,
}

const getCachedSignup = (): string | null => {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem("user_signup")
  } catch {
    return null
  }
}

const cacheSignup = (signup: string | undefined) => {
  if (typeof window === "undefined") return
  if (signup) {
    localStorage.setItem("user_signup", signup)
  } else {
    localStorage.removeItem("user_signup")
  }
}

const cacheWalletAccount = (isWallet: boolean) => {
  if (typeof window === "undefined") return
  localStorage.setItem("is_wallet_account", isWallet.toString())
}

export const useUserDataStore = create<UserDataState>((set) => ({
  ...initialState,

  setUserData: (data) => {
    cacheSignup(data.signup)
    set({ userData: data })
  },

  setExternalId: (id) => set({ externalId: id }),

  setUserId: (id) => set({ userId: id }),

  setClientId: (id) => set({ clientId: id }),

  setResidenceCountry: (country) => set({ residenceCountry: country }),

  setBrandClientId: (id) => set({ brandClientId: id }),

  setBrand: (brand) => set({ brand }),

  updateUserData: (data) =>
    set((state) => {
      const newUserData = state.userData ? { ...state.userData, ...data } : data
      cacheSignup(newUserData.signup)
      return { userData: newUserData }
    }),

  setVerificationStatus: (status) => set({ verificationStatus: status }),

  setOnboardingStatus: (status) => set({ onboardingStatus: status }),

  setSocketToken: (token) => set({ socketToken: token }),

  setIsWalletAccount: (isWallet) => {
    cacheWalletAccount(isWallet)
    set({ isWalletAccount: isWallet })
  },

  clearUserData: () => {
    cacheSignup(undefined)
    if (typeof window !== "undefined") {
      localStorage.removeItem("is_wallet_account")
    }
    set(initialState)
  },
}))

export { getCachedSignup }
