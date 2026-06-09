import { create } from "zustand"

interface P2PMaintenanceState {
  isApiMaintenanceActive: boolean
  remoteConfigEnabled: boolean
  setApiMaintenanceActive: (active: boolean) => void
  setRemoteConfigEnabled: (enabled: boolean) => void
  clearMaintenance: () => void
}

export const useP2PMaintenanceStore = create<P2PMaintenanceState>((set) => ({
  isApiMaintenanceActive: false,
  remoteConfigEnabled: false,
  setApiMaintenanceActive: (active) => set({ isApiMaintenanceActive: active }),
  setRemoteConfigEnabled: (enabled) => set({ remoteConfigEnabled: enabled }),
  clearMaintenance: () => set({ isApiMaintenanceActive: false, remoteConfigEnabled: false }),
}))

export function isP2PMaintenanceEnvEnabled(): boolean {
  return process.env.NEXT_PUBLIC_P2P_SYSTEM_MAINTENANCE === "1"
}

export function selectIsP2PSystemMaintenanceActive(state: P2PMaintenanceState): boolean {
  return isP2PMaintenanceEnvEnabled() || state.remoteConfigEnabled || state.isApiMaintenanceActive
}
