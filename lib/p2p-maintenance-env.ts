import { useP2PMaintenanceStore } from "@/stores/p2p-maintenance-store"

/** Maintenance kill-switch for web — env flag or API `P2P_Disabled` latch. */

/** Whether P2P system maintenance mode is active (banner, gates, query blocking). */
export function isP2PMaintenanceActive(): boolean {
  return (
    process.env.NEXT_PUBLIC_P2P_SYSTEM_MAINTENANCE_ENABLED === "1" ||
    useP2PMaintenanceStore.getState().isApiMaintenanceActive
  )
}
