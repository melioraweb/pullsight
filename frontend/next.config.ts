import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    /* config options here */
    images: {
      remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "http", 
                hostname: "**",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
