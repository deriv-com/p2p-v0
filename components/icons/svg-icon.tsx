import Image from "next/image"
import type { ReactNode } from "react"

interface SvgIconProps {
  children?: ReactNode
  className?: string
  fill?: string
  width?: number | string
  height?: number | string
  viewBox?: string
  src?: string
  alt?: string
}

/**
 * Reusable SVG icon component that dynamically changes fill color
 * @param children - SVG path elements or other SVG content (for inline SVG with dynamic fill)
 * @param src - Path to SVG file (for external SVG files)
 * @param className - Additional CSS classes
 * @param fill - Fill color (supports CSS color values, HSL variables, etc.) - only works with inline SVG (children)
 * @param width - SVG width (default: 20)
 * @param height - SVG height (default: 20)
 * @param viewBox - SVG viewBox (default: "0 0 24 24")
 * @param alt - Alt text for accessibility when using src
 *
 * Note: Dynamic fill color only works when using inline SVG (children prop).
 * When using src prop, the SVG file's original colors are preserved.
 */
export function SvgIcon({
  children,
  className = "",
  fill = "currentColor",
  width = 20,
  height = 20,
  viewBox = "0 0 24 24",
  src,
  alt = "icon",
}: SvgIconProps) {
  if (src) {
    return (
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        width={typeof width === "number" ? width : Number.parseInt(width as string)}
        height={typeof height === "number" ? height : Number.parseInt(height as string)}
        className={className}
        style={{ fill }}
      />
    )
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ fill }}
    >
      {children}
    </svg>
  )
}
