"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-input ring-offset-background placeholder:text-muted-foreground focus:border-[#000000] focus:outline-none focus:ring-0",
        secondary:
          "h-[32px] bg-white border border-input rounded-lg px-2 flex flex-row items-center gap-2 focus-visible:outline-none focus:border-black focus:ring-0 placeholder:text-[#0000003D] pl-10 pr-4",
        tertiary:
          "h-[32px] bg-gray-100 border-transparent rounded-lg px-2 flex flex-row items-center gap-2 focus-visible:outline-none focus:border-black focus:ring-0 placeholder:text-[#0000003D] pl-10 pr-4",
        floating:
          "h-14 bg-white border border-input rounded-lg px-3 pt-6 pb-2 focus-visible:outline-none focus:border-black focus:ring-0",
        floatingCurrency:
          "h-14 bg-white border border-input rounded-lg px-3 pt-6 pb-2 pr-16 focus-visible:outline-none focus:border-black focus:ring-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

const VALID_VARIANTS = ["default", "secondary", "tertiary", "floating", "floatingCurrency"]

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
  label?: string
  required?: boolean
  currency?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type, label, required, currency, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    const computedVariant = VALID_VARIANTS.includes(variant as string) ? variant : "default"

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value.length > 0)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    React.useEffect(() => {
      if (props.value !== undefined) {
        setHasValue(String(props.value).length > 0)
      } else if (props.defaultValue !== undefined) {
        setHasValue(String(props.defaultValue).length > 0)
      }
    }, [props.value, props.defaultValue])

    if ((variant === "floating" || variant === "floatingCurrency") && label) {
      const shouldFloatLabel = isFocused || hasValue

      return (
      <> 
        {variant === "floatingCurrency" && (
          <label
            className="text-slate-1200 mb-2 font-normal text-sm"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative mt-2">
          <input
            type={type}
            className={cn(inputVariants({ variant: computedVariant }), className)}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          {variant === "floating" && (<label
            className={cn(
              "absolute left-4 transition-all duration-200 ease-in-out pointer-events-none",
              "text-[#000000B8]",
              shouldFloatLabel ? "top-2 text-xs" : "top-1/2 -translate-y-1/2 text-sm",
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>)}
          {variant === "floatingCurrency" && currency && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-grayscale-600">
              {currency}
            </div>
          )}
        </div>
        </>
      )
    }

    return (
      <input type={type} className={cn(inputVariants({ variant: computedVariant }), className)} ref={ref} {...props} />
    )
  },
)
Input.displayName = "Input"

export { Input, inputVariants }
