"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type ModalHeaderRowProps = {
  title: ReactNode
  onClose?: () => void
  hideCloseButton?: boolean
  className?: string
  titleClassName?: string
  closeButtonClassName?: string
  closeAriaLabel?: string
  /** Use Radix DialogTitle + DialogClose for accessible dialogs */
  asDialog?: boolean
  closeIconSrc?: string
  closeIconSize?: number
}

/**
 * Title + close on opposite ends; respects document `dir` (title at start, close at end).
 */
export function ModalHeaderRow({
  title,
  onClose,
  hideCloseButton = false,
  className,
  titleClassName,
  closeButtonClassName,
  closeAriaLabel = "Close",
  asDialog = false,
  closeIconSrc = "/icons/close-icon.png",
  closeIconSize = 24,
}: ModalHeaderRowProps) {
  const titleClasses = cn(
    "min-w-0 flex-1 text-start font-bold text-2xl text-slate-1200",
    titleClassName,
  )

  const closeButton = (
    <Button
      type="button"
      variant="ghost"
      onClick={onClose}
      className={cn("shrink-0 bg-slate-75 min-w-[48px] px-1", closeButtonClassName)}
      aria-label={closeAriaLabel}
    >
      <Image src={closeIconSrc} alt="" width={closeIconSize} height={closeIconSize} />
    </Button>
  )

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {asDialog ? (
        <DialogTitle className={titleClasses}>{title}</DialogTitle>
      ) : (
        <div className={titleClasses}>{title}</div>
      )}
      {!hideCloseButton &&
        (asDialog ? (
          <DialogClose asChild>{closeButton}</DialogClose>
        ) : (
          closeButton
        ))}
    </div>
  )
}
