export interface AlertDialogConfig {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  type?: "warning" | "info" | "error" | "success"
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

export interface AlertDialogContextType {
  showAlert: (config: AlertDialogConfig) => void
  hideAlert: () => void
  isOpen: boolean
}
