import { cookies } from "next/headers";
import { refreshAccessToken } from "./refreshAccessToken";

type FetchOptions = RequestInit & { requireAuth?: boolean };
type RefreshResult = { accessToken: string; refreshToken: string };

const accessTokenConfig = {
    maxAge: 15,
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

const refreshPromises = new Map<string, Promise<RefreshResult | null>>();

async function refreshOnce(
    refreshToken: string,
): Promise<RefreshResult | null> {
    const inFlight = refreshPromises.get(refreshToken);

    if (inFlight) {
        return inFlight;
    }

    const promise = refreshAccessToken(refreshToken).finally(() => {
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
    const buildHeaders = (
        token: string | undefined,
        cookieRefreshToken: string | undefined,
    ) => ({
        ...(!isImage && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(cookieRefreshToken && {
            Cookie: `refreshToken=${cookieRefreshToken}`,
        }),
        ...options.headers,
    });

    let response = await fetch(url, {
        ...options,
        headers: buildHeaders(accessToken, refreshToken),
    });

    if (response.status === 401 && refreshToken) {
        const tokens = await refreshOnce(refreshToken);

        if (!tokens) {
            throw new Error("Session expired");
        }

        const cookieStore = await cookies();
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
        }

        response = await fetch(url, {
            ...options,
            headers: buildHeaders(tokens.accessToken, tokens.refreshToken),
        });
    }

    return response;
}
