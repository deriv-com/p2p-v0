"use client"

import Image from "next/image"
import type { Ad } from "../types"

interface AdActionsMenuProps {
  ad: Ad
  variant: "dropdown" | "drawer"
  onEdit: (ad: Ad) => void
  onToggleStatus: (ad: Ad) => void
  onDelete: (adId: string) => void
}

export function AdActionsMenu({ ad, onEdit, onToggleStatus, onDelete }: AdActionsMenuProps) {
  const isActive = ad.is_active !== undefined ? ad.is_active : ad.status === "Active"
  return (
    <>
      <button
        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm cursor-pointer"
        onClick={() => onEdit(ad)}
      >
        <Image src="/icons/pencil.png" alt="Edit" width={16} height={16} />
        Edit
      </button>
      <button
        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm hover:bg-gray-100 rounded-sm cursor-pointer"
        onClick={() => onToggleStatus(ad)}
      >
        <Image src="/icons/deactivate.png" alt="Toggle status" width={16} height={16} />
        {isActive ? "Deactivate" : "Activate"}
      </button>
      <button
        className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-red-600 hover:bg-gray-100 rounded-sm cursor-pointer"
        onClick={() => onDelete(ad.id)}
      >
        <Image src="/icons/trash-red.png" alt="Delete" width={16} height={16} />
        <span className="text-red-600">Delete</span>
      </button>
    </>
  )
}
