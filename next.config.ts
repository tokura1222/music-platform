import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/songs', destination: '/music/songs', permanent: true },
      { source: '/movies', destination: '/music/movies', permanent: true },
      { source: '/genre/:slug', destination: '/music/genre/:slug', permanent: true },
      { source: '/liked', destination: '/music/liked', permanent: true },
      { source: '/about-us', destination: '/music/about-us', permanent: true },
      { source: '/free-plan-exclusive', destination: '/music/free-plan-exclusive', permanent: true },
    ];
  },
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
