"use client";

import { cn } from "@/libs/utils";
import { XIcon } from "@phosphor-icons/react";

export default function Chip({
    active,
    pill,
    onClick,
    children,
}: {
    active: boolean;
    pill: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all",
                pill,
            )}
        >
            {children}
            {active && <XIcon weight="duotone" size={12} />}
        </button>
    );
}
