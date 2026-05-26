import { NextRequest, NextResponse } from "next/server"
import { getOryBaseUrl, forwardSetCookiesToNextResponse } from "@/lib/ory-bff-helpers"

const FETCH_TIMEOUT_MS = 15_000

interface KratosResponse {
  state?: string
  session?: unknown
  redirect_browser_to?: string
  ui?: {
    nodes?: Array<{ attributes: { name: string; value?: string }; messages: Array<{ type: string; text: string }> }>
    messages?: Array<{ type: string; text: string }>
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string
      flow_id?: string
      csrf_token?: string
      code?: string
    }
    const identifier = typeof body.email === "string" ? body.email.trim() : ""
    const { flow_id, csrf_token, code } = body

    if (!identifier || !flow_id || !code) {
      return NextResponse.json({ error: "email, flow_id, and code are required" }, { status: 400 })
    }

    const hostname = request.nextUrl.hostname
    const authBase = getOryBaseUrl(hostname)
    const browserCookie = request.headers.get("cookie")?.trim() ?? ""

    const loginRes = await fetch(`${authBase}/self-service/login?flow=${flow_id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(browserCookie ? { Cookie: browserCookie } : {}),
      },
      body: JSON.stringify({ csrf_token: csrf_token ?? "", method: "code", code, identifier }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })

    const data = (await loginRes.json()) as KratosResponse

    if (loginRes.ok) {
      const res = NextResponse.json({
        session: data.session,
        redirect_browser_to: data.redirect_browser_to ?? null,
      })
      forwardSetCookiesToNextResponse(res, loginRes, hostname)
      return res
    }

    const nodeErrors = (data?.ui?.nodes ?? []).flatMap((n) => n.messages).filter((m) => m.type === "error")
    const uiErrors = (data?.ui?.messages ?? []).filter((m) => m.type === "error")
    const errorText = nodeErrors[0]?.text ?? uiErrors[0]?.text ?? ""
    const error_code = errorText ? "ory_auth_flow_error" : "otp_invalid_or_expired"

    const res = NextResponse.json(
      errorText ? { error_code, error: errorText } : { error_code },
      { status: 400 },
    )
    forwardSetCookiesToNextResponse(res, loginRes, hostname)
    return res
  } catch {
    return NextResponse.json({ error_code: "unexpected" }, { status: 500 })
  }
}
