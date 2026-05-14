import { OrderErrorAction, type OrderErrorMessage } from "./order-error-actions"

type Translator = (key: string, params?: Record<string, string | number>) => string

export interface OrderErrorMapCtx {
  isBuyAdvert?: boolean
  accountCurrency?: string
  paymentCurrency?: string
  detail?: Record<string, unknown> | null
  payDisplay?: string
  accDisplay?: string
}

export function mapOrderError(
  code: string,
  t: Translator,
  _ctx: OrderErrorMapCtx = {},
): OrderErrorMessage {
  switch (code) {
    case "OrderAdvertiserBlocked":
      return {
        title: t("order.advertiserBlockedTitle"),
        message: t("order.advertiserBlockedMessage"),
        primaryCta: t("order.manageBlockedUsers"),
        primaryAction: OrderErrorAction.ManageBlocked,
        secondaryCta: t("order.viewOtherAds"),
        secondaryAction: OrderErrorAction.ViewOtherAds,
      }

    case "OrderAdvertiserFundTransferError":
      return {
        title: t("order.transferUnsuccessfulTitle"),
        message: t("order.transferUnsuccessfulMessage"),
        primaryCta: t("order.viewOtherAds"),
        primaryAction: OrderErrorAction.ViewOtherAds,
        secondaryCta: t("order.tryAgain"),
        secondaryAction: OrderErrorAction.Retry,
      }

    case "OrderAdvertiserNotOnline":
      return {
        title: t("order.advertiserOfflineTitle"),
        message: t("order.advertiserOfflineMessage"),
        primaryCta: t("common.gotIt"),
        primaryAction: OrderErrorAction.Dismiss,
      }

    case "OrderAdvertiserScheduleUnavailable":
      return {
        title: t("order.advertiserUnavailableTitle"),
        message: t("order.advertiserUnavailableMessage"),
        primaryCta: t("order.viewOtherAds"),
        primaryAction: OrderErrorAction.ViewOtherAds,
        secondaryCta: t("common.close"),
        secondaryAction: OrderErrorAction.Dismiss,
      }

    case "OrderAdvertNotFound":
      return {
        title: t("order.adNotAvailableTitle"),
        message: t("order.adNotAvailableMessage"),
        primaryCta: t("order.viewOtherAds"),
        primaryAction: OrderErrorAction.ViewOtherAds,
        secondaryCta: t("common.close"),
        secondaryAction: OrderErrorAction.Dismiss,
      }

    case "OrderAdvertOwn":
      return {
        title: t("order.ownAdTitle"),
        message: t("order.ownAdMessage"),
        primaryCta: t("order.viewOtherAds"),
        primaryAction: OrderErrorAction.ViewOtherAds,
        secondaryCta: t("common.close"),
        secondaryAction: OrderErrorAction.Dismiss,
      }

    case "OrderAdvertPrivate":
      return {
        title: t("order.adRestrictedTitle"),
        message: t("order.adPrivateMessage"),
        primaryCta: t("order.viewOtherAds"),
        primaryAction: OrderErrorAction.ViewOtherAds,
        secondaryCta: t("common.close"),
        secondaryAction: OrderErrorAction.Dismiss,
      }

    case "OrderAdvertUnlisted":
      return {
        title: t("order.adNotAvailableTitle"),
        message: t("order.adUnlistedMessage"),
        primaryCta: t("order.viewOtherAds"),
        primaryAction: OrderErrorAction.ViewOtherAds,
        secondaryCta: t("common.close"),
        secondaryAction: OrderErrorAction.Dismiss,
      }

    case "OrderUserNotFavourite":
      return {
        title: t("order.adRestrictedTitle"),
        message: t("order.userNotFavouriteMessage"),
        primaryCta: t("order.viewOtherAds"),
        primaryAction: OrderErrorAction.ViewOtherAds,
        secondaryCta: t("common.close"),
        secondaryAction: OrderErrorAction.Dismiss,
      }

    case "OrderExists":
      // Hardcoded English here mirrors today's inline branch — Phase 5 will i18n.
      return {
        title: "Active order detected",
        message: t("order.orderExists"),
        primaryCta: "Try different ad",
        primaryAction: OrderErrorAction.ViewOtherAds,
        secondaryCta: "View order",
        secondaryAction: OrderErrorAction.ViewActiveOrder,
      }

    case "OrderVerificationTempLock":
      return {
        title: t("order.verificationLockedTitle"),
        message: t("order.verificationLockedDescription"),
        primaryCta: t("common.gotIt"),
        primaryAction: OrderErrorAction.Dismiss,
        secondaryCta: t("common.close"),
        secondaryAction: OrderErrorAction.Dismiss,
      }

    case "v1InsufficientFunds":
      return {
        title: t("order.insufficientFunds"),
        message: t("order.insufficientFundsDescription"),
        primaryCta: t("order.viewOtherAds"),
        primaryAction: OrderErrorAction.ViewOtherAds,
        secondaryCta: t("common.close"),
        secondaryAction: OrderErrorAction.Dismiss,
      }

    case "OrderCountryInvalid":
      return {
        title: t("order.adNotAvailableTitle"),
        message: t("order.adCountryInvalidDescription"),
        primaryCta: t("order.viewOtherAds"),
        primaryAction: OrderErrorAction.ViewOtherAds,
      }

    case "v1DebitFailed":
      return {
        title: t("order.adNotAvailableTitle"),
        message: t("order.adNotAvailableDescription"),
        primaryCta: t("order.viewOtherAds"),
        primaryAction: OrderErrorAction.ViewOtherAds,
      }

    case "OrderExchangeRateRequired":
      return {
        title: t("order.exchangeRateRequiredTitle"),
        message: t("order.exchangeRateRequiredDescription"),
        primaryCta: t("order.exchangeRateRequiredCta"),
        primaryAction: OrderErrorAction.AdjustAmount,
      }

    case "UserReadOnly":
      return {
        title: t("order.userReadOnlyTitle"),
        message: t("order.userReadOnlyDescription"),
        primaryCta: t("order.userReadOnlyOpenChat"),
        primaryAction: OrderErrorAction.OpenLiveChat,
        secondaryCta: t("order.userReadOnlyMaybeLater"),
        secondaryAction: OrderErrorAction.Dismiss,
      }

    case "DuplicateRequestDetected":
      return {
        title: t("order.duplicateRequestTitle"),
        message: t("order.duplicateRequestDescription"),
        primaryCta: t("order.viewMyOrders"),
        primaryAction: OrderErrorAction.ViewOrders,
        secondaryCta: t("common.close"),
        secondaryAction: OrderErrorAction.Dismiss,
      }

    case "v1MigrationInProgress":
    case "v1MigrationInProgressOrCompleted":
      return {
        title: t("order.migrationInProgressTitle"),
        message: t("order.migrationInProgressDescription"),
        primaryCta: t("order.tryAgain"),
        primaryAction: OrderErrorAction.Retry,
        secondaryCta: t("common.close"),
        secondaryAction: OrderErrorAction.Dismiss,
      }

    case "AdvertiserTempUnavailable":
      return {
        title: t("order.advertiserTempUnavailableTitle"),
        message: t("order.advertiserTempUnavailableDescription"),
        primaryCta: t("order.viewOtherAds"),
        primaryAction: OrderErrorAction.ViewOtherAds,
        secondaryCta: t("order.tryAgain"),
        secondaryAction: OrderErrorAction.Retry,
      }

    case "OrderAdvertiserFundsInsufficient":
      return {
        title: t("order.advertiserFundsInsufficientTitle"),
        message: t("order.advertiserFundsInsufficientDescription"),
        primaryCta: t("order.viewOtherAds"),
        primaryAction: OrderErrorAction.ViewOtherAds,
        secondaryCta: t("common.close"),
        secondaryAction: OrderErrorAction.Dismiss,
      }

    case "v1WithdrawalLimit":
      return {
        title: t("order.withdrawalLimitTitle"),
        message: t("order.withdrawalLimitDescription"),
        primaryCta: t("order.verifyAccount"),
        primaryAction: OrderErrorAction.VerifyAccount,
        secondaryCta: t("common.close"),
        secondaryAction: OrderErrorAction.Dismiss,
      }

    case "v1FinancialAssessmentRequired":
      return {
        title: t("order.financialAssessmentTitle"),
        message: t("order.financialAssessmentDescription"),
        primaryCta: t("order.completeAssessment"),
        primaryAction: OrderErrorAction.CompleteAssessment,
        secondaryCta: t("common.close"),
        secondaryAction: OrderErrorAction.Dismiss,
      }

    default:
      return {
        title: t("order.unableToCreateOrder"),
        message: code
          ? `${t("order.orderCreationError")} (${code})`
          : t("order.orderCreationError"),
        primaryCta: t("common.ok"),
        primaryAction: OrderErrorAction.Dismiss,
      }
  }
}
