"use client";

import { MonitorIcon } from "@phosphor-icons/react";

export function MobileBlock() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center lg:hidden">
            <div className="mb-6 rounded-full border border-border bg-muted p-5">
                <MonitorIcon
                    weight="duotone"
                    className="size-10 text-muted-foreground"
                />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
                Desktop required
            </h1>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
                This Kanban application is optimized for desktop screens. Please
                open it on a device with a larger display for the best
                experience.
            </p>
        </div>
    );
}
