"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogFooter } from "@/components/ui/alert-dialog"
import type { AlertDialogConfig, AlertDialogContextType } from "@/types/alert-dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
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
        <AlertDialogContent>
          <div className="flex bg-slate-75 flex-col my-[24px]">
            <div style={{ alignSelf: "end" }}>
              <Button onClick={hideAlert} size="sm" variant="ghost">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div style={{ alignSelf: "center" }}>
              {config.type === "success" ? (
                <Image src="/icons/success-icon.png" alt="Success" width={56} height={56} className="w-14 h-14" />
              ) : (
                <Image src="/icons/warning-icon.png" alt="Warning" width={56} height={56} className="w-14 h-14" />
              )}
            </div>
          </div>
          <div className="mx-[32px] my-[24px]">
            {config.title && <div className="mb-8 font-bold text-2xl">{config.title}</div>}
            {config.description && <div className="mb-4">{config.description}</div>}
          </div>
          <AlertDialogFooter className="mx-[32px] my-[24px]">
            <AlertDialogAction onClick={handleConfirm} className="w-full">
              {config.confirmText || "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
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
