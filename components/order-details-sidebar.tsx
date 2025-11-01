"use client"

import { Button } from "@/components/ui/button"
import type { Order } from "@/services/api/api-orders"
import { OrderDetails } from "@/components/order-details"
import Image from "next/image"
import { useTranslations } from "@/lib/i18n/use-translations"

interface OrderDetailsSidebarProps {
  isOpen: boolean
  onClose: () => void
  order: Order
}

export default function OrderDetailsSidebar({ isOpen, onClose, order }: OrderDetailsSidebarProps) {
  const { t } = useTranslations()

  if (!isOpen) return
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-xl font-bold">{t("orderDetails.title")}</h2>
          <Button onClick={onClose} variant="ghost" size="sm" className="bg-grayscale-300 px-1">
            <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <OrderDetails order={order} />
        </div>
      </div>
    </div>
  )
}
