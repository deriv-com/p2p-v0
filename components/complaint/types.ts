export interface ComplaintOption {
  id: string
  value: string
  label: string
}

export interface ComplaintProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: () => void
  orderId: string
}

export const COMPLAINT_OPTIONS: ComplaintOption[] = [
  {
    id: "buyer-not-paid",
    value: "buyer_not_paid",
    label: "I didn't receive any payment.",
    type: "seller"
  },
  {
    id: "buyer-underpaid",
    value: "buyer_underpaid",
    label: "I received less than the agreed amount.",
    type: "seller"
  },
  {
    id: "buyer-overpaid",
    value: "buyer_overpaid",
    label: "I received more than the agreed amount.",
    type: "seller"
  },
  {
    id: "buyer-third_party-payment-method",
    value: "buyer_third_party_payment_method",
    label: "I've received payment from 3rd party.",
    type: "seller"
  },
  {
    id: "seller-not-released",
    value: "seller_not_released",
    label: "I’ve made the payment, but the seller hasn’t released the funds.",
    type: "buyer"
  },
  {
    id: "buyer-underpaid",
    value: "buyer_underpaid",
    label: "I couldn’t complete the full payment.",
    type: "buyer"
  },
  {
    id: "buyer-overpaid",
    value: "buyer_overpaid",
    label: "I paid more than the agreed amount.",
    type: "buyer"
  },
]
