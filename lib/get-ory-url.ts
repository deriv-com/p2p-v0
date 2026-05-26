import { getDerivTld, isDerivOrigin } from "@/lib/deriv-origin"

const LOCAL_AUTH_PROXY_URL = "/api/auth"

/**
 * Get the correct Ory URL based on the current domain.
 * - localhost / preview hosts → same-origin auth proxy to preserve cookies
 * - Deriv domains → direct upstream URL
 */
export function getOryUrl(): string {
  if (typeof window === "undefined") {
    // Server-side: default to .com URL
    return process.env.NEXT_PUBLIC_ORY_URL || ""
  }

  const hostname = window.location.hostname
  if (!isDerivOrigin(hostname)) {
    return LOCAL_AUTH_PROXY_URL
  }

  switch (getDerivTld(hostname)) {
    case "me":
      return process.env.NEXT_PUBLIC_ORY_ME_URL || process.env.NEXT_PUBLIC_ORY_URL || ""
    case "be":
      return process.env.NEXT_PUBLIC_ORY_BE_URL || process.env.NEXT_PUBLIC_ORY_URL || ""
    case "com":
    default:
      return process.env.NEXT_PUBLIC_ORY_URL || ""
  }
}
