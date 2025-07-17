"use client"
import { Button } from "@/components/ui/button"
import { useAlertDialog } from "@/hooks/use-alert-dialog"

export function AlertDialogExample() {
  const { showConfirmDialog, showDeleteDialog, showWarningDialog, showAlert } = useAlertDialog()

  const handleConfirmExample = () => {
    showConfirmDialog({
      title: "Confirm Action",
      description: "Are you sure you want to proceed with this action?",
      onConfirm: () => {
        console.log("Action confirmed!")
      },
      onCancel: () => {
        console.log("Action cancelled!")
      },
    })
  }

  const handleDeleteExample = () => {
    showDeleteDialog({
      title: "Delete Advertisement",
      description: "This advertisement will be permanently deleted. This action cannot be undone.",
      onConfirm: async () => {
        // Simulate async delete operation
        await new Promise((resolve) => setTimeout(resolve, 1000))
        console.log("Item deleted!")
      },
    })
  }

  const handleWarningExample = () => {
    showWarningDialog({
      description: "This action may affect your trading limits. Do you want to continue?",
      onConfirm: () => {
        console.log("Warning acknowledged!")
      },
    })
  }

  const handleCustomExample = () => {
    showAlert({
      title: "Custom Alert",
      description: "This is a custom alert with custom button text.",
      confirmText: "Yes, I agree",
      cancelText: "No, go back",
      onConfirm: () => {
        console.log("Custom action confirmed!")
      },
    })
  }

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-xl font-semibold">Alert Dialog Examples</h2>
      <div className="flex flex-wrap gap-4">
        <Button onClick={handleConfirmExample}>Show Confirm Dialog</Button>
        <Button onClick={handleDeleteExample} variant="destructive">
          Show Delete Dialog
        </Button>
        <Button onClick={handleWarningExample} variant="outline">
          Show Warning Dialog
        </Button>
        <Button onClick={handleCustomExample} variant="secondary">
          Show Custom Dialog
        </Button>
      </div>
    </div>
  )
}
