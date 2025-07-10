import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Skip TypeScript checking during build (for development)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Skip ESLint during build (for development)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
