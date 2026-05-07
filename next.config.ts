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
  experimental: {
    turbo: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
  webpack: (config, { isServer }) => {
    config.module?.rules?.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('cookie');
      } else if (typeof config.externals === 'object') {
        config.externals['cookie'] = 'commonjs cookie';
      }
    }
    return config;
  },
}

export default nextConfig
