"use client"

import Image from "next/image"
import type { Ad } from "../types"
import { Button } from "@/components/ui/button"

interface AdActionsMenuProps {
  ad: Ad
  onEdit: (ad: Ad) => void
  onToggleStatus: (ad: Ad) => void
  onDelete: (adId: string) => void
}

export function AdActionsMenu({ ad, onEdit, onToggleStatus, onDelete }: AdActionsMenuProps) {
  const isActive = ad.is_active !== undefined ? ad.is_active : ad.status === "Active"
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="hover:bg-transparent font-normal justify-start text-grayscale-600 my-1"
        onClick={() => onEdit(ad)}
      >
        <Image src="/icons/pencil.png" alt="Edit" width={16} height={16} />
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="hover:bg-transparent font-normal justify-start text-grayscale-600 my-1"
        onClick={() => onToggleStatus(ad)}
      >
        <Image src="/icons/deactivate.png" alt="Toggle status" width={16} height={16} />
        {isActive ? "Deactivate" : "Activate"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="hover:bg-transparent font-normal justify-start my-1"
        onClick={() => onDelete(ad.id)}
      >
        <Image src="/icons/trash-red.png" alt="Delete" width={16} height={16} />
        <span className="text-disputed-icon">Delete</span>
      </Button>
    </>
  )
}
