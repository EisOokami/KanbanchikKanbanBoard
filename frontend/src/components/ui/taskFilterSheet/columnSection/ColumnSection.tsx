"use client";

import { ColumnsIcon } from "@phosphor-icons/react";
import FilterSection from "../filterSection/FilterSection";
import { Checkbox } from "../../shadcn/checkbox";
import { cn } from "@/libs/utils";
import { FilterState, Project } from "@/types/types";

interface ColumnSectionProps {
    filters: FilterState;
    projectData: Project;
    onToggle: <
        T,
        K extends "priorities" | "columns" | "members" | "categories",
    >(
        key: K,
        value: T,
    ) => void;
}

export default function ColumnSection({
    filters,
    projectData,
    onToggle,
}: Readonly<ColumnSectionProps>) {
    return (
        <FilterSection
            title="Column"
            icon={<ColumnsIcon weight="duotone" size={16} />}
            count={filters.columns.length || undefined}
        >
            <div className="space-y-1.5 pt-1">
                {projectData.columns.map((column) => {
                    const active = filters.columns.includes(column.name);

                    return (
                        <label
                            key={column.id}
                            className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-control-text transition-colors hover:bg-control-active hover:!text-foreground",
                                active
                                    ? "border-bright-blue"
                                    : "border-transparent",
                            )}
                        >
                            <Checkbox
                                checked={active}
                                onCheckedChange={() =>
                                    onToggle("columns", column.name)
                                }
                                className="rounded data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                            />
                            <div className="flex flex-1 items-center gap-2">
                                <span
                                    className={cn(
                                        "text-sm",
                                        active ? "text-bright-blue" : "",
                                    )}
                                >
                                    {column.name}
                                </span>
                            </div>
                        </label>
                    );
                })}
            </div>
        </FilterSection>
    );
}
