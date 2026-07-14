"use client";

import { XIcon } from "@phosphor-icons/react";
import { Button } from "../../shadcn/button";

interface ChipProps {
    active: boolean;
    bgColor: string;
    textColor: string;
    onClick: () => void;
    children: React.ReactNode;
}

export default function Chip({
    active,
    bgColor,
    textColor,
    onClick,
    children,
}: Readonly<ChipProps>) {
    return (
        <Button
            onClick={onClick}
            className="h-7 gap-1.5 px-2.5 text-xs font-medium capitalize transition-all hover:opacity-85"
            style={{
                backgroundColor: bgColor,
                color: textColor,
            }}
        >
            {children}
            {active && <XIcon weight="duotone" size={12} />}
        </Button>
    );
}
