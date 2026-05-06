import type { NextResponse } from "next/server"
import { shouldStripCookieDomain, getDerivTld } from "@/lib/deriv-origin"

export interface KratosFlowNode {
  attributes: { name: string; value?: string }
  messages: Array<{ type: string; text: string }>
}

export interface KratosFlow {
  id: string
  state?: string
  ui?: {
    nodes?: KratosFlowNode[]
    messages?: Array<{ type: string; text: string }>
  }
}

export function getOryBaseUrl(hostname: string): string {
  const tld = getDerivTld(hostname)
  const value =
    tld === "me"
      ? (process.env.NEXT_PUBLIC_ORY_ME_URL ?? process.env.NEXT_PUBLIC_ORY_URL)
      : tld === "be"
        ? (process.env.NEXT_PUBLIC_ORY_BE_URL ?? process.env.NEXT_PUBLIC_ORY_URL)
        : process.env.NEXT_PUBLIC_ORY_URL

  if (!value) throw new Error("Missing required env var: NEXT_PUBLIC_ORY_URL")
  return value.replace(/\/+$/, "")
}

export function extractCsrfToken(flow: KratosFlow): string {
  return flow.ui?.nodes?.find((n) => n.attributes.name === "csrf_token")?.attributes?.value ?? ""
}

export function getSetCookieNameValueHeader(response: Response): string {
  const h = response.headers as Headers & { getSetCookie?: () => string[] }
  const lines =
    typeof h.getSetCookie === "function"
      ? h.getSetCookie()
      : (response.headers.get("set-cookie") ?? "")
          .split(/,(?=\s*[a-zA-Z0-9_.-]+=)/)
          .map((s) => s.trim())
          .filter(Boolean)
  return lines
    .map((line) => line.split(";")[0].trim())
    .filter(Boolean)
    .join("; ")
}

function stripDomainFromCookieValue(cookieValue: string): string {
  return cookieValue
    .split(";")
    .map((p) => p.trim())
    .filter((p) => p.length > 0 && !/^domain=/i.test(p))
    .join("; ")
}

export function forwardSetCookiesToNextResponse(res: NextResponse, upstream: Response, hostname: string): void {
  const h = upstream.headers as Headers & { getSetCookie?: () => string[] }
  const lines =
    typeof h.getSetCookie === "function"
      ? h.getSetCookie()
      : (upstream.headers.get("set-cookie") ?? "")
          .split(/,(?=\s*[a-zA-Z0-9_.-]+=)/)
          .map((s) => s.trim())
          .filter(Boolean)

  const strip = shouldStripCookieDomain(hostname)
  for (const line of lines) {
    res.headers.append("Set-Cookie", strip ? stripDomainFromCookieValue(line) : line)
  }
}
