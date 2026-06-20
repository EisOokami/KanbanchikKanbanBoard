"use client";

import { useState } from "react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../../shadcn/collapsible";
import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";

interface FilterSectionProps {
    title: string;
    icon?: React.ReactNode;
    count?: number;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export default function FilterSection({
    title,
    icon,
    count,
    children,
    defaultOpen = true,
}: Readonly<FilterSectionProps>) {
    const [open, setOpen] = useState<boolean>(defaultOpen);

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger className="group flex w-full items-center justify-between py-2">
                <div className="flex items-center gap-1.5">
                    {icon && <span>{icon}</span>}
                    <span className="font-semibold">{title}</span>
                    {count ? (
                        <span className="ml-1 flex h-4 min-w-4 items-center justify-center rounded bg-bright-blue px-1 text-[10px] font-bold text-white">
                            {count}
                        </span>
                    ) : null}
                </div>
                {open ? (
                    <CaretDownIcon weight="duotone" size={14} />
                ) : (
                    <CaretRightIcon weight="duotone" size={14} />
                )}
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="pb-4">{children}</div>
            </CollapsibleContent>
        </Collapsible>
    );
}
