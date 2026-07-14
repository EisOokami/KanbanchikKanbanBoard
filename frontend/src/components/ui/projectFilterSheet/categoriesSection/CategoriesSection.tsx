"use client";

import { cn } from "@/libs/utils";
import { FilterSortOptions } from "@/types/projectsOverview";
import { Category } from "@/types/types";
import { CheckIcon } from "@phosphor-icons/react";
import { Button } from "../../shadcn/button";

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
                        <Button
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
                            variant="outline"
                            className={cn(
                                "h-6 gap-1.5 rounded-full px-3 text-xs font-medium capitalize",
                                active
                                    ? "border-transparent text-white hover:text-white"
                                    : "border-border bg-control text-control-text hover:bg-control-active",
                            )}
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
                        </Button>
                    );
                })}
            </div>
        </div>
    );
}
