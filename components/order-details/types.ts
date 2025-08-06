import type { Order } from '@/services/api/api-orders'

export interface OrderDetailsProps {
  order: Order
}

export interface OrderDetailItemProps {
  label: string
  value: string
  testId?: string
}
