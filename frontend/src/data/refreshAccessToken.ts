import "server-only";

import { forwardedClientIp } from "./clientIp";

const baseUrl = process.env.API_URL ?? "http://localhost:3001";

export async function refreshAccessToken(
    refreshToken: string,
    csrfToken: string,
    userAgent?: string,
    incoming?: Pick<Headers, "get">,
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
    try {
        const response = await fetch(`${baseUrl}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(userAgent ? { "User-Agent": userAgent } : {}),
                ...(incoming ? forwardedClientIp(incoming) : {}),
                Cookie: `refreshToken=${refreshToken}; csrfToken=${csrfToken ?? ""}`,
                "X-CSRF-Token": csrfToken,
            },
            credentials: "include",
        });

        if (response.status === 401 || response.status === 403) {
            return { status: "rejected" };
        }

        if (!response.ok) {
            return { status: "unavailable" };
        }

        const setCookieHeaders = response.headers.getSetCookie();
        const newCsrfToken = setCookieHeaders
            .find((cookieHeader) => cookieHeader.startsWith("csrfToken="))
            ?.split(";")[0]
            .split("=")[1];

        if (!newCsrfToken) {
            return { status: "unavailable" };
        }

        const data = await response.json();

        if (
            data.status === "error" ||
            !data.accessToken ||
            !data.refreshToken
        ) {
            return { status: "unavailable" };
        }

        return {
            status: "success",
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            csrfToken: newCsrfToken,
        };
    } catch {
        return { status: "unavailable" };
    }
}
