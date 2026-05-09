import type { NextConfig } from "next";

/** Public R2 buckets use https://pub-….r2.dev — required for next/image remote src. */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
