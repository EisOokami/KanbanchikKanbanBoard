"use client";

import { CheckSquareIcon, PaperclipIcon } from "@phosphor-icons/react";
import { Checkbox } from "../../shadcn/checkbox";
import { FilterState } from "@/types/types";

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
                    className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
                    style={
                        filters[key]
                            ? {
                                  background: "#EDE9FD",
                                  border: "1px solid #D3CBF8",
                              }
                            : { border: "1px solid #E5E7EB" }
                    }
                >
                    <span
                        className="flex items-center gap-1.5 text-sm"
                        style={{
                            color: filters[key] ? "#0096FF" : "#374151",
                        }}
                    >
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
