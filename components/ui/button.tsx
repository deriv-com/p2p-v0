"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex flex-row items-center justify-center gap-2 rounded-full font-extrabold text-base leading-none transition-colors cursor-pointer focus-visible:outline-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 z-0 font-[800] text-[16px] leading-[16px] text-center text-default-button-text disabled:opacity-24 disabled:cursor-not-allowed disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-hover",
        hover: "bg-primary-hover text-default-button-text",
        black: "bg-black text-white hover:bg-black/90",
        outline: "border border-[#181C25] bg-transparent text-foreground hover:bg-slate-100 px-7",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        secondary: "bg-secondary text-white hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-[48px] min-h-[48px] max-h-[48px] px-7 gap-2 min-w-[96px]",
        sm: "h-[32px] px-4 gap-1 text-sm",
        xs: "h-8 min-h-8 max-h-8 px-3 gap-1 text-xs",
        lg: "h-11 rounded-[16px] px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

const VALID_VARIANTS = ["default", "hover", "black", "outline", "destructive", "secondary", "ghost"]

const VALID_SIZES = ["default", "sm", "xs", "lg", "icon"]

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled, ...props }, ref) => {
    const computedVariant = VALID_VARIANTS.includes(variant as string) ? variant! : "default"
    const computedSize = VALID_SIZES.includes(size as string) ? size : "default"

    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant: computedVariant, size: computedSize }), className)}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
