/**
 * Get the correct core URL based on the current domain
 * - .com domain → NEXT_PUBLIC_CORE_URL
 * - .me domain → NEXT_PUBLIC_CORE_ME_URL
 * - .be domain → NEXT_PUBLIC_CORE_BE_URL
 */
export function getCoreUrl(): string {
  if (typeof window === "undefined") {
    // Server-side: default to .com URL
    return process.env.NEXT_PUBLIC_CORE_URL || ""
  }

  const domain = window.location.hostname
  const tld = domain.split(".").pop()?.toLowerCase()

  switch (tld) {
    case "me":
      return process.env.NEXT_PUBLIC_CORE_ME_URL || process.env.NEXT_PUBLIC_CORE_URL || ""
    case "be":
      return process.env.NEXT_PUBLIC_CORE_BE_URL || process.env.NEXT_PUBLIC_CORE_URL || ""
    case "com":
    default:
      return process.env.NEXT_PUBLIC_CORE_URL || ""
  }
}
