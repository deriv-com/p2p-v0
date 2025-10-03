"use client"

import Image from "next/image"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { Button } from "@/components/ui/button"

export default function VerifiedBadge({ description }) {
  const { showAlert } = useAlertDialog()

  const handleClick = () => {
    showAlert({
      title: "Fully verified account",
      description,
      confirmText: "OK",
      type: "info",
    })
  }

  return (
    <Image onClick={handleClick} src="/icons/verified-badge.png" alt="Verified" width={32} height={32} />
  )
}
