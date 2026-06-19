"use client";

import { STATUS_COLORS, STATUS_LABELS } from "@/constants/projectsOverview";
import { FilterSortOptions } from "@/types/projectsOverview";
import { Status } from "@/types/types";
import { CheckIcon } from "@phosphor-icons/react";

interface StatusSectionProps {
    options: FilterSortOptions;
    onChange: (options: FilterSortOptions) => void;
    onToggle: <T>(array: T[], value: T) => T[];
}

export default function StatusSection({
    options,
    onChange,
    onToggle,
}: Readonly<StatusSectionProps>) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Status
            </p>
            <div className="flex flex-wrap gap-2">
                {(Object.keys(STATUS_LABELS) as Status[]).map((status) => {
                    const active = options.statuses.includes(status);
                    return (
                        <button
                            key={status}
                            onClick={() =>
                                onChange({
                                    ...options,
                                    statuses: onToggle(
                                        options.statuses,
                                        status,
                                    ),
                                })
                            }
                            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                                active
                                    ? STATUS_COLORS[status]
                                    : "border-border/60 bg-background text-muted-foreground hover:border-border"
                            }`}
                        >
                            {active && (
                                <CheckIcon weight="bold" className="size-3" />
                            )}
                            {STATUS_LABELS[status]}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
