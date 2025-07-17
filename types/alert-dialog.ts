export interface AlertDialogConfig {
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  type?: "success" | "warning" | "delete" | "confirm"
  showCancel?: boolean
  loading?: boolean
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
}

export interface AlertDialogContextType {
  showDialog: (config: AlertDialogConfig) => void
  hideDialog: () => void
  isOpen: boolean
  config: AlertDialogConfig | null
}
