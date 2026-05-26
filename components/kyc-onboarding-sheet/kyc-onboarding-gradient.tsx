interface KycOnboardingGradientProps {
  variant: "desktop" | "mobile"
}

/**
 * Recreates the Figma onboarding hero gradient with layered blurred blobs.
 * Colors are Figma-exact where no Tailwind token exists yet.
 *
 * Mobile: subtle bottom-right glow only — blobs pushed mostly off-screen.
 * Desktop: bottom-left anchor matches Figma frame position.
 */
export function KycOnboardingGradient({ variant }: KycOnboardingGradientProps) {
  const lightColor = variant === "desktop" ? "#FF9BA3" : "#FFBFC2"
  const isDesktop = variant === "desktop"

  return (
    <>
      {/* Dark red — largest, farthest off-screen */}
      <div
        aria-hidden
        className={
          isDesktop
            ? "pointer-events-none absolute -bottom-56 -left-24 h-72 w-[30rem] rounded-full opacity-70"
            : "pointer-events-none absolute -bottom-36 -right-36 h-64 w-64 rounded-full opacity-60"
        }
        style={{ backgroundColor: "#6A0000", filter: "blur(80px)" }}
      />
      {/* Mid red */}
      <div
        aria-hidden
        className={
          isDesktop
            ? "pointer-events-none absolute -bottom-48 -left-12 h-64 w-[26rem] rounded-full opacity-65"
            : "pointer-events-none absolute -bottom-28 -right-28 h-52 w-52 rounded-full opacity-55"
        }
        style={{ backgroundColor: "#E12E3A", filter: "blur(72px)" }}
      />
      {/* Light pink — smallest, closest to visible edge */}
      <div
        aria-hidden
        className={
          isDesktop
            ? "pointer-events-none absolute -bottom-40 left-8 h-52 w-80 rounded-full opacity-55"
            : "pointer-events-none absolute -bottom-20 -right-20 h-44 w-44 rounded-full opacity-45"
        }
        style={{ backgroundColor: lightColor, filter: "blur(60px)" }}
      />
    </>
  )
}
