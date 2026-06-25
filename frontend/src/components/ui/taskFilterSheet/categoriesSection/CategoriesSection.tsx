"use client";

import { TagIcon } from "@phosphor-icons/react";
import Chip from "../chip/Chip";
import FilterSection from "../filterSection/FilterSection";
import { FilterState, Project } from "@/types/types";

interface CategoriesSectionProps {
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

export default function CategoriesSection({
    filters,
    projectData,
    onToggle,
}: Readonly<CategoriesSectionProps>) {
    return (
        <FilterSection
            title="Categories"
            icon={<TagIcon weight="duotone" size={16} />}
            count={filters.categories?.length || undefined}
        >
            <div className="flex flex-wrap gap-2 pt-1">
                {projectData.categories.map((projectCategory) => (
                    <Chip
                        key={projectCategory.id}
                        bgColor={projectCategory.color}
                        textColor="#fff"
                        active={
                            filters.categories
                                ? filters.categories.some(
                                      (category) =>
                                          category === projectCategory.name,
                                  )
                                : false
                        }
                        onClick={() =>
                            onToggle("categories", projectCategory.name)
                        }
                    >
                        {projectCategory.name}
                    </Chip>
                ))}
            </div>
        </FilterSection>
    );
}
