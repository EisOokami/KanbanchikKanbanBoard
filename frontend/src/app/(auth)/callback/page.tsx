import GoogleCallbackHandler from "@/components/layout/googleCallbackHandler/GoogleCallbackHandler";
import { redirect } from "next/navigation";

interface GoogleCallbackPageProps {
    searchParams: Promise<{ code?: string }>;
}

export default async function GoogleCallbackPage({
    searchParams,
}: Readonly<GoogleCallbackPageProps>) {
    const { code } = await searchParams;

    if (!code) {
        redirect("/signIn?error=missing_code");
    }

    return <GoogleCallbackHandler code={code} />;
}
