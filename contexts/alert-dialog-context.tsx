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
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, X } from "lucide-react"

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
          <AlertDialogHeader className="flex justify-between my-[24px]">
            <div
              className={`${config.type === "success" ? "bg-success-bg" : "bg-warning-bg"
                } rounded-[80px] p-2 flex items-center justify-center w-[56px] h-[56px]`}
            >
              {config.type === "success" ? (
                <CheckCircle className="h-8 w-8 text-success-icon" />
              ) : (
                <AlertCircle className="h-8 w-8 text-warning-icon" />
              )}
            </div>

            <Button
              onClick={hideAlert}
                size="sm"
              variant="ghost"
            >
              <X className="h-5 w-5" />
            </Button>
          
          </AlertDialogHeader>
          <div className="mx-[32px] my-[24px]">
                  {config.title && <AlertDialogTitle className="mb-[32px]">{config.title}</AlertDialogTitle>}
                    {config.description && <AlertDialogDescription>{config.description}
                    </AlertDialogDescription>}
        </div>
          <AlertDialogFooter className="mx-[32px] my-[24px]">
            <AlertDialogAction
              onClick={handleConfirm}
                className="w-full"
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
