import { cookies } from "next/headers";
import { refreshAccessToken } from "./refreshAccessToken";

type FetchOptions = RequestInit & { requireAuth?: boolean };

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

export async function fetchWithRefresh(
    url: string | URL,
    accessToken: string | undefined,
    refreshToken: string | undefined,
    options: FetchOptions = {},
    isImage?: boolean
): Promise<Response> {
    const buildHeaders = (token: string | undefined) => ({
        ...(!isImage && {"Content-Type": "application/json"}),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(refreshToken && { Cookie: `refreshToken=${refreshToken}` }),
        ...options.headers,
    });

    let response = await fetch(url, {
        ...options,
        headers: buildHeaders(accessToken),
    });

    if (response.status === 401 && refreshToken) {
        const tokens = await refreshAccessToken(refreshToken);

        if (!tokens) throw new Error("Session expired");

        const cookieStore = await cookies();
        cookieStore.set("accessToken", tokens.accessToken, accessTokenConfig);
        cookieStore.set(
            "refreshToken",
            tokens.refreshToken,
            refreshTokenConfig,
        );

        response = await fetch(url, {
            ...options,
            headers: buildHeaders(tokens.accessToken),
        });
    }

    return response;
}
