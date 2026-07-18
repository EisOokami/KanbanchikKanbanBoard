"use client";

import { XIcon } from "@phosphor-icons/react";
import { Button } from "../../shadcn/button";

interface ChipProps {
    label: string;
    color: string;
    onRemove?: () => void;
}

export default function Chip({ label, color, onRemove }: Readonly<ChipProps>) {
    return (
        <Button
            onClick={onRemove}
            className="h-[1.65rem] border border-border px-2.5 text-xs font-medium capitalize text-white hover:bg-muted/40"
            style={{ backgroundColor: color }}
        >
            {label}
            {onRemove && <XIcon weight="duotone" className="size-3" />}
        </Button>
    );
}
