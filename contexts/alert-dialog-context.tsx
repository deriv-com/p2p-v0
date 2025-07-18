"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface AlertDialogState {
  isOpen: boolean
  title: string
  description: string
  type: "success" | "error" | "warning" | "info"
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
}

interface AlertDialogContextType {
  showAlert: (config: Omit<AlertDialogState, "isOpen">) => void
  showConfirmDialog: (config: Omit<AlertDialogState, "isOpen">) => void
  showDeleteDialog: (config: Omit<AlertDialogState, "isOpen" | "type">) => void
  showWarningDialog: (config: Omit<AlertDialogState, "isOpen" | "type">) => void
  hideAlert: () => void
  isOpen: boolean
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined)

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AlertDialogState>({
    isOpen: false,
    title: "",
    description: "",
    type: "info",
    confirmText: "OK",
    cancelText: "Cancel",
    showCancel: false,
  })

  const showAlert = (config: Omit<AlertDialogState, "isOpen">) => {
    setState({
      ...config,
      isOpen: true,
      confirmText: config.confirmText || "OK",
      cancelText: config.cancelText || "Cancel",
      showCancel: config.showCancel || false,
    })
  }

  const showConfirmDialog = (config: Omit<AlertDialogState, "isOpen">) => {
    setState({
      ...config,
      isOpen: true,
      confirmText: config.confirmText || "Confirm",
      cancelText: config.cancelText || "Cancel",
      showCancel: true,
    })
  }

  const showDeleteDialog = (config: Omit<AlertDialogState, "isOpen" | "type">) => {
    setState({
      ...config,
      type: "error",
      isOpen: true,
      confirmText: config.confirmText || "Delete",
      cancelText: config.cancelText || "Cancel",
      showCancel: true,
    })
  }

  const showWarningDialog = (config: Omit<AlertDialogState, "isOpen" | "type">) => {
    setState({
      ...config,
      type: "warning",
      isOpen: true,
      confirmText: config.confirmText || "Continue",
      cancelText: config.cancelText || "Cancel",
      showCancel: config.showCancel !== undefined ? config.showCancel : true,
    })
  }

  const hideAlert = () => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }

  const handleConfirm = () => {
    state.onConfirm?.()
    hideAlert()
  }

  const handleCancel = () => {
    state.onCancel?.()
    hideAlert()
  }

  const getIconSrc = () => {
    switch (state.type) {
      case "success":
        return "/icons/success_icon_round.png"
      case "error":
        return "/icons/error_icon_round.png"
      case "warning":
        return "/icons/warning-icon.png"
      default:
        return "/icons/info-icon.png"
    }
  }

  return (
    <AlertDialogContext.Provider
      value={{
        showAlert,
        showConfirmDialog,
        showDeleteDialog,
        showWarningDialog,
        hideAlert,
        isOpen: state.isOpen,
      }}
    >
      {children}
      <AlertDialog open={state.isOpen} onOpenChange={hideAlert}>
        <AlertDialogContent className="p-0 gap-0 overflow-hidden">
          <div className="bg-gray-100 relative p-6 pb-12">
            <div className="flex justify-center">
              <Image
                src={getIconSrc() || "/placeholder.svg"}
                alt={state.type}
                width={56}
                height={56}
                className="w-14 h-14"
              />
            </div>
            <Button
              onClick={hideAlert}
              variant="ghost"
              size="sm"
              className="absolute top-6 right-6 text-black hover:text-gray-700 p-2"
              aria-label="Close"
            >
              <Image src="/icons/button-close.png" alt="Close" width={48} height={48} className="w-12 h-12" />
            </Button>
          </div>
          <div className="p-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center text-xl font-semibold mb-2">{state.title}</AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-600 whitespace-pre-line">
                {state.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6">
              {state.showCancel && (
                <Button variant="outline" onClick={handleCancel} className="flex-1 bg-transparent">
                  {state.cancelText}
                </Button>
              )}
              <AlertDialogAction onClick={handleConfirm} className="flex-1">
                {state.confirmText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  )
}

export function useAlertDialog() {
  const context = useContext(AlertDialogContext)
  if (context === undefined) {
    throw new Error("useAlertDialog must be used within an AlertDialogProvider")
  }
  return context
}
