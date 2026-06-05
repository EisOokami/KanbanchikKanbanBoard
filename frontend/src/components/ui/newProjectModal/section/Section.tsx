"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Section({
    icon,
    title,
    children,
    defaultOpen = true,
    badge,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badge?: number;
}) {
    const [open, setOpen] = useState<boolean>(defaultOpen);

    return (
        <div className="overflow-hidden rounded-md border border-border/60 bg-muted/20">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
                <span className="text-muted-foreground">{icon}</span>
                <span className="flex-1 text-sm font-semibold text-foreground">
                    {title}
                </span>
                {badge !== undefined && badge > 0 && (
                    <span className="rounded-full bg-bright-blue/15 px-2 py-0.5 text-[10px] font-semibold text-bright-blue">
                        {badge}
                    </span>
                )}
                {open ? (
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                ) : (
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                )}
            </button>
            {open && (
                <div className="border-t border-border/50 px-4 pb-4 pt-3">
                    {children}
                </div>
            )}
        </div>
    );
}
