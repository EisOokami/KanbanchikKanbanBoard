import type { NextConfig } from "next";

const backendProtocol =
    (process.env.API_PROTOCOL as "http" | "https") ?? "http";
const backendHostname = process.env.API_HOSTNAME ?? "localhost";
const backendPort = process.env.API_PORT ?? "3001";
const additionalProtocol =
    (process.env.ADDITIONAL_PROTOCOL as "http" | "https") ?? "http";
const additionalHostname = process.env.ADDITIONAL_HOSTNAME ?? "localhost";
const additionalPort = process.env.ADDITIONAL_PORT ?? "3001";

const nextConfig: NextConfig = {
    /* config options here */
    reactCompiler: true,
    output: "standalone",
    experimental: {
        optimizePackageImports: ["@phosphor-icons/react"],
        serverActions: {
            bodySizeLimit: "5mb",
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: backendProtocol,
                hostname: backendHostname,
                port: backendPort,
                pathname: "/files/**",
            },
            {
                protocol: additionalProtocol,
                hostname: additionalHostname,
                port: additionalPort,
                pathname: "/files/**",
            },
        ],
        dangerouslyAllowLocalIP: true,
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    {
                        key: "X-Frame-Options",
                        value: "DENY",
                    },
                    {
                        key: "X-XSS-Protection",
                        value: "1; mode=block",
                    },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=31536000; includeSubDomains; preload",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
