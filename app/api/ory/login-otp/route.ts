import { NextRequest, NextResponse } from "next/server"
import {
  getOryBaseUrl,
  extractCsrfToken,
  getSetCookieNameValueHeader,
  forwardSetCookiesToNextResponse,
  type KratosFlow,
} from "@/lib/ory-bff-helpers"

const FETCH_TIMEOUT_MS = 15_000

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string }
    const identifier = typeof body.email === "string" ? body.email.trim() : ""
    if (!identifier) {
      return NextResponse.json({ error: "email is required" }, { status: 400 })
    }

    const hostname = request.nextUrl.hostname
    const authBase = getOryBaseUrl(hostname)

    const flowRes = await fetch(`${authBase}/self-service/login/browser`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })

    if (!flowRes.ok) {
      const errBody = await flowRes.json().catch(() => ({}))
      return NextResponse.json(errBody, { status: flowRes.status })
    }

    const flow = (await flowRes.json()) as KratosFlow
    const csrfToken = extractCsrfToken(flow)
    const flowCookieHeader = getSetCookieNameValueHeader(flowRes)

    const submitRes = await fetch(`${authBase}/self-service/login?flow=${flow.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(flowCookieHeader ? { Cookie: flowCookieHeader } : {}),
      },
      body: JSON.stringify({ csrf_token: csrfToken, method: "code", identifier }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })

    const submitData = (await submitRes.json()) as KratosFlow
    const state = submitData?.state
    const otpSent = state === "sent_email" || state === "sent_sms" || state === "sent_message" || submitRes.ok

    if (otpSent) {
      const updatedCsrf =
        submitData?.ui?.nodes?.find((n) => n.attributes.name === "csrf_token")?.attributes?.value ?? csrfToken
      const res = NextResponse.json({ flow_id: flow.id, csrf_token: updatedCsrf })
      forwardSetCookiesToNextResponse(res, flowRes, hostname)
      forwardSetCookiesToNextResponse(res, submitRes, hostname)
      return res
    }

    const nodeErrors = (submitData?.ui?.nodes ?? []).flatMap((n) => n.messages).filter((m) => m.type === "error")
    const uiErrors = (submitData?.ui?.messages ?? []).filter((m) => m.type === "error")
    const hasError = nodeErrors[0]?.text || uiErrors[0]?.text
    const res = NextResponse.json(
      { error_code: hasError ? "ory_auth_flow_error" : "otp_send_failed" },
      { status: 400 },
    )
    forwardSetCookiesToNextResponse(res, flowRes, hostname)
    forwardSetCookiesToNextResponse(res, submitRes, hostname)
    return res
  } catch {
    return NextResponse.json({ error_code: "unexpected" }, { status: 500 })
  }
}
