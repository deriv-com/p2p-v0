export enum OrderErrorAction {
  Dismiss = "dismiss",
  Retry = "retry",
  OpenLiveChat = "openLiveChat",
  ViewOtherAds = "viewOtherAds",
  ManageBlocked = "manageBlocked",
  ViewActiveOrder = "viewActiveOrder",
  ViewProfile = "viewProfile",
  AdjustAmount = "adjustAmount",
  ConfirmRateSlippage = "confirmRateSlippage",
  ViewOrders = "viewOrders",
  VerifyAccount = "verifyAccount",
  CompleteAssessment = "completeAssessment",
  GoBack = "goBack",
}

export interface OrderErrorMessage {
  title: string
  message: string
  primaryCta: string
  primaryAction: OrderErrorAction
  secondaryCta?: string
  secondaryAction?: OrderErrorAction
}
