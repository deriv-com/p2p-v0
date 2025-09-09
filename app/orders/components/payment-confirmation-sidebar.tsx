"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import Image from "next/image"
import { formatAmount } from "@/lib/utils"
import type { Order } from "@/services/api/api-orders"
import { Input } from "@/components/ui/input"
import { OrdersAPI } from "@/services/api"
import { cn } from "@/lib/utils"
import { TriangleAlert } from "lucide-react"

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
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!order) return null

  const handleFileSelect = (file: File) => {
    setFileError(null)

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("File must be 5MB or smaller.")
      return
    }

    setSelectedFile(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async () => {
    if (!selectedFile) return

    try {
      const base64 = await fileToBase64(selectedFile)
      await OrdersAPI.sendChatMessage(order.id, "", base64, true)

      onConfirm()
    } catch (error) {
      console.error("Error uploading file to chat:", error)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setFileError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const currencySymbol = order.payment_currency
  const amount = formatAmount(order.payment_amount)
  const sellerName = order.type === "buy" ? order.advert?.user?.nickname : order.user?.nickname

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-bold">Confirm your payment</SheetTitle>
            </div>
          </SheetHeader>

          <div className="flex-1 p-4 space-y-6">
            <p className="text-sm text-gray-600">
              Ensure you've paid {currencySymbol} {amount} to {sellerName} and upload the receipt as proof of payment.
            </p>

            <div
              className={cn(
                "border border-dashed rounded-sm p-8 text-center transition-colors ",
                fileError ? "border-error" : "border-slate-500",
              )}
            >
              <Input
                ref={fileInputRef}
                type="file"
                accept=".jpeg,.jpg,.png,.pdf"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                      <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                    <Image src="/icons/upload-icon.png" alt="Upload" width={48} height={48} className="text-gray-400" />
                    <span className="mt-2 text-sm font-medium text-gray-700 hover:text-gray-900">Upload file</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">JPEG, JPG, PNG, PDF (up to 5MB)</p>
                </div>
              )}
            </div>

            {fileError && <div className="text-error text-xs">{fileError}</div>}

            <Alert variant="warning">
              <TriangleAlert className="h-4 w-4" />
              <AlertDescription>Providing fraudulent documents will result in a permanent ban.</AlertDescription>
            </Alert>
          </div>
          <div className="p-4 pt-0">
            <Button variant="default" onClick={handleSubmit} disabled={!selectedFile || isLoading} className="w-full">
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
