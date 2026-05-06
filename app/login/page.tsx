"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

type Step = "email" | "password" | "verification"

function isAllowedBrowserRedirect(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim()) return false

  try {
    const url = new URL(value, window.location.origin)
    const hostname = url.hostname.toLowerCase()
    const isDerivHost =
      hostname === "deriv.com" ||
      hostname === "deriv.be" ||
      hostname === "deriv.me" ||
      hostname.endsWith(".deriv.com") ||
      hostname.endsWith(".deriv.be") ||
      hostname.endsWith(".deriv.me")

    return (url.protocol === "https:" || url.protocol === "http:") && (url.origin === window.location.origin || isDerivHost)
  } catch {
    return false
  }
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [flowId, setFlowId] = useState("")
  const [csrfToken, setCsrfToken] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [resendTimer, setResendTimer] = useState(59)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  function startResendTimer() {
    setResendTimer(59)
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleEmailSubmit = () => {
    setError("")
    setStep("password")
  }

  const handlePasswordLogin = async () => {
    try {
      setIsLoading(true)
      setError("")

      const res = await fetch("/api/ory/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(
          data.error_code === "incorrect_credentials"
            ? "Incorrect email or password. Please try again."
            : "Login failed. Please try again."
        )
        return
      }

      if (isAllowedBrowserRedirect(data.redirect_browser_to)) {
        window.location.href = data.redirect_browser_to
        return
      }

      window.location.href = "/"
    } catch {
      setError("Failed to login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestOtp = async () => {
    try {
      setIsLoading(true)
      setError("")

      const res = await fetch("/api/ory/login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to send code. Please try again.")
        return
      }

      setFlowId(data.flow_id)
      setCsrfToken(data.csrf_token)
      setStep("verification")
      startResendTimer()
    } catch {
      setError("Failed to send code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerification = async () => {
    try {
      setIsLoading(true)
      setError("")

      const res = await fetch("/api/ory/verify-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, flow_id: flowId, csrf_token: csrfToken, code: verificationCode }),
        credentials: "include",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Verification failed. Please check the code and try again.")
        return
      }

      if (isAllowedBrowserRedirect(data.redirect_browser_to)) {
        window.location.href = data.redirect_browser_to
        return
      }

      window.location.href = "/"
    } catch {
      setError("Failed to verify code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendTimer > 0) return
    try {
      setError("")
      const res = await fetch("/api/ory/login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to resend code.")
        return
      }

      setFlowId(data.flow_id)
      setCsrfToken(data.csrf_token)
      startResendTimer()
    } catch {
      setError("Failed to resend code. Please try again.")
    }
  }

  if (step === "verification") {
    return (
      <div className="min-h-screen bg-white px-4 py-6">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => setStep("password")} className="p-2 -ml-2">
            <Image src="/icons/arrow-left-icon.png" width={24} height={24} alt="Back" />
            Back
          </Button>
        </div>
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-black mb-6">Verification</h1>
          <p className="text-gray-600 mb-8">Enter the 6-digit code sent to {email}</p>
          <div className="mb-8">
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
              maxLength={6}
            />
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>
          <div className="text-center mb-8 space-y-2">
            <p className="text-gray-600">{"Didn't receive the code?"}</p>
            {resendTimer > 0 ? (
              <p className="text-gray-600">Resend code ({resendTimer}s)</p>
            ) : (
              <Button variant="ghost" onClick={handleResendCode} size="sm">
                Resend code
              </Button>
            )}
          </div>
          <Button
            className="w-full"
            onClick={handleVerification}
            disabled={verificationCode.length !== 6 || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </Button>
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => {
                setError("")
                setVerificationCode("")
                setStep("password")
              }}
              disabled={isLoading}
              size="sm"
            >
              Log in with password
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (step === "password") {
    return (
      <div className="min-h-screen bg-white px-4 py-6">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => setStep("email")} className="p-2 -ml-2">
            <Image src="/icons/arrow-left-icon.png" width={24} height={24} alt="Back" />
            Back
          </Button>
        </div>
        <div className="max-w-md mx-auto mt-12">
          <h1 className="text-4xl font-bold text-black mb-4">Enter your password</h1>
          <p className="text-gray-600 mb-8">{email}</p>
          <div className="mb-6">
            <label className="block text-gray-600 mb-3">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              onKeyDown={(e) => e.key === "Enter" && password && !isLoading && handlePasswordLogin()}
            />
          </div>
          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
          <Button onClick={handlePasswordLogin} disabled={!password || isLoading} className="w-full">
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
          <div className="mt-6 text-center">
            <Button variant="ghost" onClick={handleRequestOtp} disabled={isLoading} size="sm">
              {isLoading ? "Sending code..." : "Get one-time code"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="max-w-md mx-auto mt-12">
        <h1 className="text-4xl font-bold text-black mb-8">Welcome back!</h1>
        <div className="mb-6">
          <label className="block text-gray-600 mb-3">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@email.com"
            onKeyDown={(e) => e.key === "Enter" && email.trim() && !isLoading && handleEmailSubmit()}
          />
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>
        <Button onClick={handleEmailSubmit} disabled={!email.trim() || isLoading} className="w-full">
          Continue
        </Button>
        <div className="mt-6 text-center text-sm">
          Don&apos;t have an account yet?{" "}
          <a className="text-primary" href="https://home.deriv.com/dashboard" target="_blank" rel="noopener noreferrer">
            Sign up
          </a>
        </div>
      </div>
    </div>
  )
}
