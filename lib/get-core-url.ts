import { getDerivTld, isDerivOrigin } from "@/lib/deriv-origin"

const LOCAL_CORE_PROXY_URL = "/api/proxy/api"

/**
 * Get the correct Core URL based on the current domain.
 * - localhost / preview hosts → same-origin BFF proxy to avoid CORS
 * - Deriv domains → direct upstream URL
 */
export function getCoreUrl(): string {
  if (typeof window === "undefined") {
    // Server-side: default to .com URL
    return process.env.NEXT_PUBLIC_CORE_URL || ""
  }

  const hostname = window.location.hostname
  if (!isDerivOrigin(hostname)) {
    return LOCAL_CORE_PROXY_URL
  }

  switch (getDerivTld(hostname)) {
    case "me":
      return process.env.NEXT_PUBLIC_CORE_ME_URL || process.env.NEXT_PUBLIC_CORE_URL || ""
    case "be":
      return process.env.NEXT_PUBLIC_CORE_BE_URL || process.env.NEXT_PUBLIC_CORE_URL || ""
    case "com":
    default:
      return process.env.NEXT_PUBLIC_CORE_URL || ""
  }
}
