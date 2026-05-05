import { NextResponse, type NextRequest } from "next/server"
import { getDerivTld, shouldStripCookieDomain } from "@/lib/deriv-origin"

const AUTH_PROXY_PREFIX = "/api/auth"

const HOP_BY_HOP_REQUEST_HEADERS = new Set([
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
])

const SKIP_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "keep-alive",
  "set-cookie",
  "transfer-encoding",
])

function getAuthBaseUrl(hostname: string): string {
  const tld = getDerivTld(hostname)
  const value =
    tld === "me"
      ? process.env.NEXT_PUBLIC_ORY_ME_URL || process.env.NEXT_PUBLIC_ORY_URL
      : tld === "be"
        ? process.env.NEXT_PUBLIC_ORY_BE_URL || process.env.NEXT_PUBLIC_ORY_URL
        : process.env.NEXT_PUBLIC_ORY_URL

  if (!value) {
    throw new Error("Missing required env var: NEXT_PUBLIC_ORY_URL")
  }

  const url = new URL(value)
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("NEXT_PUBLIC_ORY_URL must be an absolute HTTP(S) URL")
  }

  return url.toString().replace(/\/+$/, "")
}

function containsPathTraversal(path: string): boolean {
  const lowerPath = path.toLowerCase()
  if (lowerPath.includes("..") || lowerPath.includes("%2e")) return true

  try {
    return decodeURIComponent(path).includes("..")
  } catch {
    return true
  }
}

function getUpstreamAuthPath(pathname: string): string | null {
  if (pathname === AUTH_PROXY_PREFIX) return "/"
  if (!pathname.startsWith(`${AUTH_PROXY_PREFIX}/`)) return null

  const upstreamPath = pathname.slice(AUTH_PROXY_PREFIX.length)
  if (!upstreamPath.startsWith("/") || containsPathTraversal(upstreamPath)) {
    return null
  }

  return upstreamPath
}

function buildUpstreamHeaders(request: NextRequest): Headers {
  const headers = new Headers()

  request.headers.forEach((value, key) => {
    if (HOP_BY_HOP_REQUEST_HEADERS.has(key.toLowerCase())) return
    headers.set(key, value)
  })

  return headers
}

function stripDomainAttributeFromSetCookieValue(cookieValue: string): string {
  return cookieValue
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !/^domain=/i.test(part))
    .join("; ")
}

function appendSetCookies(target: Headers, upstream: Headers, hostname: string): void {
  const upstreamHeaders = upstream as Headers & { getSetCookie?: () => string[] }
  const setCookieHeaders =
    typeof upstreamHeaders.getSetCookie === "function"
      ? upstreamHeaders.getSetCookie()
      : upstream.get("set-cookie")
        ? [upstream.get("set-cookie") as string]
        : []

  const stripDomain = shouldStripCookieDomain(hostname)
  for (const cookie of setCookieHeaders) {
    target.append("Set-Cookie", stripDomain ? stripDomainAttributeFromSetCookieValue(cookie) : cookie)
  }
}

export async function middleware(request: NextRequest) {
  const upstreamPath = getUpstreamAuthPath(request.nextUrl.pathname)
  if (!upstreamPath) return NextResponse.next()

  const hostname = request.nextUrl.hostname
  const authBaseUrl = getAuthBaseUrl(hostname)
  const upstreamUrl = `${authBaseUrl}${upstreamPath}${request.nextUrl.search}`

  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer()

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers: buildUpstreamHeaders(request),
    body: body && body.byteLength > 0 ? body : undefined,
    redirect: "manual",
  })

  const responseHeaders = new Headers()
  upstreamResponse.headers.forEach((value, key) => {
    if (SKIP_RESPONSE_HEADERS.has(key.toLowerCase())) return
    responseHeaders.set(key, value)
  })
  appendSetCookies(responseHeaders, upstreamResponse.headers, hostname)

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  })
}

export const config = {
  matcher: ["/api/auth/:path*"],
}
