"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { formatAmount } from "@/lib/utils"
import type { Order } from "@/services/api/api-orders"
import { Input } from "@/components/ui/input"
import { OrdersAPI } from "@/services/api"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"
import { useTranslations } from "@/lib/i18n/use-translations"

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
  const { t } = useTranslations()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploadLoading, setIsUploadLoading] = useState<boolean>(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  if (!order) return null

  const handleFileSelect = (file: File) => {
    setFileError(null)

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError(t("orders.fileTooLarge"))
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
      setIsUploadLoading(true)
      const base64 = await fileToBase64(selectedFile)
      await OrdersAPI.sendChatMessage(order.id, "", base64, true)

      onConfirm()
      setIsUploadLoading(false)
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

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/80" onClick={onClose} />
      <div
        className={`fixed inset-y-0 right-0 z-50 bg-white shadow-xl flex flex-col ${
          isMobile ? "inset-0 w-full" : "w-full"
        }`}
      >
        <div className="max-w-xl mx-auto flex flex-col w-full h-full">
          <div className="flex items-center justify-end px-4 py-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="bg-grayscale-300 px-1">
              <Image src="/icons/close-circle.png" alt="Close" width={24} height={24} />
            </Button>
          </div>

          <div className="flex items-center gap-4 p-4 pb-0">
            <h2 className="text-2xl font-bold">{t("orders.confirmPayment")}</h2>
          </div>
          <div className="px-4">
            <Alert variant="warning" className="flex items-center gap-2 mt-4 mb-0">
              <Image src="/icons/warning-icon-new.png" alt="Warning" height={24} width={24} />
              <AlertDescription>{t("orders.fraudWarning")}</AlertDescription>
            </Alert>
          </div>
          <div className="flex-1 md:flex-none p-4 space-y-2 overflow-y-auto">
            <p className="text-sm text-gray-600">
              {t("orders.ensurePayment", { amount, currency: currencySymbol, name: sellerName })}
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
                    <span className="my-2 text-sm font-bold text-neutral-10">{t("orders.uploadProof")}</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">{t("orders.fileTypes")}</p>
                </div>
              )}
            </div>

            {fileError && <div className="text-error text-xs">{fileError}</div>}
          </div>
          <div className="p-4 pt-0 md:pt-4 flex justify-end">
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={!selectedFile || isLoading || isUploadLoading}
              className="w-full md:w-auto"
            >
              {isLoading || isUploadLoading ? (
                <Image src="/icons/spinner.png" alt="Loading" width={20} height={20} className="animate-spin" />
              ) : (
                t("orders.submit")
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
