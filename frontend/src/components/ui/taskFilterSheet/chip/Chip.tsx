"use client";

import { XIcon } from "@phosphor-icons/react";

export default function Chip({
    active,
    bgColor,
    textColor,
    onClick,
    children,
}: {
    active: boolean;
    bgColor: string;
    textColor: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium capitalize transition-all"
            style={{
                backgroundColor: bgColor,
                color: textColor,
            }}
        >
            {children}
            {active && <XIcon weight="duotone" size={12} />}
        </button>
    );
}
