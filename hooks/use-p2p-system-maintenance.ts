"use client"

import { isP2PMaintenanceActive } from "@/lib/p2p-maintenance-env"
import { useP2PMaintenanceStore } from "@/stores/p2p-maintenance-store"

export function useP2PSystemMaintenance(): { isActive: boolean } {
  const isApiMaintenanceActive = useP2PMaintenanceStore((state) => state.isApiMaintenanceActive)

  return { isActive: isP2PMaintenanceActive() || isApiMaintenanceActive }
}

export function useP2PQueriesBlocked(): boolean {
  const isApiMaintenanceActive = useP2PMaintenanceStore((state) => state.isApiMaintenanceActive)

  return isP2PMaintenanceActive() || isApiMaintenanceActive
}
