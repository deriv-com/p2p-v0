"use client"

import Image from "next/image"
import { useAlertDialog } from "@/hooks/use-alert-dialog"
import { Button } from "@/components/ui/button"

export default function VerifiedBadge() {
  const { showAlert } = useAlertDialog()

  const handleClick = () => {
    showAlert({
      title: "Fully verified account",
      description:
        "This user has completed all required verification steps, including email, phone number, identity (KYC), and address verification. You can trade with confidence knowing this account is verified.",
      confirmText: "OK",
      type: "info",
    })
  }

  return (
    <Button onClick={handleClick}>
      <Image src="/icons/verified-badge.png" alt="Verified" width={18} height={18} />
    </Button>
  )
}
