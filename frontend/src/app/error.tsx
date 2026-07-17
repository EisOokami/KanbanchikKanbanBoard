"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/shadcn/button";
import Link from "next/link";
import { ArrowClockwiseIcon, HouseIcon } from "@phosphor-icons/react";

type ParsedError = {
    status?: number;
    description?: string;
};

export default function Error({
    error,
    reset,
}: Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    let parsed: ParsedError = {};

    try {
        parsed = JSON.parse(error.message);
    } catch {
        parsed.description = "This is an error page. Please try again later.";
        parsed.status = 404;
    }

    return (
        <main className="flex h-svh flex-col items-center justify-center gap-2 text-center">
            <span className="text-[100px] font-bold leading-none md:text-[140px]">
                {parsed.status}
            </span>
            <h1 className="mt-2 text-xl font-bold md:text-3xl">
                Oops! Something went wrong.
            </h1>
            <p className="max-w-md text-sm text-muted-foreground md:text-base">
                {parsed.description}
            </p>
            {parsed.status !== 428 && (
                <div className="mt-4 flex items-center gap-3">
                    <Button
                        onClick={reset}
                        size="lg"
                        className="gap-2 bg-bright-blue text-xs text-white hover:bg-blue-600"
                    >
                        <ArrowClockwiseIcon
                            weight="duotone"
                            className="size-4"
                        />
                        Try again
                    </Button>
                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="gap-2 bg-control text-control-text hover:bg-control-active"
                    >
                        <Link href="/">
                            <HouseIcon weight="duotone" className="size-4" />
                            Go home
                        </Link>
                    </Button>
                </div>
            )}
        </main>
    );
}
