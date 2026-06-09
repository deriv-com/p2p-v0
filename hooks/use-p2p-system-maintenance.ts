"use client"

import { isP2PMaintenanceActive } from "@/lib/p2p-maintenance-env"

export function useP2PSystemMaintenance(): { isActive: boolean } {
  return { isActive: isP2PMaintenanceActive() }
}

export function useP2PQueriesBlocked(): boolean {
  return isP2PMaintenanceActive()
}
