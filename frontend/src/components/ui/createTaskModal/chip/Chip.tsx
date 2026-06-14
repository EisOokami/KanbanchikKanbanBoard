"use client";

import { XIcon } from "@phosphor-icons/react";

export default function Chip({
    label,
    color,
    onRemove,
    isPending,
}: {
    label: string;
    color: string;
    onRemove?: () => void;
    isPending: boolean;
}) {
    return (
        <button
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-md border border-border/60 px-2.5 py-0.5 text-sm font-medium capitalize text-white transition-colors hover:bg-muted/40"
            style={{ backgroundColor: color }}
            disabled={isPending}
        >
            {label}
            {onRemove && <XIcon weight="duotone" className="size-4" />}
        </button>
    );
}
