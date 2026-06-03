import type React from "react"

export interface AlertDialogConfig {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  type?: "warning" | "info" | "error" | "success"
  size?: "default" | "kycOnboarding"
  contentClassName?: string
  content?: React.ReactNode
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  onClose?: () => void
  hideCloseButton?: boolean
}

export interface AlertDialogContextType {
  showAlert: (config: AlertDialogConfig) => void
  hideAlert: () => void
  isOpen: boolean
}
