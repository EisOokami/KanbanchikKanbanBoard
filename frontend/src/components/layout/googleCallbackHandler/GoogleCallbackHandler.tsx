"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { exchangeGoogleCodeAction } from "@/data/actions";
import { Loader2 } from "lucide-react";

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

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="z-50 flex flex-col items-center gap-5 rounded-2xl border border-border bg-background-secondary px-10 py-8">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="size-8 animate-spin text-primary" />
                </div>
                <div className="space-y-1 text-center">
                    <h1 className="text-xl font-semibold tracking-tight">
                        Signing you in
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Verifying your credentials and preparing your session...
                    </p>
                </div>
                <div className="flex gap-1">
                    <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                    <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                    <span className="size-2 animate-bounce rounded-full bg-primary" />
                </div>
            </div>
        </div>
    );
}
