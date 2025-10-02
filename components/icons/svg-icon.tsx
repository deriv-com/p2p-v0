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
  fill = "currentColor",
  width = 20,
  height = 20,
  src,
}: SvgIconProps) {
  return (
    <div style={{ width, height }}>
      <SVGComponent style={{ fill, width: "100%", height: "100%" }} />
    </div>
  );
}
