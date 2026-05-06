import { NextRequest, NextResponse } from "next/server"
import {
  extractCsrfToken,
  forwardSetCookiesToNextResponse,
  getOryBaseUrl,
  getSetCookieNameValueHeader,
  type KratosFlow,
} from "@/lib/ory-bff-helpers"

const FETCH_TIMEOUT_MS = 15_000

interface KratosLoginResponse {
  session?: unknown
  redirect_browser_to?: string
  error?: { id?: string }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; password?: string }
    const email = typeof body.email === "string" ? body.email.trim() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!email || !password) {
      return NextResponse.json({ error_code: "invalid_request" }, { status: 400 })
    }

    const hostname = request.nextUrl.hostname
    const authBase = getOryBaseUrl(hostname)
    const incomingCookie = request.headers.get("cookie") ?? ""

    const flowRes = await fetch(`${authBase}/self-service/login/browser`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(incomingCookie ? { Cookie: incomingCookie } : {}),
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })

    if (!flowRes.ok) {
      const errBody = await flowRes.json().catch(() => ({}))
      return NextResponse.json(errBody, { status: flowRes.status })
    }

    const flow = (await flowRes.json()) as KratosFlow
    const csrfToken = extractCsrfToken(flow)
    const flowCookieHeader = getSetCookieNameValueHeader(flowRes)

    const loginRes = await fetch(`${authBase}/self-service/login?flow=${flow.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(flowCookieHeader ? { Cookie: flowCookieHeader } : {}),
      },
      body: JSON.stringify({
        csrf_token: csrfToken,
        method: "password",
        identifier: email,
        password,
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })

    const loginData = (await loginRes.json()) as KratosLoginResponse
    const redirectTo = typeof loginData.redirect_browser_to === "string" ? loginData.redirect_browser_to.trim() : ""
    const isBrowserContinuation =
      !loginRes.ok &&
      redirectTo !== "" &&
      (loginRes.status === 422 || loginData.error?.id === "browser_location_change_required")

    if (loginRes.ok || isBrowserContinuation) {
      const res = NextResponse.json({
        session: loginData.session ?? null,
        redirect_browser_to: redirectTo || null,
      })
      forwardSetCookiesToNextResponse(res, flowRes, hostname)
      forwardSetCookiesToNextResponse(res, loginRes, hostname)
      return res
    }

    const res = NextResponse.json({ error_code: "incorrect_credentials" }, { status: 401 })
    forwardSetCookiesToNextResponse(res, flowRes, hostname)
    forwardSetCookiesToNextResponse(res, loginRes, hostname)
    return res
  } catch {
    return NextResponse.json({ error_code: "unexpected" }, { status: 500 })
  }
}
