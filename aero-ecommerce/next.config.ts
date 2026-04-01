import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Neon / Supabase / S3 hosted product images (if any)
      {
        protocol: "https",
        hostname: "**.neon.tech",
        pathname: "/**",
      },
      // Unsplash (used in seed data)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      // Google profile pictures (Google OAuth)
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      // Any other CDN your product images may come from
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
