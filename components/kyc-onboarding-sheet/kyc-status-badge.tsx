import { Badge } from "@/components/ui/badge"
import type { OnboardingKycStepStatus } from "@/lib/kyc/onboarding-kyc-step-status"

interface KycStatusBadgeProps {
  status: OnboardingKycStepStatus
  labels: {
    verified: string
    inReview: string
    failed: string
    unverified: string
  }
  showUnverified?: boolean
}

export function KycStatusBadge({ status, labels, showUnverified }: KycStatusBadgeProps) {
  switch (status) {
    case "verified":
      return (
        <Badge variant="success-light" className="rounded-sm font-normal">
          {labels.verified}
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="pending-secondary" className="rounded-sm font-normal">
          {labels.inReview}
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="error-light" className="rounded-sm font-normal">
          {labels.failed}
        </Badge>
      )
    case "expired":
      return showUnverified ? (
        <Badge
          variant="outline"
          className="rounded-sm border-transparent bg-grayscale-500 px-2 py-0.5 text-xs font-normal text-grayscale-600"
        >
          {labels.unverified}
        </Badge>
      ) : (
        <Badge variant="error-light" className="rounded-sm font-normal">
          {labels.failed}
        </Badge>
      )
    default:
      return null
  }
}
