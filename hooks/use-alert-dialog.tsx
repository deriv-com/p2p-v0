"use client"

import { useAlertDialog as useAlertDialogContext } from "@/contexts/alert-dialog-context"
import type { AlertDialogConfig } from "@/types/alert-dialog"

export function useAlertDialog() {
  const { showAlert, hideAlert, isOpen } = useAlertDialogContext()

  const showConfirmDialog = (config: AlertDialogConfig) => {
    showAlert({
      confirmText: "Confirm",
      cancelText: "Cancel",
      ...config,
    })
  }

  const showDeleteDialog = (config: Omit<AlertDialogConfig, "variant">) => {
    showAlert({
      title: "Delete Item",
      description: "Are you sure you want to delete this item? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
      type: "warning",
      ...config,
    })
  }

  const showWarningDialog = (config: AlertDialogConfig) => {
    showAlert({
      title: "Warning",
      confirmText: "Continue",
      cancelText: "Cancel",
      ...config,
    })
  }

  return {
    showAlert,
    showConfirmDialog,
    showDeleteDialog,
    showWarningDialog,
    hideAlert,
    isOpen,
  }
}
