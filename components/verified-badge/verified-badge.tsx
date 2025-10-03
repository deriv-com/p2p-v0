"use client"

import Image from "next/image"
import { useAlertDialog } from "@/hooks/use-alert-dialog"

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
    <button onClick={handleClick} className="cursor-pointer focus:outline-none" aria-label="Verified account">
      <Image src="/icons/verified-badge.png" alt="Verified" width={18} height={18} />
    </button>
  )
}
