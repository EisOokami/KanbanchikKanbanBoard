import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { refreshAccessToken } from "./data/refreshAccessToken";

const accessTokenConfig = {
    maxAge: 15 * 60,
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
};
const refreshTokenConfig = {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
};

const protectedRoutes = ["/overview", "/board", "/tasks", "/calendar"];
const protectedAuthRoutes = [
    "/signIn",
    "/signUp",
    "/forgotPassword",
    "/resetPassword",
];

function isProtectedRoute(path: string): boolean {
    return protectedRoutes.some((route) => path.startsWith(route));
}

function isProtectedAuthRoute(path: string): boolean {
    return protectedAuthRoutes.some((route) => path.startsWith(route));
}

export async function proxy(request: NextRequest) {
    const currentPath = request.nextUrl.pathname;
    let accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    let tokens = null;

    if (!accessToken && refreshToken) {
        tokens = await refreshAccessToken(refreshToken);

        if (tokens) {
            accessToken = tokens.accessToken;
        }
    }

    if (isProtectedRoute(currentPath) && !accessToken) {
        return NextResponse.redirect(new URL("/signIn", request.url));
    }

    if (isProtectedAuthRoute(currentPath) && accessToken) {
        return NextResponse.redirect(new URL("/overview", request.url));
    }

    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const cspHeader = `
            default-src 'self';
            script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
            style-src 'self' 'nonce-${nonce}';
            style-src-attr 'self' 'unsafe-inline';
            img-src 'self' http://127.0.0.1:3001 http://localhost:3001 blob: data:;
            connect-src 'self' http://127.0.0.1:3001 http://localhost:3001;
            font-src 'self';
            object-src 'none';
            base-uri 'self';
            form-action 'self';
            frame-ancestors 'none';
            upgrade-insecure-requests;
        `
        .replace(/\s{2,}/g, " ")
        .trim();

    const contentSecurityPolicyHeaderValue = cspHeader
        .replace(/\s{2,}/g, " ")
        .trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);

    requestHeaders.set(
        "Content-Security-Policy",
        contentSecurityPolicyHeaderValue,
    );

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    if (tokens && !request.cookies.get("accessToken")?.value) {
        response.cookies.set(
            "accessToken",
            tokens.accessToken,
            accessTokenConfig,
        );

        response.cookies.set(
            "refreshToken",
            tokens.refreshToken,
            refreshTokenConfig,
        );
    }

    response.headers.set(
        "Content-Security-Policy",
        contentSecurityPolicyHeaderValue,
    );
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload",
    );
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    );

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        {
            source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
            missing: [
                { type: "header", key: "next-router-prefetch" },
                { type: "header", key: "purpose", value: "prefetch" },
            ],
        },
    ],
};
