interface KycOnboardingGradientProps {
  variant: "desktop" | "mobile"
}

/**
 * Recreates the Figma onboarding hero gradient with layered blurred blobs.
 * Colors are Figma-exact where no Tailwind token exists yet.
 */
export function KycOnboardingGradient({ variant }: KycOnboardingGradientProps) {
  const lightColor = variant === "desktop" ? "#FF9BA3" : "#FFBFC2"
  const isDesktop = variant === "desktop"

  return (
    <>
      <div
        aria-hidden
        className={
          isDesktop
            ? "pointer-events-none absolute -bottom-56 -left-24 h-72 w-[30rem] rounded-full opacity-70"
            : "pointer-events-none absolute -bottom-24 -right-28 h-72 w-[28rem] rounded-full opacity-90"
        }
        style={{ backgroundColor: "#6A0000", filter: "blur(80px)" }}
      />
      <div
        aria-hidden
        className={
          isDesktop
            ? "pointer-events-none absolute -bottom-48 -left-12 h-64 w-[26rem] rounded-full opacity-65"
            : "pointer-events-none absolute -bottom-20 -right-20 h-64 w-96 rounded-full opacity-85"
        }
        style={{ backgroundColor: "#E12E3A", filter: "blur(72px)" }}
      />
      <div
        aria-hidden
        className={
          isDesktop
            ? "pointer-events-none absolute -bottom-40 left-8 h-52 w-80 rounded-full opacity-55"
            : "pointer-events-none absolute -bottom-12 -right-12 h-56 w-80 rounded-full opacity-75"
        }
        style={{ backgroundColor: lightColor, filter: "blur(60px)" }}
      />
    </>
  )
}
