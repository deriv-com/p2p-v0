"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import Image from "next/image"
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
import { Button } from "@/components/ui/button"
import type { AlertDialogConfig, AlertDialogContextType } from "@/types/alert-dialog"

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined)

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AlertDialogConfig | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const showDialog = (dialogConfig: AlertDialogConfig) => {
    setConfig(dialogConfig)
    setIsOpen(true)
  }

  const hideDialog = () => {
    setIsOpen(false)
    setConfig(null)
  }

  const handleConfirm = async () => {
    if (config?.onConfirm) {
      try {
        await config.onConfirm()
      } catch (error) {
        console.error("Error in dialog confirm handler:", error)
      }
    }
    hideDialog()
  }

  const handleCancel = () => {
    if (config?.onCancel) {
      config.onCancel()
    }
    hideDialog()
  }

  const contextValue: AlertDialogContextType = {
    showDialog,
    hideDialog,
    isOpen,
    config,
  }

  return (
    <AlertDialogContext.Provider value={contextValue}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center">
              {config?.type === "success" ? (
                <Image
                  src="/icons/success-icon.png"
                  alt="Success"
                  width={56}
                  height={56}
                  className="h-14 w-14"
                  style={{ alignSelf: "center" }}
                />
              ) : (
                <Image src="/icons/warning-icon.png" alt="Warning" width={56} height={56} className="h-14 w-14" />
              )}
            </div>
            {config?.title && <AlertDialogTitle className="text-lg font-semibold">{config.title}</AlertDialogTitle>}
            {config?.description && (
              <AlertDialogDescription className="text-sm text-muted-foreground">
                {config.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
            <AlertDialogAction asChild>
              <Button
                onClick={handleConfirm}
                className={`w-full ${
                  config?.type === "delete"
                    ? "bg-destructive hover:bg-destructive/90"
                    : "bg-primary hover:bg-primary/90"
                }`}
                disabled={config?.loading}
              >
                {config?.loading ? "Loading..." : config?.confirmText || "Confirm"}
              </Button>
            </AlertDialogAction>
            {config?.showCancel !== false && (
              <AlertDialogCancel asChild>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full bg-transparent"
                  disabled={config?.loading}
                >
                  {config?.cancelText || "Cancel"}
                </Button>
              </AlertDialogCancel>
            )}
          </AlertDialogFooter>
          <button
            onClick={hideDialog}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            disabled={config?.loading}
          >
            <Image src="/icons/close-icon.png" alt="Close" width={20} height={20} className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  )
}

export function useAlertDialogContext() {
  const context = useContext(AlertDialogContext)
  if (context === undefined) {
    throw new Error("useAlertDialogContext must be used within an AlertDialogProvider")
  }
  return context
}
