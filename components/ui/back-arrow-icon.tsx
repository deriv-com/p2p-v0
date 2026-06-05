import Image, { type ImageProps } from "next/image"

import { cn } from "@/lib/utils"
import { RTL_MIRROR_ICON } from "@/lib/rtl"

type BackArrowIconProps = Omit<ImageProps, "src"> & {
  alt?: string
}

/**
 * Standard back/close control using the shared arrow-left asset, mirrored in RTL.
 */
export function BackArrowIcon({
  alt = "Back",
  width = 24,
  height = 24,
  className,
  ...props
}: BackArrowIconProps) {
  return (
    <Image
      src="/icons/arrow-left-icon.png"
      alt={alt}
      width={width}
      height={height}
      className={cn(RTL_MIRROR_ICON, className)}
      {...props}
    />
  )
}
