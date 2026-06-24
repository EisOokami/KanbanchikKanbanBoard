"use client";

import { BaseAction } from "@/types/actions";
import Chip from "../chip/Chip";
import ColorPicker from "../../colorPicker/ColorPicker";
import { Input } from "../../shadcn/input";
import { Button } from "../../shadcn/button";
import { PlusIcon } from "@phosphor-icons/react";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { Category, NewProjectFormData } from "@/types/types";
import { useState } from "react";
import { cn } from "@/libs/utils";

interface CategoriesSectionProps {
    formData: NewProjectFormData;
    formState: BaseAction | undefined;
    isPending: boolean;
    onFormDataChange: (formData: NewProjectFormData) => void;
}

export default function CategoriesSection({
    formData,
    formState,
    isPending,
    onFormDataChange,
}: Readonly<CategoriesSectionProps>) {
    const [newCategoryName, setNewCategoryName] = useState<string>("");
    const [newCatColor, setNewCatColor] = useState<string>("#000");

    const addCategory = () => {
        if (!newCategoryName.trim()) {
            return;
        }

        onFormDataChange({
            ...formData,
            categories: [
                ...formData.categories,
                {
                    id: formData.categories.length + 1,
                    name: newCategoryName.trim(),
                    color: newCatColor,
                },
            ],
        });
        setNewCategoryName("");
    };

    const handleRemoveCategory = (
        category: Omit<Category, "updated_at" | "created_at">,
    ) => {
        onFormDataChange({
            ...formData,
            categories: formData.categories.filter(
                (categoriesState) => categoriesState.id !== category.id,
            ),
        });
    };

    return (
        <div className="space-y-1">
            <label className="font-semibold" htmlFor="categories">
                Categories
            </label>
            <div className="space-y-3">
                {formData.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {formData.categories.map((category) => (
                            <Chip
                                key={category.id}
                                label={category.name}
                                color={category.color}
                                onRemove={() =>
                                    isPending
                                        ? null
                                        : handleRemoveCategory(category)
                                }
                            />
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <ColorPicker
                        value={newCatColor}
                        onChange={setNewCatColor}
                        isPending={isPending}
                    />
                    <div className="flex w-full gap-2">
                        <Input
                            id="categories"
                            name="category"
                            placeholder="Category name…"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addCategory())
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
                            onClick={addCategory}
                            className="h-8 gap-1 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                            disabled={isPending}
                        >
                            <PlusIcon weight="duotone" className="size-4" /> Add
                        </Button>
                    </div>
                    <ZodErrors error={formState?.zodErrors?.categories} />
                </div>
            </div>
        </div>
    );
}
