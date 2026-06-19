"use client";

import { FilterSortOptions } from "@/types/projectsOverview";
import { Category } from "@/types/types";
import { CheckIcon } from "@phosphor-icons/react";

interface CategoriesSectionProps {
    categories: Category[];
    options: FilterSortOptions;
    onChange: (options: FilterSortOptions) => void;
    onToggle: <T>(array: T[], value: T) => T[];
}

export default function CategoriesSection({
    categories,
    options,
    onChange,
    onToggle,
}: Readonly<CategoriesSectionProps>) {
    return (
        <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Categories
            </p>
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                    const active = options.categoryIds.includes(category.id);
                    return (
                        <button
                            key={category.id}
                            onClick={() =>
                                onChange({
                                    ...options,
                                    categoryIds: onToggle(
                                        options.categoryIds,
                                        category.id,
                                    ),
                                })
                            }
                            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                                active
                                    ? "border-transparent text-white"
                                    : "border-border/60 bg-background text-muted-foreground hover:border-border"
                            }`}
                            style={
                                active
                                    ? {
                                          backgroundColor: category.color,
                                          borderColor: category.color,
                                      }
                                    : {}
                            }
                        >
                            {!active && (
                                <span
                                    className="size-2 rounded-full"
                                    style={{
                                        backgroundColor: category.color,
                                    }}
                                />
                            )}
                            {active && (
                                <CheckIcon weight="bold" className="size-3" />
                            )}
                            {category.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
