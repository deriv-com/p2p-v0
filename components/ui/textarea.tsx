"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:border-[#000000] focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        floating: "placeholder:opacity-0 pt-6 pb-2",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  label?: string
  required?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, label, required, onFocus, onBlur, onChange, value, defaultValue, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    // Check if textarea has value on mount and when value changes
    React.useEffect(() => {
      const currentValue = value !== undefined ? value : defaultValue
      setHasValue(Boolean(currentValue && String(currentValue).length > 0))
    }, [value, defaultValue])

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      setHasValue(Boolean(e.target.value && e.target.value.length > 0))
      onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(Boolean(e.target.value && e.target.value.length > 0))
      onChange?.(e)
    }

    if (variant === "floating" && label) {
      const shouldFloatLabel = isFocused || hasValue

      return (
        <div className="relative">
          <textarea
            className={cn(textareaVariants({ variant }), className)}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            value={value}
            defaultValue={defaultValue}
            {...props}
          />
          <label
            className={cn(
              "absolute left-3 text-sm text-muted-foreground transition-all duration-200 ease-in-out pointer-events-none",
              shouldFloatLabel ? "top-2 text-xs text-foreground" : "top-4 text-sm",
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      )
    }

    return (
      <textarea
        className={cn(textareaVariants({ variant }), className)}
        ref={ref}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        value={value}
        defaultValue={defaultValue}
        {...props}
      />
    )
  },
)
Textarea.displayName = "Textarea"

export { Textarea }
