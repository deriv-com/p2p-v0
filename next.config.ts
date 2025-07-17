import type { NextConfig } from "next"

const nextConfig: NextConfig = {
 reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
