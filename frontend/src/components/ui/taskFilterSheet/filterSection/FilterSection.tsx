"use client";

import { useState } from "react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../../shadcn/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function FilterSection({
    title,
    icon,
    count,
    children,
    defaultOpen = true,
}: {
    title: string;
    icon: React.ReactNode;
    count?: number;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState<boolean>(defaultOpen);

    return (
        <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger className="group flex w-full items-center justify-between py-2">
                <div className="flex items-center gap-2">
                    <span className="text-gray-500">{icon}</span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                        {title}
                    </span>
                    {count ? (
                        <span className="flex h-4 min-w-4 items-center justify-center rounded bg-bright-blue px-1 text-[10px] font-bold text-white">
                            {count}
                        </span>
                    ) : null}
                </div>
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="pb-4">{children}</div>
            </CollapsibleContent>
        </Collapsible>
    );
}
