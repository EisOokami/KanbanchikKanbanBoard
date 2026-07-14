"use client";

import { PlusIcon, TagIcon, XIcon } from "@phosphor-icons/react";
import FieldRow from "../../fieldRow/FieldRow";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import { cn } from "@/libs/utils";
import { Category, Project, UpdateTaskFormData } from "@/types/types";
import { useState } from "react";

interface CategoriesSectionProps {
    isPending: boolean;
    formData: UpdateTaskFormData;
    projectData: Project;
    hasPermission: boolean;
    onFormDataChange: (formData: UpdateTaskFormData) => void;
}

export default function CategoriesSection({
    isPending,
    formData,
    projectData,
    hasPermission,
    onFormDataChange,
}: Readonly<CategoriesSectionProps>) {
    const [categoryOpen, setCategoryOpen] = useState<boolean>(false);

    const toggleCategory = (categoryValue: Category) => {
        const exists = formData.categories.some(
            (category) => category.id === categoryValue.id,
        );

        onFormDataChange({
            ...formData,
            categories: exists
                ? formData.categories.filter(
                      (category) => category.id !== categoryValue.id,
                  )
                : [...formData.categories, categoryValue],
        });
    };

    return (
        <FieldRow
            icon={<TagIcon weight="duotone" size={16} />}
            label="Categories"
        >
            <div className="flex flex-wrap items-center gap-1.5">
                {formData.categories.map((category) => (
                    <span
                        key={category.id}
                        className={cn(
                            "flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs font-medium capitalize text-white",
                            hasPermission && "cursor-pointer",
                        )}
                        style={{
                            backgroundColor: category.color,
                        }}
                        onClick={() => {
                            if (!isPending && hasPermission) {
                                toggleCategory(category);
                            }
                        }}
                    >
                        {category.name}
                        {hasPermission && <XIcon weight="duotone" size={14} />}
                    </span>
                ))}
                {hasPermission && (
                    <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                        <PopoverTrigger asChild disabled={isPending}>
                            <button
                                type="button"
                                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-gray-500"
                                disabled={isPending}
                            >
                                <PlusIcon weight="duotone" size={14} />
                                Add
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-52 border-border p-2">
                            <div className="flex flex-wrap gap-1.5">
                                {projectData.categories.map((category) => {
                                    const selectedCategory =
                                        formData.categories.some(
                                            (formDataCategory) =>
                                                formDataCategory.id ===
                                                category.id,
                                        );

                                    return (
                                        <button
                                            type="button"
                                            key={category.id}
                                            onClick={() =>
                                                toggleCategory(category)
                                            }
                                            className={cn(
                                                "rounded-md border border-border px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                                                selectedCategory
                                                    ? ""
                                                    : "text-control-text hover:bg-control-active",
                                            )}
                                            style={{
                                                backgroundColor:
                                                    selectedCategory
                                                        ? category.color
                                                        : undefined,
                                                color: selectedCategory
                                                    ? "#fff"
                                                    : undefined,
                                            }}
                                            disabled={isPending}
                                        >
                                            {category.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
                {formData.categories.length === 0 && (
                    <span className="text-sm text-gray-300">No categories</span>
                )}
            </div>
        </FieldRow>
    );
}
