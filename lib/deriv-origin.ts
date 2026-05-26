export type DerivTld = "com" | "be" | "me"

export function getDerivTld(hostname: string): DerivTld {
  const normalized = hostname.split(":")[0]?.toLowerCase() || ""

  if (normalized.endsWith(".deriv.be") || normalized === "deriv.be") return "be"
  if (normalized.endsWith(".deriv.me") || normalized === "deriv.me") return "me"

  return "com"
}

export function isDerivOrigin(hostname: string): boolean {
  const normalized = hostname.split(":")[0]?.toLowerCase() || ""

  if (!normalized || normalized === "localhost" || normalized === "127.0.0.1" || normalized.endsWith(".localhost")) {
    return false
  }

  if (normalized.startsWith("dev-") || normalized.endsWith(".workers.dev") || normalized.endsWith(".vercel.app")) {
    return false
  }

  return (
    normalized === "deriv.com" ||
    normalized === "deriv.be" ||
    normalized === "deriv.me" ||
    normalized.endsWith(".deriv.com") ||
    normalized.endsWith(".deriv.be") ||
    normalized.endsWith(".deriv.me")
  )
}

export function shouldStripCookieDomain(hostname: string): boolean {
  return !isDerivOrigin(hostname)
}
