export interface ComplaintOption {
  id: string
  label: string
  value: string
}

export interface ComplaintProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (selectedOption: string) => void
  orderId?: string
}

export const COMPLAINT_OPTIONS: ComplaintOption[] = [
  {
    id: "buyer_not_paid",
    label: "I didn't receive any payment.",
    value: "buyer_not_paid",
  },
  {
    id: "buyer_underpaid",
    label: "I received less than the agreed amount.",
    value: "buyer_underpaid",
  },
  {
    id: "buyer_overpaid",
    label: "I received more than the agreed amount.",
    value: "buyer_overpaid",
  },
  {
    id: "buyer_third_party_payment_method",
    label: "I've received payment from 3rd party",
    value: "buyer_third_party_payment_method",
  },
]
