/**
 * Maintenance kill-switch for web — does not use Remote Config.
 *
 * TODO(QA): revert after maintenance banner QA — currently forced on everywhere
 * so test links (e.g. p2p-dev*.deriv.com) show the banner without env/hostname checks.
 * Restore env-based `NEXT_PUBLIC_P2P_SYSTEM_MAINTENANCE_ENABLED` before production release.
 */

/** Whether P2P system maintenance mode is active (banner, gates, query blocking). */
export function isP2PMaintenanceActive(): boolean {
  return true
}
