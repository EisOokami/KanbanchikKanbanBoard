"use client";

import { X } from "lucide-react";

export default function Chip({
    label,
    color,
    onRemove,
}: {
    label: string;
    color: string;
    onRemove?: () => void;
}) {
    return (
        <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: color + "22", color }}
        >
            {label}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-0.5 opacity-60 transition-opacity hover:opacity-100"
                >
                    <X className="size-3" />
                </button>
            )}
        </span>
    );
}
