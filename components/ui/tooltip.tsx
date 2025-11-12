"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"
import { useState } from "react"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = ({ children, ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) => {
  const [open, setOpen] = useState(false)

  return (
    <TooltipPrimitive.Root
      open={open}
      onOpenChange={setOpen}
      delayDuration={Number.POSITIVE_INFINITY}
      disableHoverableContent
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TooltipTrigger) {
          return React.cloneElement(child, { onOpenChange: setOpen } as any)
        }
        return child
      })}
    </TooltipPrimitive.Root>
  )
}

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> & {
    onOpenChange?: (open: boolean) => void
  }
>(({ children, onOpenChange, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onOpenChange?.((prev) => !prev as any)
  }

  return (
    <TooltipPrimitive.Trigger ref={ref} onClick={handleClick} onPointerDown={(e) => e.preventDefault()} {...props}>
      {children}
    </TooltipPrimitive.Trigger>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipArrow = TooltipPrimitive.Arrow

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover p-4 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 bg-black text-white border-black rounded-lg text-xs max-w-[230px]",
      className,
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipArrow, TooltipTrigger, TooltipContent, TooltipProvider }
