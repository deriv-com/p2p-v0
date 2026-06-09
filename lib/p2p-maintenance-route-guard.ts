import { P2P_MAINTENANCE_ALLOWED_ROOTS } from "@/lib/p2p-maintenance-constants"

/**
 * Maps a blocked pathname to the nearest allowed tab root.
 * Returns `null` when [pathname] is already allowed.
 */
export function p2pMaintenanceRedirectFor(pathname: string): string | null {
  if ((P2P_MAINTENANCE_ALLOWED_ROOTS as readonly string[]).includes(pathname)) {
    return null
  }

  if (pathname.startsWith("/advertiser")) {
    return "/"
  }
  if (pathname.startsWith("/orders/")) {
    return "/orders"
  }
  if (pathname.startsWith("/ads/")) {
    return "/ads"
  }
  if (pathname.startsWith("/wallet")) {
    return "/wallet"
  }
  if (pathname.startsWith("/profile")) {
    return "/profile"
  }

  return "/"
}
