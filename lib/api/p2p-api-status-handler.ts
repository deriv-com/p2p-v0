import { useP2PMaintenanceStore } from "@/stores/p2p-maintenance-store"

/** Extracts the first P2P API error code from a response body, if present. */
export function extractP2PErrorCode(body: unknown): string | null {
  if (!body || typeof body !== "object") return null
  const errors = (body as { errors?: unknown }).errors
  if (!Array.isArray(errors) || errors.length === 0) return null
  const first = errors[0]
  if (!first || typeof first !== "object") return null
  const code = (first as { code?: unknown }).code
  return typeof code === "string" ? code : null
}

/**
 * Latches system-maintenance mode when any P2P API returns `P2PDisabled`.
 * Intentionally session-scoped with no timeout — mirrors mobile. Cleared on
 * logout (`clearMaintenance`) or full page reload.
 */
export function handleP2PApiStatusCode(code: string | null | undefined): void {
  if (code === "P2PDisabled") {
    useP2PMaintenanceStore.getState().setApiMaintenanceActive(true)
  }
}
