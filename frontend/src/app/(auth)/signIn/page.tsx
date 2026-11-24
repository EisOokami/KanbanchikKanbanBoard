import { cookies } from "next/headers";
import LoginForm from "@/components/ui/loginForm/LoginForm";

export default async function SignInPage({
    searchParams,
}: {
    searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
    const [{ redirect, error }, cookieStore] = await Promise.all([
        searchParams,
        cookies(),
    ]);

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <LoginForm
                redirect={redirect}
                oauthError={error}
                pendingMfaToken={cookieStore.get("google_mfa_challenge")?.value}
            />
        </div>
    );
}
