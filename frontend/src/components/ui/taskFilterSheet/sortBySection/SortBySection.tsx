"use client";

import {
    ArrowDownIcon,
    ArrowsDownUpIcon,
    ArrowUpIcon,
    FunnelSimpleIcon,
} from "@phosphor-icons/react";
import FilterSection from "../filterSection/FilterSection";
import { SORT_FIELDS } from "@/constants/taskFilterSheet";
import { cn } from "@/libs/utils";
import { FilterState, TaskSortField } from "@/types/types";
import { Button } from "../../shadcn/button";

interface SortBySectionProps {
    filters: FilterState;
    onUpdate: (patch: Partial<FilterState>) => void;
}

export default function SortBySection({
    filters,
    onUpdate,
}: Readonly<SortBySectionProps>) {
    const handleSortField = (field: TaskSortField) => {
        if (filters.sortField !== field) {
            onUpdate({
                sortField: field,
                sortDirection: "asc",
            });

            return;
        }

        if (filters.sortDirection === "asc") {
            onUpdate({
                sortField: field,
                sortDirection: "desc",
            });

            return;
        }

        onUpdate({
            sortField: undefined,
            sortDirection: undefined,
        });
    };

    return (
        <FilterSection
            title="Sort by"
            icon={<FunnelSimpleIcon weight="duotone" size={16} />}
        >
            <div className="flex flex-wrap gap-2">
                {SORT_FIELDS.map(({ value, label }) => {
                    const active = filters.sortField === value;

                    return (
                        <Button
                            key={value}
                            onClick={() => handleSortField(value)}
                            className={cn(
                                "h-[1.85rem] border px-2.5 text-xs font-medium",
                                active
                                    ? "border-bright-blue bg-bright-blue/10 text-bright-blue hover:bg-bright-blue/20"
                                    : "border-border bg-control text-control-text hover:bg-control-active",
                            )}
                        >
                            {active ? (
                                filters.sortDirection === "asc" ? (
                                    <ArrowUpIcon weight="bold" size={11} />
                                ) : (
                                    <ArrowDownIcon weight="bold" size={11} />
                                )
                            ) : (
                                <ArrowsDownUpIcon weight="duotone" size={11} />
                            )}
                            {label}
                        </Button>
                    );
                })}
            </div>
        </FilterSection>
    );
}
