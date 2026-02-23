/**
 * Get the correct help centre URL based on the current domain
 * - .com domain → trade.deriv.com
 * - .me domain → trade.deriv.me
 * - .be domain → trade.deriv.be
 */
export function getHelpCentreUrl(): string {
  if (typeof window === "undefined") {
    // Server-side: default to .com URL
    return "https://trade.deriv.com"
  }

  const domain = window.location.hostname
  const tld = domain.split(".").pop()?.toLowerCase()

  switch (tld) {
    case "me":
      return "https://trade.deriv.me"
    case "be":
      return "https://trade.deriv.be"
    case "com":
    default:
      return "https://trade.deriv.com"
  }
}
