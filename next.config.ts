import type { NextConfig } from "next"

function getRequiredHttpUrl(envName: string): string {
  const rawValue = process.env[envName]?.trim()
  if (!rawValue) {
    throw new Error(`Missing required env var: ${envName}`)
  }

  const url = new URL(rawValue)
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`${envName} must be an absolute HTTP(S) URL`)
  }

  return url.toString().replace(/\/+$/, "")
}

const nextConfig: NextConfig = {
  // Note: `eslint` config is deprecated in Next 16 — lint via `pnpm lint` in CI instead.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  async rewrites() {
    const coreBaseUrl = getRequiredHttpUrl("NEXT_PUBLIC_CORE_URL")

    return [
      {
        source: "/api/proxy/api/:path*",
        destination: `${coreBaseUrl}/:path*`,
      },
      {
        source: "/api/deriv/:path*",
        destination: `${coreBaseUrl}/:path*`,
      },
    ]
  },
  // Note: legacy `webpack(...)` config removed — Next 16 uses Turbopack by
  // default and the SVG rule already exists in the `turbopack` block above.
  // If a future runtime issue surfaces around the `cookie` package on the
  // server, prefer a Turbopack-native solution (e.g. `serverExternalPackages`)
  // rather than re-adding the legacy webpack hook.
  serverExternalPackages: ["cookie"],
}

export default nextConfig
