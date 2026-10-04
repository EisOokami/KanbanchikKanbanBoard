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
    const [newCategoryColor, setNewCategoryColor] = useState<string>("#000000");

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
                Categories
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
                            <Button
                                key={category.id}
                                type="button"
                                variant="secondary"
                                onClick={() => onCategorySelect(category)}
                                className="h-6 border border-border bg-control px-2.5 text-sm capitalize text-control-text hover:bg-control-active hover:text-foreground"
                                disabled={isPending}
                            >
                                {category.name}
                                <PlusIcon weight="duotone" className="size-4" />
                            </Button>
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
                                placeholder="Category name..."
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
                                    "h-8 flex-1 bg-control text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue",
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
