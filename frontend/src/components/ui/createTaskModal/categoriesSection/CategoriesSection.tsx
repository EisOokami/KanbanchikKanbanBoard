"use client";

import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import Chip from "../chip/Chip";
import ColorPicker from "../../colorPicker/ColorPicker";
import { CreateTaskFormData } from "@/types/types";
import { BaseAction } from "@/types/actions";
import { Category, Project } from "@/types/types";
import { useState } from "react";
import { PALETTE } from "@/constants/constants";
import { cn } from "@/libs/utils";

interface CategoriesSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    formData: CreateTaskFormData;
    selectedProject: Project;
    onFormDataChange: (formData: CreateTaskFormData) => void;
}

export default function CategoriesSection({
    formState,
    isPending,
    formData,
    selectedProject,
    onFormDataChange,
}: Readonly<CategoriesSectionProps>) {
    const [newCategoryName, setNewCategoryName] = useState<string>("");
    const [newCategoryColor, setNewCategoryColor] = useState<string>(
        PALETTE[0],
    );

    const onNewCategoryAdd = () => {
        const category = newCategoryName.trim();

        if (
            !category ||
            formData.categories.some(
                (formDataCategory) => formDataCategory.name === category,
            )
        ) {
            return;
        }

        onFormDataChange({
            ...formData,
            newCategories: [
                ...formData.newCategories,
                {
                    id: new Date().getTime(),
                    name: newCategoryName,
                    color: newCategoryColor,
                },
            ],
        });
        setNewCategoryName("");
    };

    const onNewCategoryRemove = (
        categoryValue: Omit<Category, "created_at" | "updated_at">,
    ) => {
        onFormDataChange({
            ...formData,
            newCategories: formData.newCategories.filter(
                (category) => category.id !== categoryValue.id,
            ),
        });
    };

    const onCategorySelect = (category: Category) => {
        onFormDataChange({
            ...formData,
            categories: [...formData.categories, category],
        });
    };

    const onCategoryRemove = (categoryValue: Category) => {
        onFormDataChange({
            ...formData,
            categories: formData.categories.filter(
                (category) => category.id !== categoryValue.id,
            ),
        });
    };

    return (
        <div className="space-y-1">
            <label className="font-semibold" htmlFor="category">
                Categories <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
                {formData.categories.length || formData.newCategories.length ? (
                    <div className="flex flex-wrap gap-1.5">
                        {formData.categories.map((category) => (
                            <Chip
                                key={category.id}
                                label={category.name}
                                color={category.color}
                                onRemove={() => onCategoryRemove(category)}
                                isPending={isPending}
                            />
                        ))}
                        {formData.newCategories.map((category) => (
                            <Chip
                                key={category.id}
                                label={category.name}
                                color={category.color}
                                onRemove={() => onNewCategoryRemove(category)}
                                isPending={isPending}
                            />
                        ))}
                    </div>
                ) : null}
                <div className="flex flex-wrap gap-1.5">
                    {selectedProject.categories
                        .filter(
                            (category) =>
                                !formData.categories.some(
                                    (formDataCategory) =>
                                        formDataCategory.id === category.id,
                                ),
                        )
                        .map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => onCategorySelect(category)}
                                className="flex items-center gap-1 rounded-md border border-border/60 bg-white px-2.5 py-0.5 text-sm capitalize text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                                disabled={isPending}
                            >
                                {category.name}
                                <PlusIcon weight="duotone" className="size-4" />
                            </button>
                        ))}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <ColorPicker
                            value={newCategoryColor}
                            onChange={setNewCategoryColor}
                        />
                        <div className="flex w-full gap-2">
                            <Input
                                id="category"
                                name="category"
                                placeholder="Category name…"
                                value={newCategoryName}
                                defaultValue={
                                    formState?.formData
                                        ?.get("category")
                                        ?.toString() ?? undefined
                                }
                                onChange={(e) =>
                                    setNewCategoryName(e.target.value)
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    (e.preventDefault(), onNewCategoryAdd())
                                }
                                className={cn(
                                    "h-8 flex-1 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue",
                                    formState?.zodErrors?.categories
                                        ? "border-red-500"
                                        : "",
                                )}
                                disabled={isPending}
                            />
                            <Button
                                type="button"
                                size="sm"
                                onClick={onNewCategoryAdd}
                                className="h-8 gap-1 bg-bright-blue text-white hover:bg-blue-600"
                                disabled={isPending}
                            >
                                <PlusIcon
                                    weight="duotone"
                                    className="size-3.5"
                                />{" "}
                                Add
                            </Button>
                        </div>
                    </div>
                    <ZodErrors error={formState?.zodErrors?.categories} />
                </div>
            </div>
        </div>
    );
}
