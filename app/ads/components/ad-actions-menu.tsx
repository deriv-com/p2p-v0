"use client"

import Image from "next/image"
import type { Ad } from "../types"
import { Button } from "@/components/ui/button"
import { useTranslations } from "@/lib/i18n/use-translations"

interface AdActionsMenuProps {
  ad: Ad
  onEdit: (ad: Ad) => void
  onToggleStatus: (ad: Ad) => void
  onDelete: (adId: string) => void
  onShare?: (ad: Ad) => void
  variant?: "default" | "drawer"
  isLoading?: boolean
}

export function AdActionsMenu({
  ad,
  onEdit,
  onToggleStatus,
  onDelete,
  onShare,
  variant = "default",
  isLoading = false,
}: AdActionsMenuProps) {
  const { t } = useTranslations()
  const isActive = ad.is_active !== undefined ? ad.is_active : ad.status === "Active"
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="hover:bg-transparent font-normal justify-start text-grayscale-600 my-1"
        onClick={() => onEdit(ad)}
      >
        <Image className="mr-2" src="/icons/edit.svg" alt="Edit" width={14} height={16} />
        {t("myAds.edit")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="hover:bg-transparent font-normal justify-start text-grayscale-600 my-1"
        onClick={() => onShare(ad)}
      >
        <Image className="mr-2" src="/icons/share-icon.svg" alt="Share" width={14} height={16} />
        {t("myAds.share")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="hover:bg-transparent font-normal justify-start text-grayscale-600 my-1"
        onClick={() => onToggleStatus(ad)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="mr-2 w-4 h-4 border-2 border-grayscale-600 border-t-transparent rounded-full animate-spin" />
          </>
        ) : (
          <Image className="mr-2" src="/icons/deactivate.svg" alt="Toggle status" width={14} height={16} />
        )}
        {isActive ? t("myAds.deactivate") : t("myAds.activate")}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="hover:bg-transparent font-normal justify-start my-1"
        onClick={() => onDelete(ad.id)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <div className="mr-2 w-4 h-4 border-2 border-disputed-icon border-t-transparent rounded-full animate-spin" />
          </>
        ) : (
          <Image className="mr-2" src="/icons/delete.svg" alt="Delete" width={14} height={16} />
        )}
        <span className="text-disputed-icon">{t("myAds.delete")}</span>
      </Button>
    </>
  )
}
