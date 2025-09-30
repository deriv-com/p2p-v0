"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import type { AlertDialogConfig, AlertDialogContextType } from "@/types/alert-dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined)

interface AlertDialogProviderProps {
  children: React.ReactNode
}

export function AlertDialogProvider({ children }: AlertDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<AlertDialogConfig>({})
  const isMobile = useIsMobile()

  const showAlert = useCallback((alertConfig: AlertDialogConfig) => {
    setConfig(alertConfig)
    setIsOpen(true)
  }, [])

  const hideAlert = useCallback(() => {
    setIsOpen(false)
    setConfig({})
  }, [])

  const handleConfirm = useCallback(async () => {
    if (config.onConfirm) {
      await config.onConfirm()
    }
    hideAlert()
  }, [config.onConfirm, hideAlert])

  const handleCancel = useCallback(() => {
    if (config.onCancel) {
      config.onCancel()
    }
    hideAlert()
  }, [config.onCancel, hideAlert])

  const contextValue: AlertDialogContextType = {
    showAlert,
    hideAlert,
    isOpen,
  }

  const renderDesktopContent = () => (
    <>
      {(config.type === "success" || config.type === "warning") && (
        <div className="bg-gray-100 flex flex-col py-[24px] rounded-t-[32px]">
          <div style={{ alignSelf: "end" }} className="px-6 mt-6">
            <Button onClick={hideAlert} size="sm" variant="ghost">
              <Image src="/icons/close-icon.png" alt="Close" width={20} height={20} className="size-5" />
            </Button>
          </div>
          <div style={{ alignSelf: "center" }} className="mb-4">
            {config.type === "success" && (
              <Image src="/icons/success-icon.png" alt="Success" width={56} height={56} className="size-14" />
            )}
            {config.type === "warning" && (
              <Image src="/icons/warning-icon.png" alt="Warning" width={56} height={56} className="size-14" />
            )}
          </div>
        </div>
      )}
      <div className="px-8 py-6">
        {!config.type && (<div className="flex justify-end">
          <Button onClick={hideAlert} size="sm" variant="ghost">
            <Image src="/icons/close-icon.png" alt="Close" width={20} height={20} className="size-5" />
          </Button>
        </div>)}
        {config.title && <div className="mb-8 font-bold text-2xl">{config.title}</div>}
        {config.description && <div className="mb-4 text-grayscale-100">{config.description}</div>}
        <div className="flex flex-col gap-2 mt-6">
         {config.cancelText && (
          <Button onClick={handleCancel} variant="primary" className="w-full">
            {config.cancelText}
          </Button>
          )}
          <Button onClick={handleConfirm} variant={config.cancelText ? "outline" : "black"} className="w-full">
            {config.confirmText || "Continue"}
          </Button>
        </div>
      </div>
    </>
  )

  const renderMobileContent = () => (
    <>
      {config.type === "success" || config.type === "warning" ? (
        <div className="bg-gray-100 flex flex-col py-[24px] rounded-t-[32px]">
          <div style={{ alignSelf: "center" }} className="mb-4 mt-6">
            {config.type === "success" && (
              <Image src="/icons/success-icon.png" alt="Success" width={56} height={56} className="size-14" />
            )}
            {config.type === "warning" && (
              <Image src="/icons/warning-icon.png" alt="Warning" width={56} height={56} className="size-14" />
            )}
          </div>
        </div>
      ) : null}
      <div className="p-6">
        {config.title && <div className="mb-8 font-bold text-2xl">{config.title}</div>}
        {config.description && <div className="mb-4 text-grayscale-100">{config.description}</div>}
        <div className="flex flex-col gap-2 mt-6">
          {config.cancelText && (
          <Button onClick={handleCancel} variant="black" className="w-full">
            {config.cancelText}
          </Button>
          )}
          <Button onClick={handleConfirm} variant={config.cancelText ? "outline" : "black"} className="w-full">
            {config.confirmText || "Continue"}
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <AlertDialogContext.Provider value={contextValue}>
      {children}

      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="p-0 rounded-t-[32px]">
            {renderMobileContent()}
          </SheetContent>
        </Sheet>
      ) : (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTitle></AlertDialogTitle>
          <AlertDialogContent className="p-0">
            <AlertDialogDescription>{renderDesktopContent()}</AlertDialogDescription>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </AlertDialogContext.Provider>
  )
}

export function useAlertDialog(): AlertDialogContextType {
  const context = useContext(AlertDialogContext)
  if (context === undefined) {
    throw new Error("useAlertDialog must be used within an AlertDialogProvider")
  }
  return context
}
