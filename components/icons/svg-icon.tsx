import type { ReactNode } from "react"

interface SvgIconProps {
  children: ReactNode
  className?: string
  fill?: string
  width?: number | string
  height?: number | string
  viewBox?: string
}

/**
 * Reusable SVG icon component that dynamically changes fill color
 * @param children - SVG path elements or other SVG content
 * @param className - Additional CSS classes
 * @param fill - Fill color (supports CSS color values, HSL variables, etc.)
 * @param width - SVG width (default: 20)
 * @param height - SVG height (default: 20)
 * @param viewBox - SVG viewBox (default: "0 0 24 24")
 */
export function SvgIcon({
  children,
  className = "",
  fill = "currentColor",
  width = 20,
  height = 20,
  viewBox = "0 0 24 24",
}: SvgIconProps) {
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
