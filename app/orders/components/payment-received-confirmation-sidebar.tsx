"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useUserDataStore } from "@/stores/user-data-store"
import { OrdersAPI } from "@/services/api"

interface PaymentReceivedConfirmationSidebarProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  orderId: string
  isLoading?: boolean
}

export const PaymentReceivedConfirmationSidebar = ({
  isOpen,
  onClose,
  onConfirm,
  orderId,
  isLoading = false,
}: PaymentReceivedConfirmationSidebarProps) => {
  const [otpValue, setOtpValue] = useState("")
  const [resendTimer, setResendTimer] = useState(59)
  const [error, setError] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const userData = useUserDataStore((state) => state.userData)

  useEffect(() => {
    if (isOpen) {
      handleRequestOtp()
      setOtpValue("")
      setError(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || resendTimer <= 0) return

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, resendTimer])

  const handleConfirmOrder = async (value) => {
    try {
      const result = await OrdersAPI.completeOrder(orderId, value)

      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0]

        if (error.code === "InvalidOrExpiredVerificationCode") {
          const attemptsLeft = error.detail?.attempts_left || 0
          setError(`Incorrect code. You have ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} left.`)
        } else {
          setError(error.message || "An error occurred. Please try again.")
        }
        setOtpValue("")
      } else {
        onConfirm()
        onClose()
      }
    } catch (err) {
      console.error("Error completing order:", err)
      setError("An error occurred. Please try again.")
      setOtpValue("")
    }
  }

  const handleRequestOtp = async () => {
    try {
      await OrdersAPI.requestOrderCompletionOtp(orderId)
      setResendTimer(59)
      setError(null)
    } catch (err) {
      console.error("Error requesting OTP:", err)
      setError("Failed to send verification code. Please try again.")
    }
  }

  const handleResendCode = async () => {
    if (resendTimer > 0) return
    await handleRequestOtp()
  }

  const handleOtpChange = (value: string) => {
    setOtpValue(value)
    setError(null)
    if (value.length === 6) {
      handleConfirmOrder(value)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full p-0 sm:max-w-none" hideCloseButton>
        <div className="flex flex-col h-full sm:max-w-none md:max-w-xl md:mx-auto">
          <SheetHeader className="p-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={onClose} size="sm" className="bg-grayscale-300 px-1">
                <Image src="/icons/arrow-left-icon.png" alt="Back" width={24} height={24} />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 p-6 space-y-6">
            <div>
              <SheetTitle className="text-2xl font-bold mb-4 text-slate-1200">Confirm payment received</SheetTitle>
              <p className="text-sm text-gray-600">
                Enter the 6-digit code sent to <span className="font-semibold">{userData?.email || "your email"}</span>.
                This step verifies your identity before releasing payment to the other party.
              </p>
            </div>

            <div className="space-y-4">
              <InputOTP maxLength={6} value={otpValue} onChange={handleOtpChange} disabled={isVerifying || isLoading}>
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg bg-transparent" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg bg-transparent" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg bg-transparent" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg bg-transparent" />
                  <InputOTPSlot index={4} className="w-12 h-12 text-lg bg-transparent" />
                  <InputOTPSlot index={5} className="w-12 h-12 text-lg bg-transparent" />
                </InputOTPGroup>
              </InputOTP>

              {error && <p className="text-error text-sm">{error}</p>}

              {isVerifying && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                  <span>Verifying...</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-600">Resend code ({resendTimer}s)</p>
              ) : (
                <Button
                  variant="ghost"
                  onClick={handleResendCode}
                  className="p-0 hover:bg-transparent underline font-normal text-gray-600"
                  size="sm"
                >
                  Resend code
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
