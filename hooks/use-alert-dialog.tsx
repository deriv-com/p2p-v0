"use client"

import { useAlertDialogContext } from "@/contexts/alert-dialog-context"
import type { AlertDialogConfig } from "@/types/alert-dialog"

export function useAlertDialog() {
  const { showDialog, hideDialog, isOpen, config } = useAlertDialogContext()

  const showConfirmDialog = (dialogConfig: Omit<AlertDialogConfig, "type">) => {
    showDialog({
      ...dialogConfig,
      type: "confirm",
      confirmText: dialogConfig.confirmText || "Confirm",
      cancelText: dialogConfig.cancelText || "Cancel",
    })
  }

  const showDeleteDialog = (dialogConfig: Omit<AlertDialogConfig, "type">) => {
    showDialog({
      ...dialogConfig,
      type: "delete",
      confirmText: dialogConfig.confirmText || "Delete",
      cancelText: dialogConfig.cancelText || "Cancel",
    })
  }

  const showWarningDialog = (dialogConfig: Omit<AlertDialogConfig, "type">) => {
    showDialog({
      ...dialogConfig,
      type: "warning",
      confirmText: dialogConfig.confirmText || "Continue",
      cancelText: dialogConfig.cancelText || "Cancel",
    })
  }

  const showSuccessDialog = (dialogConfig: Omit<AlertDialogConfig, "type">) => {
    showDialog({
      ...dialogConfig,
      type: "success",
      confirmText: dialogConfig.confirmText || "OK",
      showCancel: dialogConfig.showCancel ?? false,
    })
  }

  return {
    showDialog,
    hideDialog,
    showConfirmDialog,
    showDeleteDialog,
    showWarningDialog,
    showSuccessDialog,
    isOpen,
    config,
  }
}
