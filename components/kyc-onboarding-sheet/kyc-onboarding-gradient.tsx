interface KycOnboardingGradientProps {
  variant: "desktop" | "mobile"
}

/**
 * Recreates the Figma onboarding hero gradient with layered blurred blobs.
 * Colors are Figma-exact where no Tailwind token exists yet.
 */
export function KycOnboardingGradient({ variant }: KycOnboardingGradientProps) {
  const lightColor = variant === "desktop" ? "#FF9BA3" : "#FFBFC2"

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-28 h-72 w-[28rem] rounded-full opacity-90"
        style={{ backgroundColor: "#6A0000", filter: "blur(80px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-96 rounded-full opacity-85"
        style={{ backgroundColor: "#E12E3A", filter: "blur(64px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -right-12 h-56 w-80 rounded-full opacity-75"
        style={{ backgroundColor: lightColor, filter: "blur(52px)" }}
      />
    </>
  )
}
