"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import type { AlertDialogConfig } from "@/types/alert-dialog"

interface AlertDialogContextType {
  showAlert: (config: AlertDialogConfig) => void
  hideAlert: () => void
  isOpen: boolean
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined)

export function useAlertDialog() {
  const context = useContext(AlertDialogContext)
  if (!context) {
    throw new Error("useAlertDialog must be used within an AlertDialogProvider")
  }
  return context
}

export function AlertDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<AlertDialogConfig | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const showAlert = (alertConfig: AlertDialogConfig) => {
    setConfig(alertConfig)
    setIsOpen(true)
  }

  const hideAlert = () => {
    setIsOpen(false)
    setConfig(null)
  }

  const handleConfirm = () => {
    if (config?.onConfirm) {
      config.onConfirm()
    }
    hideAlert()
  }

  const handleCancel = () => {
    if (config?.onCancel) {
      config.onCancel()
    }
    hideAlert()
  }

  const renderDesktopContent = () => {
    if (!config) return null

    return (
      <>
        {config.type === "success" || config.type === "warning" ? (
          <div className="flex items-center justify-between bg-gray-100 px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              {config.type === "success" && (
                <Image src="/icons/success_icon_round.png" alt="Success" width={24} height={24} />
              )}
              {config.type === "warning" && (
                <Image src="/icons/warning-icon.png" alt="Warning" width={24} height={24} />
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={hideAlert} className="p-1">
              <Image src="/icons/close-icon.png" alt="Close" width={16} height={16} />
            </Button>
          </div>
        ) : (
          <div className="flex justify-end px-6 pt-6">
            <Button variant="ghost" size="sm" onClick={hideAlert} className="p-1">
              <Image src="/icons/close-icon.png" alt="Close" width={16} height={16} />
            </Button>
          </div>
        )}

        <AlertDialogHeader className="px-6 pb-6">
          <AlertDialogTitle className="text-lg font-semibold">{config.title}</AlertDialogTitle>
          {config.description && (
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">{config.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <div className="flex gap-3 px-6 pb-6">
          {config.onCancel && (
            <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
              {config.cancelText || "Cancel"}
            </Button>
          )}
          <AlertDialogAction
            onClick={handleConfirm}
            className={`flex-1 ${
              config.variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-black hover:bg-gray-800 text-white"
            }`}
          >
            {config.confirmText || "Confirm"}
          </AlertDialogAction>
        </div>
      </>
    )
  }

  const renderMobileContent = () => {
    if (!config) return null

    return (
      <>
        {config.type === "success" || config.type === "warning" ? (
          <div className="flex items-center justify-center bg-gray-100 px-6 py-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              {config.type === "success" && (
                <Image src="/icons/success_icon_round.png" alt="Success" width={24} height={24} />
              )}
              {config.type === "warning" && (
                <Image src="/icons/warning-icon.png" alt="Warning" width={24} height={24} />
              )}
            </div>
          </div>
        ) : null}

        <div className="px-6 py-6">
          <h2 className="text-lg font-semibold mb-2">{config.title}</h2>
          {config.description && <p className="text-sm text-gray-600 mb-6">{config.description}</p>}

          <div className="flex gap-3">
            {config.onCancel && (
              <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                {config.cancelText || "Cancel"}
              </Button>
            )}
            <Button
              onClick={handleConfirm}
              className={`flex-1 ${
                config.variant === "destructive"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-black hover:bg-gray-800 text-white"
              }`}
            >
              {config.confirmText || "Confirm"}
            </Button>
          </div>
        </div>
      </>
    )
  }

  if (isMobile) {
    return (
      <AlertDialogContext.Provider value={{ showAlert, hideAlert, isOpen }}>
        {children}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="rounded-t-lg">
            {renderMobileContent()}
          </SheetContent>
        </Sheet>
      </AlertDialogContext.Provider>
    )
  }

  return (
    <AlertDialogContext.Provider value={{ showAlert, hideAlert, isOpen }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="p-0">{renderDesktopContent()}</AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  )
}
