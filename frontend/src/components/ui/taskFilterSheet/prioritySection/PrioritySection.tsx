"use client";

import { UploadSimpleIcon } from "@phosphor-icons/react";
import FilterSection from "../filterSection/FilterSection";
import { PRIORITY_CONFIG } from "@/constants/constants";
import Chip from "../chip/Chip";
import { FilterState, Priority } from "@/types/types";

interface PrioritySectionProps {
    filters: FilterState;
    onToggle: <
        T,
        K extends "priorities" | "columns" | "members" | "categories",
    >(
        key: K,
        value: T,
    ) => void;
}

export default function PrioritySection({
    filters,
    onToggle,
}: Readonly<PrioritySectionProps>) {
    return (
        <FilterSection
            title="Priority"
            icon={<UploadSimpleIcon weight="duotone" size={16} />}
            count={filters.priorities.length || undefined}
        >
            <div className="flex flex-wrap gap-2 pt-1">
                {Object.values(PRIORITY_CONFIG).map((priority) => (
                    <Chip
                        key={priority.label}
                        active={filters.priorities.some(
                            (priorityFilter) =>
                                priorityFilter.toLowerCase() ===
                                (priority.label.toLowerCase() as Priority),
                        )}
                        bgColor={priority.color ?? ""}
                        textColor="#fff"
                        onClick={() => onToggle("priorities", priority.label)}
                    >
                        {priority.label}
                    </Chip>
                ))}
            </div>
        </FilterSection>
    );
}
