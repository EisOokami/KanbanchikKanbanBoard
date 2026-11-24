import { fetchWithRefresh } from "@/data/fetchWithRefresh";
import { getAccessToken, getRefreshToken } from "@/data/getToken";

const baseUrl = process.env.API_URL ?? "http://localhost:3001";

export async function GET(request: Request) {
    const accessToken = await getAccessToken();
    const refreshToken = await getRefreshToken();

    if (!accessToken && !refreshToken) {
        return Response.redirect(new URL("/signIn", request.url), 303);
    }

    try {
        const response = await fetchWithRefresh(
            new URL("/users/me/export", baseUrl),
            accessToken,
            refreshToken,
            { cache: "no-store" },
        );

        if (!response.ok) {
            return Response.json(
                { status: "error", message: "Unable to export your data" },
                { status: response.status },
            );
        }

        return new Response(await response.text(), {
            status: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Content-Disposition":
                    response.headers.get("content-disposition") ??
                    'attachment; filename="kanbanchik-account.json"',
                "Cache-Control": "no-store",
            },
        });
    } catch {
        return Response.redirect(new URL("/signIn", request.url), 303);
    }
}
