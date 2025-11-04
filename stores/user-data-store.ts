import { create } from "zustand"
import type { OnboardingStatusResponse } from "@/services/api/api-auth"

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
  clientId: string | null
  residenceCountry: string | null
  brandClientId: string | null
  brand: string | null
  verificationStatus: VerificationStatus | null
  onboardingStatus: OnboardingStatusResponse | null
  socketToken: string | null
  setUserData: (data: UserData) => void
  setUserId: (id: string) => void
  setClientId: (id: string) => void
  setResidenceCountry: (country: string) => void
  setBrandClientId: (id: string) => void
  setBrand: (brand: string) => void
  updateUserData: (data: Partial<UserData>) => void
  setVerificationStatus: (status: VerificationStatus) => void
  setOnboardingStatus: (status: OnboardingStatusResponse) => void
  setSocketToken: (token: string | null) => void
  clearUserData: () => void
}

const initialState = {
  userData: null,
  userId: null,
  clientId: null,
  residenceCountry: null,
  brandClientId: null,
  brand: null,
  verificationStatus: null,
  onboardingStatus: null,
  socketToken: null,
}

const getCachedSignup = (): string | null => {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem("user_signup")
  } catch {
    return null
  }
}

const getCachedUserId = (): string | null => {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem("user_id")
  } catch {
    return null
  }
}

const cacheUserId = (userId: string | null | undefined) => {
  if (typeof window === "undefined") return
  try {
    if (userId) {
      localStorage.setItem("user_id", userId)
    } else {
      localStorage.removeItem("user_id")
    }
  } catch {
    // Ignore localStorage errors
  }
}

const cacheSignup = (signup: string | undefined) => {
  if (typeof window === "undefined") return
  try {
    if (signup) {
      localStorage.setItem("user_signup", signup)
    } else {
      localStorage.removeItem("user_signup")
    }
  } catch {
    // Ignore localStorage errors
  }
}

export const useUserDataStore = create<UserDataState>((set) => ({
  ...initialState,

  setUserData: (data) => {
    cacheSignup(data.signup)
    set({ userData: data })
  },

  setUserId: (id) => {
    cacheUserId(id)
    set({ userId: id })
  },

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

  clearUserData: () => {
    cacheSignup(undefined)
    cacheUserId(undefined)
    set(initialState)
  },
}))

export { getCachedSignup, getCachedUserId }
