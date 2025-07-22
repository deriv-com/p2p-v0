"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogContent } from "@/components/ui/alert-dialog"
import type { AlertDialogConfig, AlertDialogContextType } from "@/types/alert-dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined)

interface AlertDialogProviderProps {
  children: React.ReactNode
}

export function AlertDialogProvider({ children }: AlertDialogProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<AlertDialogConfig>({})

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

  return (
    <AlertDialogContext.Provider value={contextValue}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="p-0">
          {(config.type === "success" || config.type === "warning") && (
            <div className="bg-gray-100 flex flex-col py-[24px] rounded-t-[32px]">
              <div style={{ alignSelf: "end" }} className="px-6 mt-6">
                <Button onClick={hideAlert} size="sm" variant="ghost">
                  <Image src="/icons/close-icon.png" alt="Close" width={20} height={20} className="w-5 h-5" />
                </Button>
              </div>
              <div style={{ alignSelf: "center" }} className="mb-4">
                {config.type === "success" && (
                  <Image src="/icons/success-icon.png" alt="Success" width={56} height={56} className="w-14 h-14" />
                )}
                {config.type === "warning" && (
                  <Image src="/icons/warning-icon.png" alt="Warning" width={56} height={56} className="w-14 h-14" />
                )}
              </div>
            </div>
          )}

          {(config.type !== "success" && config.type !== "warning") && (
            <div className="flex justify-end px-6 pt-6">
              <Button onClick={hideAlert} size="sm" variant="ghost">
                <Image src="/icons/close-icon.png" alt="Close" width={20} height={20} className="w-5 h-5" />
              </Button>
            </div>
          )}

          <div className="px-8 py-6">
            {config.title && <div className="mb-8 font-bold text-2xl">{config.title}</div>}
            {config.description && <div className="mb-4">{config.description}</div>}
            <div className="mt-6">
              <AlertDialogAction onClick={handleConfirm} className="w-full">
                {config.confirmText || "Continue"}
              </AlertDialogAction>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
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
