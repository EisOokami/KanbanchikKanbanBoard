import "server-only";

import { cookies, headers } from "next/headers";
import { refreshAccessToken } from "./refreshAccessToken";
import { forwardedClientIp } from "./clientIp";

const accessTokenConfig = {
    maxAge: 15 * 60,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
};
const refreshTokenConfig = {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
};
const csrfTokenConfig = {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
};

const refreshPromises = new Map();

async function refreshOnce(
    refreshToken: string,
    csrfToken: string,
): Promise<
    | {
          status: "success";
          accessToken: string;
          refreshToken: string;
          csrfToken: string;
      }
    | { status: "rejected" }
    | { status: "unavailable" }
> {
    const inFlight = refreshPromises.get(refreshToken);

    if (inFlight) {
        return inFlight;
    }

    const incoming = await headers();
    const userAgent = incoming.get("user-agent") ?? undefined;
    const promise = refreshAccessToken(
        refreshToken,
        csrfToken,
        userAgent,
        incoming,
    ).finally(() => {
        refreshPromises.delete(refreshToken);
    });

    refreshPromises.set(refreshToken, promise);

    return promise;
}

export async function fetchWithRefresh(
    url: string | URL,
    accessToken: string | undefined,
    refreshToken: string | undefined,
    options: RequestInit & { requireAuth?: boolean } = {},
    isImage?: boolean,
): Promise<Response> {
    const method = (options.method ?? "GET").toUpperCase();
    const needsCsrf = new Set(["POST", "PUT", "PATCH", "DELETE"]).has(method);

    const cookieStore = await cookies();
    const csrfToken = cookieStore.get("csrfToken")?.value;

    if (needsCsrf && !csrfToken) {
        throw new Error("CSRF token missing");
    }

    const clientIpHeaders = forwardedClientIp(await headers());

    const buildHeaders = (
        token: string | undefined,
        cookieRefreshToken: string | undefined,
        currentCsrfToken: string | undefined,
    ) => ({
        ...(!isImage && { "Content-Type": "application/json" }),
        ...clientIpHeaders,
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(cookieRefreshToken && {
            Cookie: `refreshToken=${cookieRefreshToken}; csrfToken=${currentCsrfToken}`,
        }),
        ...(currentCsrfToken && { "X-CSRF-Token": currentCsrfToken }),
        ...options.headers,
    });

    let response = await fetch(url, {
        ...options,
        headers: buildHeaders(accessToken, refreshToken, csrfToken),
    });

    const isTokenRejected =
        response.status === 401 &&
        response.headers.get("www-authenticate")?.startsWith("Bearer");

    if (isTokenRejected && refreshToken && csrfToken) {
        const tokens = await refreshOnce(refreshToken, csrfToken);

        if (tokens.status === "unavailable") {
            return response;
        }

        if (tokens.status === "rejected") {
            throw new Error("Session expired");
        }

        const alreadyPersisted =
            cookieStore.get("refreshToken")?.value === tokens.refreshToken;

        if (!alreadyPersisted) {
            cookieStore.set(
                "accessToken",
                tokens.accessToken,
                accessTokenConfig,
            );
            cookieStore.set(
                "refreshToken",
                tokens.refreshToken,
                refreshTokenConfig,
            );
            cookieStore.set("csrfToken", tokens.csrfToken, csrfTokenConfig);
        }

        response = await fetch(url, {
            ...options,
            headers: buildHeaders(
                tokens.accessToken,
                tokens.refreshToken,
                tokens.csrfToken,
            ),
        });
    }

    return response;
}
