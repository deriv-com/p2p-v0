"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert } from "@/components/ui/alert"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { X, Upload, AlertTriangle } from "lucide-react"
import Image from "next/image"
import { formatAmount } from "@/lib/utils"
import type { Order } from "@/services/api/api-orders"

interface PaymentConfirmationSidebarProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  order: Order | null
  isLoading?: boolean
}

export const PaymentConfirmationSidebar = ({
  isOpen,
  onClose,
  onConfirm,
  order,
  isLoading = false,
}: PaymentConfirmationSidebarProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  if (!order) return null

  const handleFileSelect = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return
    }

    setSelectedFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleSubmit = () => {
    if (selectedFile) {
      onConfirm()
    }
  }

  const currencySymbol = order.payment_currency
  const amount = formatAmount(order.payment_amount)
  const sellerName = order.type === "buy" ? order.advert?.user?.nickname : order.user?.nickname

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">Confirm your payment</SheetTitle>
              <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 px-6 pb-6 space-y-6">
            <p className="text-sm text-gray-600">
              Ensure you've paid {currencySymbol} {amount} to {sellerName} and upload the receipt as proof of payment.
            </p>

            <div
              className="border-2 border-dashed rounded-lg p-8 text-center transition-colors border-slate-500"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept=".jpeg,.jpg,.png,.pdf"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <Image src="/icons/success-checkmark.png" alt="Success" width={24} height={24} />
                  </div>
                  <p className="font-medium text-green-700">{selectedFile.name}</p>
                  <p className="text-xs text-green-600">File uploaded successfully</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-12 h-12 mx-auto">
                    <Upload className="w-full h-full text-gray-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-neutral-10">Upload file</p>
                    <p className="text-xs text-gray-500 mt-1">JPEG, JPG, PNG, PDF (up to 5MB).</p>
                  </div>
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer bg-transparent" asChild>
                      <span>Choose file</span>
                    </Button>
                  </label>
                </div>
              )}
            </div>
            <Alert variant="warning" className="flex items-start gap-2 mb-6">
              <Image src="/icons/warning-icon-new.png" alt="Warning" height={24} width={24} />
              <div className="text-sm text-orange-800">
                Providing fraudulent documents will result in a permanent ban.
              </div>
            </Alert>
          </div>
          <div className="p-6 pt-0">
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent mr-2"></div>
                  Processing...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
