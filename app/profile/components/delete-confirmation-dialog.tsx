"use client"

import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { useEffect } from "react"

interface DeleteConfirmationDialogProps {
  open: boolean
  title: string
  description: string
  isDeleting?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmationDialog({
  open,
  title,
  description,
  isDeleting = false,
  onConfirm,
  onCancel,
}: DeleteConfirmationDialogProps) {
  const { showDeleteDialog, hideAlert } = useAlertDialog()

  useEffect(() => {
    if (open) {
      showDeleteDialog({
        title,
        description,
        confirmText: isDeleting ? "Deleting..." : "Delete",
        onConfirm: () => {
          onConfirm()
          hideAlert()
        },
        onCancel: () => {
          onCancel()
          hideAlert()
        },
      })
    } else {
      hideAlert()
    }
  }, [open, title, description, isDeleting, onConfirm, onCancel, showDeleteDialog, hideAlert])

  // This component now uses the global alert dialog context
  // The actual dialog is rendered by the AlertDialogProvider
  return null
}
