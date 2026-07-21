"use server";

const baseUrl = process.env.API_URL;

export async function refreshAccessToken(
    refreshToken: string,
    csrfToken: string,
): Promise<{
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
} | null> {
    try {
        const response = await fetch(`${baseUrl}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `refreshToken=${refreshToken}; csrfToken=${csrfToken ?? ""}`,
                "X-CSRF-Token": csrfToken,
            },
            credentials: "include",
        });

        if (!response.ok) {
            return null;
        }

        const setCookieHeaders = response.headers.getSetCookie();
        const newCsrfToken = setCookieHeaders
            .find((cookieHeader) => cookieHeader.startsWith("csrfToken="))
            ?.split(";")[0]
            .split("=")[1];

        if (!newCsrfToken) {
            return null;
        }

        const data = await response.json();

        if (
            data.status === "error" ||
            !data.accessToken ||
            !data.refreshToken
        ) {
            return null;
        }

        return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            csrfToken: newCsrfToken,
        };
    } catch {
        return null;
    }
}
