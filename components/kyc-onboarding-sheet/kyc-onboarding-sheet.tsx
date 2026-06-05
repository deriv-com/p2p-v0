"use client"

import { useEffect, useMemo } from "react"
import { getHomeUrl } from "@/lib/utils"
import { onboardingKycStepStatusFromRaw } from "@/lib/kyc/onboarding-kyc-step-status"
import { useUserDataStore } from "@/stores/user-data-store"
import { useTranslations } from "@/lib/i18n/use-translations"
import { KycOnboardingContentPanel } from "./kyc-onboarding-content-panel"
import { KycOnboardingVisualPanel } from "./kyc-onboarding-visual-panel"
import type { KycOnboardingStep } from "./kyc-onboarding-step-row"

export type KycOnboardingRoute = "markets" | "profile" | "wallets" | "ads"

interface KycOnboardingSheetProps {
  route?: KycOnboardingRoute
  onClose?: () => void
}

function KycOnboardingSheet({ route, onClose }: KycOnboardingSheetProps) {
  const { t } = useTranslations()
  const { isWalletAccount } = useUserDataStore()
  const onboardingStatus = useUserDataStore((state) => state.onboardingStatus)
  const userId = useUserDataStore((state) => state.userId)
  const userData = useUserDataStore((state) => state.userData)
  const isV1Signup = userData?.signup === "v1"

  const isTncAccepted = onboardingStatus?.tnc?.accepted === true
  const isProfileCompleted = onboardingStatus?.profile?.status === "complete" && isTncAccepted
  const isPoiCompleted = onboardingStatus?.kyc?.poi_status === "approved"
  const isPoaCompleted = onboardingStatus?.kyc?.poa_status === "approved"
  const isPoiRejected = onboardingStatus?.kyc?.poi_status === "rejected"
  const isPoaRejected = onboardingStatus?.kyc?.poa_status === "rejected"
  const isPoiInReview = onboardingStatus?.kyc?.poi_status === "pending"
  const isPoaInReview = onboardingStatus?.kyc?.poa_status === "pending"
  const isPoiIncomplete = Boolean(userId && !isPoiCompleted)
  const isPoaIncomplete = Boolean(userId && !isPoaCompleted)
  const isPhoneCompleted =
    onboardingStatus?.p2p?.criteria?.find((c) => c.code === "phone_verified")?.passed || false

  const getFromParam = () => {
    if (!route) return "from=p2p"

    switch (route) {
      case "markets":
        return "from=p2p"
      case "profile":
        return "from=p2p-profile"
      case "wallets":
        return "from=p2p-wallet"
      case "ads":
        return "from=p2p-ads"
      default:
        return "from=p2p"
    }
  }

  const fromParam = getFromParam()

  const allVerificationSteps: KycOnboardingStep[] = useMemo(
    () => [
      {
        id: "profile",
        title: t("kyc.setupProfile"),
        icon: "/icons/account-profile.svg",
        completed: isProfileCompleted,
        link: getHomeUrl(isV1Signup, "onboardingProfile", isWalletAccount, fromParam, isTncAccepted),
      },
      {
        id: "phone",
        title: t("kyc.phoneNumber"),
        icon: "/icons/pnv.svg",
        completed: isPhoneCompleted,
        status: isPhoneCompleted ? "verified" : "none",
        link: getHomeUrl(isV1Signup, "onboardingPNV", isWalletAccount, fromParam, isTncAccepted),
      },
      {
        id: "poi",
        title: t("kyc.proofOfIdentity"),
        icon: "/icons/poi.svg",
        completed: isPoiCompleted,
        rejected: isPoiRejected,
        inReview: isPoiInReview,
        expired: isPoiIncomplete,
        status: onboardingKycStepStatusFromRaw(onboardingStatus?.kyc?.poi_status),
        link: getHomeUrl(isV1Signup, "poi", isWalletAccount, fromParam, isTncAccepted),
      },
      {
        id: "poa",
        title: t("kyc.proofOfAddress"),
        icon: "/icons/poa.svg",
        completed: isPoaCompleted,
        rejected: isPoaRejected,
        inReview: isPoaInReview,
        expired: isPoaIncomplete,
        status: onboardingKycStepStatusFromRaw(onboardingStatus?.kyc?.poa_status),
        link: getHomeUrl(isV1Signup, "poa", isWalletAccount, fromParam, isTncAccepted),
      },
    ],
    [
      t,
      isProfileCompleted,
      isV1Signup,
      isWalletAccount,
      fromParam,
      isTncAccepted,
      isPhoneCompleted,
      isPoiCompleted,
      isPoiRejected,
      isPoiInReview,
      isPoiIncomplete,
      onboardingStatus?.kyc?.poi_status,
      isPoaCompleted,
      isPoaRejected,
      isPoaInReview,
      isPoaIncomplete,
      onboardingStatus?.kyc?.poa_status,
    ],
  )

  const hasIncompleteSteps = Boolean(isPoiIncomplete || isPoaIncomplete)
  const verificationSteps = useMemo(() => {
    return hasIncompleteSteps
      ? allVerificationSteps.filter((step) => {
          if (isPoiIncomplete && step.id === "poi") return true
          if (isPoaIncomplete && step.id === "poa") return true
          return false
        })
      : allVerificationSteps
  }, [hasIncompleteSteps, isPoiIncomplete, isPoaIncomplete, allVerificationSteps])

  const getDescription = () => {
    if (hasIncompleteSteps) {
      if (isPoiIncomplete && isPoaIncomplete) return t("kyc.resubmitIdentityAndAddress")
      if (isPoiIncomplete) return t("kyc.resubmitIdentity")
      if (isPoaIncomplete) return t("kyc.resubmitAddress")
    }

    return t("kyc.completeRemainingSteps")
  }

  const handlePoiPoaExpiredLink = () => {
    if (isPoiIncomplete) window.location.href = getHomeUrl(isV1Signup, "poi")
    else window.location.href = getHomeUrl(isV1Signup, "poa")
  }

  const allStepsVerifiedOrInReview = verificationSteps.every(
    (step) => step.completed || step.inReview,
  )

  const getFailedPoiOrPoaStep = () => {
    const completedOrInReviewSteps = verificationSteps.filter(
      (step) => step.completed || step.inReview,
    )
    const failedStep = verificationSteps.find((step) => step.rejected)

    if (completedOrInReviewSteps.length === verificationSteps.length - 1 && failedStep) {
      return failedStep
    }
    return null
  }

  const failedStep = getFailedPoiOrPoaStep()

  useEffect(() => {
    const links: HTMLLinkElement[] = []

    verificationSteps.forEach((step) => {
      if (step.link) {
        const link = document.createElement("link")
        link.rel = "prefetch"
        link.href = step.link
        document.head.appendChild(link)
        links.push(link)
      }
    })

    return () => {
      links.forEach((link) => {
        if (link.isConnected) link.remove()
      })
    }
  }, [verificationSteps])

  const handleCompleteVerification = () => {
    if (allStepsVerifiedOrInReview) {
      onClose?.()
      return
    }
    if (failedStep?.link) {
      window.location.href = failedStep.link
      return
    }
    const firstIncompleteStep = verificationSteps.find(
      (step) => !step.completed && step.inReview !== true,
    )
    if (firstIncompleteStep?.link) {
      window.location.href = firstIncompleteStep.link
    }
  }

  const getButtonLabel = () => {
    if (allStepsVerifiedOrInReview) {
      return t("kyc.gotIt")
    }
    if (failedStep) {
      if (failedStep.id === "poi") {
        return t("kyc.checkProofOfIdentity")
      }
      if (failedStep.id === "poa") {
        return t("kyc.checkProofOfAddress")
      }
    }
    return t("kyc.continueVerification")
  }

  const statusLabels = {
    verified: t("kyc.verified"),
    inReview: t("kyc.statusInReview"),
    failed: t("kyc.failed"),
    unverified: t("kyc.unverified"),
  }

  const heroBenefits = [
    t("kyc.heroBenefitPlaceOrder"),
    t("kyc.heroBenefitPublishAds"),
    t("kyc.heroBenefitHigherLimits"),
    t("kyc.heroBenefitFasterWithdrawals"),
  ] as [string, string, string, string]

  if (!onboardingStatus) {
    return null
  }

  return (
        <div className="flex h-full w-full flex-col md:flex-row md:overflow-hidden">
      <KycOnboardingVisualPanel
        variant="mobile"
        showDragHandle
        logoAlt={t("kyc.heroLogoAlt")}
        headline={t("kyc.heroHeadline")}
        benefits={heroBenefits}
      />
      <KycOnboardingVisualPanel
        variant="desktop"
        logoAlt={t("kyc.heroLogoAlt")}
        headline={t("kyc.heroHeadline")}
        benefits={heroBenefits}
      />
      <KycOnboardingContentPanel
        title={t("kyc.finishAccountSetup")}
        description={getDescription()}
        steps={verificationSteps}
        buttonLabel={hasIncompleteSteps ? t("kyc.resubmitNow") : getButtonLabel()}
        onButtonClick={hasIncompleteSteps ? handlePoiPoaExpiredLink : handleCompleteVerification}
        onClose={onClose}
        statusLabels={statusLabels}
      />
    </div>
  )
}

export { KycOnboardingSheet }
export default KycOnboardingSheet
