"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { useIsMobile } from "@/lib/hooks/use-is-mobile"

interface AlertConfig {
  title: string
  description: string
  confirmText?: string
  onConfirm?: () => void
  type?: "success" | "warning" | "info"
}

interface AlertDialogContextType {
  showAlert: (config: AlertConfig) => void
  hideAlert: () => void
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined)

export function AlertDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<AlertConfig | null>(null)
  const isMobile = useIsMobile()

  const showAlert = (alertConfig: AlertConfig) => {
    setConfig(alertConfig)
    setIsOpen(true)
  }

  const hideAlert = () => {
    setIsOpen(false)
    setConfig(null)
  }

  const handleConfirm = () => {
    config?.onConfirm?.()
    hideAlert()
  }

  const getIcon = () => {
    switch (config?.type) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-red-500" />
      case "info":
        return <Info className="h-6 w-6 text-blue-500" />
      default:
        return <AlertTriangle className="h-6 w-6 text-red-500" />
    }
  }

  const content = config ? (
    <>
      <div className="flex items-start gap-4">
        {getIcon()}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
          <p className="text-gray-600 mb-6">{config.description}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={hideAlert} className="p-1 h-auto">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleConfirm} variant="black" className="px-6">
          {config.confirmText || "OK"}
        </Button>
      </div>
    </>
  ) : null

  return (
    <AlertDialogContext.Provider value={{ showAlert, hideAlert }}>
      {children}

      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="p-6">
            {content}
          </SheetContent>
        </Sheet>
      ) : (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogContent className="max-w-md">{content}</AlertDialogContent>
        </AlertDialog>
      )}
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
