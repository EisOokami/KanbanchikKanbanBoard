"use client";

import { STATUS_COLORS, STATUS_LABELS } from "@/constants/projectsOverview";
import { cn } from "@/libs/utils";
import { FilterSortOptions } from "@/types/projectsOverview";
import { Status } from "@/types/types";
import { CheckIcon } from "@phosphor-icons/react";
import { Button } from "../../shadcn/button";

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
                        <Button
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
                            variant="outline"
                            size="sm"
                            className={cn(
                                "h-6 gap-1.5 rounded-full text-xs font-medium",
                                active
                                    ? STATUS_COLORS[status]
                                    : "border-border bg-control text-control-text hover:bg-control-active hover:text-foreground",
                            )}
                        >
                            {active && (
                                <CheckIcon weight="bold" className="size-3" />
                            )}
                            {STATUS_LABELS[status]}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
