"use client";

import { HashIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { Input } from "../../shadcn/input";
import { Button } from "../../shadcn/button";
import { Category } from "@/types/types";
import { BaseAction } from "@/types/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { PALETTE } from "@/constants/constants";
import { cn } from "@/libs/utils";

interface CategoriesSectionProps {
    categories: Category[];
    newCategories: { id: number; name: string; color: string }[];
    categoryInputValues: { name: string; color: string };
    formState: BaseAction | undefined;
    isPending: boolean;
    onCategoriesChange: (categoriesValue: Category[]) => void;
    onNewCategoriesChange: (
        newCategoriesValue: { id: number; name: string; color: string }[],
    ) => void;
    onCategoryInputValuesChange: (categoryValue: {
        name: string;
        color: string;
    }) => void;
}

export default function CategoriesSection({
    categories,
    newCategories,
    categoryInputValues,
    formState,
    isPending,
    onCategoriesChange,
    onNewCategoriesChange,
    onCategoryInputValuesChange,
}: CategoriesSectionProps) {
    const addCategory = () => {
        if (!categoryInputValues.name.trim()) {
            return;
        }

        onNewCategoriesChange([
            ...newCategories,
            {
                id: new Date().getTime(),
                name: categoryInputValues.name.trim(),
                color: categoryInputValues.color,
            },
        ]);
        onCategoryInputValuesChange({ name: "", color: PALETTE[0] });
    };

    const updateCategory = (id: number, patch: Partial<Category>) => {
        onCategoriesChange(
            categories.map((category) =>
                category.id === id ? { ...category, ...patch } : category,
            ),
        );
        onNewCategoriesChange(
            newCategories.map((category) =>
                category.id === id ? { ...category, ...patch } : category,
            ),
        );
    };

    const removeCategory = (id: number) => {
        onCategoriesChange(categories.filter((category) => category.id !== id));
        onNewCategoriesChange(
            newCategories.filter((category) => category.id !== id),
        );
    };

    return (
        <div className="space-y-2">
            <h3 className="font-semibold">Categories</h3>
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium"
                        >
                            <HashIcon
                                weight="duotone"
                                size={12}
                                style={{ color: category.color || undefined }}
                            />
                            {category.name}
                            <div className="ml-1 flex items-center gap-0.5">
                                {PALETTE.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() =>
                                            updateCategory(category.id, {
                                                color: color,
                                            })
                                        }
                                        className={cn(
                                            "size-3 rounded-full transition-transform hover:scale-110",
                                            category.color === color
                                                ? "ring-2 ring-gray-400 ring-offset-1"
                                                : "",
                                        )}
                                        style={{ background: color }}
                                        disabled={isPending}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeCategory(category.id)}
                                className="ml-0.5 text-gray-500 transition-all hover:text-red-500"
                                disabled={isPending}
                            >
                                <XIcon weight="duotone" size={11} />
                            </button>
                        </div>
                    ))}
                    {newCategories.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium"
                        >
                            <HashIcon
                                weight="duotone"
                                size={12}
                                style={{ color: category.color || undefined }}
                            />
                            {category.name}
                            <div className="ml-1 flex items-center gap-0.5">
                                {PALETTE.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() =>
                                            updateCategory(category.id, {
                                                color: color,
                                            })
                                        }
                                        className={cn(
                                            "size-3 rounded-full transition-transform hover:scale-110",
                                            category.color === color
                                                ? "ring-2 ring-gray-400 ring-offset-1"
                                                : "",
                                        )}
                                        style={{ background: color }}
                                        disabled={isPending}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeCategory(category.id)}
                                className="ml-0.5 text-gray-500 transition-all hover:text-red-500"
                                disabled={isPending}
                            >
                                <XIcon weight="duotone" size={11} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="space-y-2 rounded-md border p-3">
                    <div className="flex flex-wrap gap-1.5">
                        {PALETTE.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() =>
                                    onCategoryInputValuesChange({
                                        ...categoryInputValues,
                                        color: color,
                                    })
                                }
                                className={cn(
                                    "size-5 rounded-full transition-transform hover:scale-110",
                                    categoryInputValues.color === color
                                        ? "ring-2 ring-bright-blue ring-offset-1"
                                        : "",
                                )}
                                style={{ background: color }}
                                disabled={isPending}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <HashIcon
                            weight="duotone"
                            size={13}
                            style={{
                                color: categoryInputValues.color || undefined,
                            }}
                        />
                        <Input
                            name="category"
                            placeholder="New category…"
                            value={categoryInputValues.name}
                            defaultValue={
                                formState?.formData
                                    ?.get("category")
                                    ?.toString() ?? undefined
                            }
                            onChange={(e) =>
                                onCategoryInputValuesChange({
                                    ...categoryInputValues,
                                    name: e.target.value,
                                })
                            }
                            onKeyDown={(e) =>
                                e.key === "Enter" && addCategory()
                            }
                            className="h-8 flex-1 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                            disabled={isPending}
                        />
                        <Button
                            type="button"
                            size="sm"
                            onClick={addCategory}
                            disabled={
                                !categoryInputValues.name.trim() || isPending
                            }
                            className="h-8 rounded-md bg-bright-blue px-3 text-xs text-white hover:bg-blue-600 disabled:opacity-40"
                        >
                            <PlusIcon weight="duotone" size={13} />
                        </Button>
                    </div>
                </div>
                <ZodErrors error={formState?.zodErrors?.categories} />
            </div>
        </div>
    );
}
