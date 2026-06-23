"use client";

import { XIcon } from "@phosphor-icons/react";

interface ChipProps {
    label: string;
    color: string;
    onRemove?: () => void;
}

export default function Chip({ label, color, onRemove }: Readonly<ChipProps>) {
    return (
        <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: color }}
        >
            {label}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-0.5 opacity-60 transition-opacity hover:opacity-100"
                >
                    <XIcon weight="duotone" className="size-3" />
                </button>
            )}
        </span>
    );
}
