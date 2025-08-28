"use client"

import * as React from "react"
import { Alert } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccountRestrictionNoticeProps {
  reason?: string
  cooldownTimer?: string
  className?: string
}

const AccountRestrictionNotice = React.forwardRef<HTMLDivElement, AccountRestrictionNoticeProps>(
  ({ reason = "reason", cooldownTimer = "cool-down timer", className, ...props }, ref) => {
    return (
      <Alert ref={ref} variant="warning" className={cn("mb-4", className)} {...props}>
        <AlertCircle className="h-5 w-5" />
        <div className="text-sm">
          Your account is temporarily restricted due to [{reason}]. Some actions will be unavailable until [
          {cooldownTimer}].
        </div>
      </Alert>
    )
  },
)

AccountRestrictionNotice.displayName = "AccountRestrictionNotice"

export { AccountRestrictionNotice }
