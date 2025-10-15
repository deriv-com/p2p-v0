"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useUserDataStore } from "@/stores/user-data-store"
import { OrdersAPI } from "@/services/api"
import { ChevronLeft, HelpCircle } from "lucide-react"

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

  const handleVerifyAndComplete = async () => {
    if (otpValue.length !== 6) return

    setIsVerifying(true)
    setError(null)

    try {
      const result = await OrdersAPI.verifyOrderCompletionOtp(orderId, otpValue)
      if (result.success) {
        onConfirm()
      } else {
        setError(result.message || "Invalid verification code. Please try again.")
      }
    } catch (err) {
      console.error("Error verifying OTP:", err)
      setError("Failed to verify code. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    if (resendTimer > 0) return
    await handleRequestOtp()
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={onClose} className="p-0 h-auto hover:bg-transparent">
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                <HelpCircle className="h-6 w-6" />
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
              <InputOTP maxLength={6} value={otpValue} onChange={(value) => setOtpValue(value)}>
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={4} className="w-12 h-12 text-lg" />
                  <InputOTPSlot index={5} className="w-12 h-12 text-lg" />
                </InputOTPGroup>
              </InputOTP>

              {error && <p className="text-error text-sm">{error}</p>}
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-600">Resend code ({resendTimer}s)</p>
              ) : (
                <Button variant="ghost" onClick={handleResendCode} className="p-0" size="sm">
                  Resend code
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 pt-0">
            <Button
              variant="default"
              onClick={handleVerifyAndComplete}
              disabled={otpValue.length !== 6 || isVerifying || isLoading}
              className="w-full"
            >
              {isVerifying || isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                  Verifying...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
