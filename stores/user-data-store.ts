import { create } from "zustand"

export interface UserData {
  adverts_are_listed?: boolean
  email?: string
  first_name?: string
  last_name?: string
  nickname?: string
  signup?: string
  wallet_id?: string
}

interface UserDataState {
  userData: UserData | null
  userId: string | null
  clientId: string | null
  residenceCountry: string | null
  setUserData: (data: UserData) => void
  setUserId: (id: string) => void
  setClientId: (id: string) => void
  setResidenceCountry: (country: string) => void
  updateUserData: (data: Partial<UserData>) => void
  clearUserData: () => void
}

const initialState = {
  userData: null,
  userId: null,
  clientId: null,
  residenceCountry: null,
}

export const useUserDataStore = create<UserDataState>((set) => ({
  ...initialState,

  setUserData: (data) => set({ userData: data }),

  setUserId: (id) => set({ userId: id }),

  setClientId: (id) => set({ clientId: id }),

  setResidenceCountry: (country) => set({ residenceCountry: country }),

  updateUserData: (data) =>
    set((state) => ({
      userData: state.userData ? { ...state.userData, ...data } : data,
    })),

  clearUserData: () => set(initialState),
}))
