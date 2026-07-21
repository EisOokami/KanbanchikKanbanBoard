"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { exchangeGoogleCodeAction } from "@/data/actions";

export default function GoogleCallbackHandler({ code }: { code: string }) {
    const router = useRouter();
    const called = useRef(false);

    useEffect(() => {
        if (called.current) {
            return;
        }

        called.current = true;

        exchangeGoogleCodeAction(code).then((result) => {
            if (!result) {
                router.replace("/signIn?error=oauth_failed");

                return;
            }

            if (result.ok) {
                router.replace("/overview");
            } else {
                router.replace("/signIn?error=oauth_failed");
            }
        });
    }, [code, router]);

    return <p className="text-center text-muted-foreground">Signing you in…</p>;
}
