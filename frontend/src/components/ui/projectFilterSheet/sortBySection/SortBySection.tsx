"use client";

import { SORT_FIELDS } from "@/constants/projectsOverview";
import { cn } from "@/libs/utils";
import { FilterSortOptions, SortField } from "@/types/projectsOverview";
import { ArrowDownIcon, ArrowUpIcon } from "@phosphor-icons/react";

interface SortBySectionProps {
    options: FilterSortOptions;
    onSort: (field: SortField) => void;
}

export default function SortBySection({
    options,
    onSort,
}: Readonly<SortBySectionProps>) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Sort by
            </p>
            <div className="space-y-1">
                {SORT_FIELDS.map(({ value, label }) => {
                    const active = options.sortField === value;
                    return (
                        <button
                            key={value}
                            onClick={() => onSort(value)}
                            className={cn(
                                "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                                active
                                    ? "bg-bright-blue/10 font-medium text-bright-blue"
                                    : "text-foreground hover:bg-control-active",
                            )}
                        >
                            <span>{label}</span>
                            {active &&
                                (options.sortDirection === "asc" ? (
                                    <ArrowUpIcon
                                        weight="bold"
                                        className="size-3.5"
                                    />
                                ) : (
                                    <ArrowDownIcon
                                        weight="bold"
                                        className="size-3.5"
                                    />
                                ))}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
