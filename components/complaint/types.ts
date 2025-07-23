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
    id: "no-payment",
    label: "I didn't receive any payment.",
    value: "no_payment",
  },
  {
    id: "less-amount",
    label: "I received less than the agreed amount.",
    value: "less_amount",
  },
  {
    id: "more-amount",
    label: "I received more than the agreed amount.",
    value: "more_amount",
  },
  {
    id: "third-party",
    label: "I've received payment from 3rd party",
    value: "third_party_payment",
  },
]
