import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    experimental: {
        optimizePackageImports: ["@phosphor-icons/react"],
        serverActions: {
            bodySizeLimit: "5mb",
        },
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
        dangerouslyAllowLocalIP: true,
    },
};

export default nextConfig;
