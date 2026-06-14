"use client";

import { PlusIcon, TagIcon, XIcon } from "@phosphor-icons/react";
import FieldRow from "../../fieldRow/FieldRow";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import { cn } from "@/libs/utils";
import { Category, Project, UpdateTaskFormData } from "@/types/types";
import { useState } from "react";
import { BaseAction } from "@/types/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";

interface CategoriesSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    formData: UpdateTaskFormData;
    projectData: Project;
    onFormDataChange: (formData: UpdateTaskFormData) => void;
}

export default function CategoriesSection({
    formState,
    isPending,
    formData,
    projectData,
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
                        className="flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium capitalize"
                        style={{
                            backgroundColor: category.color,
                            color: "#fff",
                        }}
                        onClick={() => {
                            if (!isPending) {
                                toggleCategory(category);
                            }
                        }}
                    >
                        {category.name}
                        <XIcon weight="duotone" size={14} />
                    </span>
                ))}
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                    <PopoverTrigger asChild disabled={isPending}>
                        <button
                            type="button"
                            className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-600"
                            disabled={isPending}
                        >
                            <PlusIcon weight="duotone" size={14} />
                            Add
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-52 p-2">
                        <div className="flex flex-wrap gap-1.5">
                            {projectData.categories.map((category) => {
                                const selectedCategory =
                                    formData.categories.some(
                                        (formDataCategory) =>
                                            formDataCategory.id === category.id,
                                    );

                                return (
                                    <button
                                        type="button"
                                        key={category.id}
                                        onClick={() => toggleCategory(category)}
                                        className={cn(
                                            "rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                                            selectedCategory
                                                ? ""
                                                : "border-gray-200 text-gray-600 hover:bg-gray-50",
                                        )}
                                        style={{
                                            backgroundColor: selectedCategory
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
                {formData.categories.length === 0 && (
                    <span className="text-sm text-gray-300">No categories</span>
                )}
            </div>
            <ZodErrors error={formState?.zodErrors?.categories} />
        </FieldRow>
    );
}
