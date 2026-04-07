import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "app.creantly.com",
        pathname: "/**",
        protocol: "https",
      },
    ],
  },
  transpilePackages: ["@ness/ui"],
};

export default nextConfig;
