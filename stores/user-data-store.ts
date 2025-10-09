import { create } from "zustand"

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
  setUserData: (data: UserData) => void
  setUserId: (id: string) => void
  setClientId: (id: string) => void
  setResidenceCountry: (country: string) => void
  setBrandClientId: (id: string) => void
  setBrand: (brand: string) => void
  updateUserData: (data: Partial<UserData>) => void
  setVerificationStatus: (status: VerificationStatus) => void
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
}

export const useUserDataStore = create<UserDataState>((set) => ({
  ...initialState,

  setUserData: (data) => set({ userData: data }),

  setUserId: (id) => set({ userId: id }),

  setClientId: (id) => set({ clientId: id }),

  setResidenceCountry: (country) => set({ residenceCountry: country }),

  setBrandClientId: (id) => set({ brandClientId: id }),

  setBrand: (brand) => set({ brand }),

  updateUserData: (data) =>
    set((state) => ({
      userData: state.userData ? { ...state.userData, ...data } : data,
    })),

  setVerificationStatus: (status) => set({ verificationStatus: status }),

  clearUserData: () => set(initialState),
}))
