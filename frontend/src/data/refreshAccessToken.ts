"use server";

const baseUrl = process.env.DB_URL;

export async function refreshAccessToken(
    refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
        const response = await fetch(`${baseUrl}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `refreshToken=${refreshToken}`,
            },
            credentials: "include",
        });

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
        };
    } catch {
        return null;
    }
}
