import { cookies, headers } from "next/headers";
import { refreshAccessToken } from "./refreshAccessToken";

type FetchOptions = RequestInit & { requireAuth?: boolean };
type RefreshResult = {
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
};

const accessTokenConfig = {
    maxAge: 15 * 60,
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
};
const refreshTokenConfig = {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
};
const csrfTokenConfig = {
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    domain: process.env.HOST ?? "localhost",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
};

const refreshPromises = new Map<string, Promise<RefreshResult | null>>();

async function refreshOnce(
    refreshToken: string,
    csrfToken: string,
): Promise<RefreshResult | null> {
    const inFlight = refreshPromises.get(refreshToken);

    if (inFlight) {
        return inFlight;
    }

    const userAgent = (await headers()).get("user-agent") ?? undefined;
    const promise = refreshAccessToken(refreshToken, csrfToken, userAgent).finally(() => {
        refreshPromises.delete(refreshToken);
    });

    refreshPromises.set(refreshToken, promise);

    return promise;
}

export async function fetchWithRefresh(
    url: string | URL,
    accessToken: string | undefined,
    refreshToken: string | undefined,
    options: FetchOptions = {},
    isImage?: boolean,
): Promise<Response> {
    const method = (options.method ?? "GET").toUpperCase();
    const needsCsrf = new Set(["POST", "PUT", "PATCH", "DELETE"]).has(method);

    const cookieStore = await cookies();
    const csrfToken = cookieStore.get("csrfToken")?.value;

    if (needsCsrf && !csrfToken) {
        throw new Error("CSRF token missing");
    }

    const buildHeaders = (
        token: string | undefined,
        cookieRefreshToken: string | undefined,
        currentCsrfToken: string | undefined,
    ) => ({
        ...(!isImage && { "Content-Type": "application/json" }),
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

    if (response.status === 401 && refreshToken && csrfToken) {
        const tokens = await refreshOnce(refreshToken, csrfToken);

        if (!tokens) {
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
