import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "basemaps.cartocdn.com" },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "@react-three/fiber",
      "@react-three/drei",
      "three",
      "lucide-react",
    ],
  },
};

export default nextConfig;
