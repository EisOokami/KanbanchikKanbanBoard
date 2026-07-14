"use client";

import { CheckSquareIcon, PaperclipIcon } from "@phosphor-icons/react";
import { Checkbox } from "../../shadcn/checkbox";
import { FilterState } from "@/types/types";
import { cn } from "@/libs/utils";

interface ProgressSectionProps {
    filters: FilterState;
    onUpdate: (patch: Partial<FilterState>) => void;
}

export default function HasSection({
    filters,
    onUpdate,
}: Readonly<ProgressSectionProps>) {
    return (
        <div className="space-y-2 py-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest">
                Has
            </p>
            {[
                {
                    key: "has_attachment" as const,
                    label: "Attachment",
                    Icon: PaperclipIcon,
                },
                {
                    key: "has_subtasks" as const,
                    label: "Subtasks",
                    Icon: CheckSquareIcon,
                },
            ].map(({ key, label, Icon }) => (
                <label
                    key={key}
                    className={cn(
                        "flex cursor-pointer items-center justify-between rounded-md border border-border bg-control px-3 py-2.5 transition-colors hover:bg-control-active",
                        filters[key] && "border-bright-blue text-bright-blue",
                    )}
                >
                    <span className="flex items-center gap-1.5 text-sm">
                        <Icon weight="duotone" size={16} />
                        {label}
                    </span>
                    <Checkbox
                        checked={filters[key]}
                        onCheckedChange={() =>
                            onUpdate({ [key]: !filters[key] })
                        }
                        className="rounded data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                    />
                </label>
            ))}
        </div>
    );
}
