import { create } from "zustand"

interface WalletVisibilityState {
  isTransfersListVisible: boolean
  setIsTransfersListVisible: (visible: boolean) => void
}

export const useWalletVisibilityStore = create<WalletVisibilityState>((set) => ({
  isTransfersListVisible: false,
  setIsTransfersListVisible: (visible: boolean) => set({ isTransfersListVisible: visible }),
}))
