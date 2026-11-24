import { NextResponse, type NextRequest } from "next/server";
import { exchangeGoogleCodeAction } from "@/data/actions";

export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get("code");
    const redirectTo = (path: string) =>
        NextResponse.redirect(new URL(path, request.url));

    if (!code) {
        return redirectTo("/signIn?error=missing_code");
    }

    try {
        const result = await exchangeGoogleCodeAction(code);

        if (!result?.ok) {
            return redirectTo("/signIn?error=oauth_failed");
        }

        return redirectTo(result.requiresMfa ? "/signIn" : "/overview");
    } catch {
        return redirectTo("/signIn?error=oauth_failed");
    }
}
