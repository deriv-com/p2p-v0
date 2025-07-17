"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { AlertDialogConfig, AlertDialogContextType } from "@/types/alert-dialog"

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
          <AlertDialogHeader>
            {config.title && <AlertDialogTitle>{config.title}</AlertDialogTitle>}
            {config.description && <AlertDialogDescription>{config.description}</AlertDialogDescription>}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>{config.cancelText || "Cancel"}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={config.variant === "destructive" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
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
