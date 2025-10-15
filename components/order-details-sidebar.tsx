"use client"

import { Button } from "@/components/ui/button"
import type { Order } from "@/services/api/api-orders"
import { OrderDetails } from "@/components/order-details"
import Image from "next/image"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import { useEffect } from "react"

interface OrderDetailsSidebarProps {
  isOpen: boolean
  onClose: () => void
  order: Order
}

export default function OrderDetailsSidebar({ isOpen, onClose, order }: OrderDetailsSidebarProps) {
  const isMobile = useIsMobile()
  const { showAlert, hideAlert } = useAlertDialog()

  useEffect(() => {
    if (isOpen && isMobile === false) {
      showAlert({
        title: "Order details",
        content: (
          <div className="overflow-auto max-h-[70vh]">
            <OrderDetails order={order} />
          </div>
        ),
      })
    }
  }, [isOpen, isMobile, order, showAlert, hideAlert])

  useEffect(() => {
    if (isMobile === false && !isOpen) {
      return () => {
        hideAlert()
      }
    }
  }, [isMobile, isOpen, hideAlert])

  if (isMobile === undefined) return null
  if (!isMobile) return null
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
      <div className="bg-white w-full max-w-md h-full flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-xl font-bold">Order details</h2>
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
