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
    id: "no-payment",
    value: "no_payment",
    label: "I didn't receive any payment.",
  },
  {
    id: "less-amount",
    value: "less_amount",
    label: "I received less than the agreed amount.",
  },
  {
    id: "more-amount",
    value: "more_amount",
    label: "I received more than the agreed amount.",
  },
  {
    id: "third-party",
    value: "third_party",
    label: "I've received payment from 3rd party",
  },
]
