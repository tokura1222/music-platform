import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingIncludes: {
    '/**/*': ['./content/**/*', './public/music/**/*'],
  },
  // Ensure images from external sources (if user uploads via admin) are allowed
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all for now since user can add any cover via URL or local
      }
    ]
  }
};

export default nextConfig;
