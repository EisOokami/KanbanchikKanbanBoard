import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    experimental: {
        optimizePackageImports: ["@phosphor-icons/react"],
    },
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
                port: "3001",
                pathname: "/files/**",
            },
        ],
    },
};

export default nextConfig;
