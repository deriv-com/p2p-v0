export const P2P_SYSTEM_MAINTENANCE_FLAG = "p2p_system_maintenance_enabled"

/** Next.js public env var set in GitHub Actions / Cloudflare deploy. */
export const P2P_SYSTEM_MAINTENANCE_ENV_KEY = "NEXT_PUBLIC_P2P_SYSTEM_MAINTENANCE_ENABLED"

export const P2P_MAINTENANCE_ALLOWED_ROOTS = ["/", "/orders", "/ads", "/wallet", "/profile"] as const
