"use client"

import { useEffect } from "react"
import { getFeatureFlag } from "@/services/api/api-remote-config"
import { P2P_SYSTEM_MAINTENANCE_FLAG } from "@/lib/p2p-maintenance-constants"
import {
  selectIsP2PSystemMaintenanceActive,
  useP2PMaintenanceStore,
} from "@/stores/p2p-maintenance-store"

/**
 * Combined maintenance signal: Remote Config flag OR latched `P2P_Disabled`
 * from any P2P API response OR `NEXT_PUBLIC_P2P_SYSTEM_MAINTENANCE_ENABLED=1`.
 */
export function useP2PSystemMaintenance(): { isActive: boolean } {
  const isActive = useP2PMaintenanceStore(selectIsP2PSystemMaintenanceActive)
  const setRemoteConfigEnabled = useP2PMaintenanceStore((s) => s.setRemoteConfigEnabled)

  useEffect(() => {
    let cancelled = false

    getFeatureFlag(P2P_SYSTEM_MAINTENANCE_FLAG).then((enabled) => {
      if (!cancelled) {
        setRemoteConfigEnabled(enabled)
      }
    })

    return () => {
      cancelled = true
    }
  }, [setRemoteConfigEnabled])

  return { isActive }
}

/** Subscribe to maintenance state without loading remote config (for query hooks). */
export function useP2PQueriesBlocked(): boolean {
  return useP2PMaintenanceStore(selectIsP2PSystemMaintenanceActive)
}
