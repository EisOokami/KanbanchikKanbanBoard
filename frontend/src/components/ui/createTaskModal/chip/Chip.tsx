"use client";

import { XIcon } from "@phosphor-icons/react";

interface ChipProps {
    label: string;
    color: string;
    onRemove?: () => void;
    isPending: boolean;
}

export default function Chip({
    label,
    color,
    onRemove,
    isPending,
}: Readonly<ChipProps>) {
    return (
        <button
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-0.5 text-sm font-medium capitalize text-white transition-colors hover:bg-muted/40"
            style={{ backgroundColor: color }}
            disabled={isPending}
        >
            {label}
            {onRemove && <XIcon weight="duotone" className="size-4" />}
        </button>
    );
}
