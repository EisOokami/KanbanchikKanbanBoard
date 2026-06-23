"use client";

import {
    PencilSimpleIcon,
    PlusIcon,
    TrashSimpleIcon,
} from "@phosphor-icons/react";
import { Input } from "../../shadcn/input";
import { Button } from "../../shadcn/button";
import { Category, ProjectSettingsFormData } from "@/types/types";
import { BaseAction } from "@/types/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { PALETTE } from "@/constants/constants";
import ColorPicker from "../../colorPicker/ColorPicker";
import { useState } from "react";

interface CategoriesSectionProps {
    formData: ProjectSettingsFormData;
    categoryInputValues: { name: string; color: string };
    formState: BaseAction | undefined;
    isPending: boolean;
    onCategoryInputValuesChange: (categoryValue: {
        name: string;
        color: string;
    }) => void;
    onFormDataChange: (formData: ProjectSettingsFormData) => void;
}

export default function CategoriesSection({
    formData,
    categoryInputValues,
    formState,
    isPending,
    onCategoryInputValuesChange,
    onFormDataChange,
}: Readonly<CategoriesSectionProps>) {
    const [editingCategory, setEditingCategory] = useState<number | null>(null);

    const addCategory = () => {
        if (!categoryInputValues.name.trim()) {
            return;
        }

        onFormDataChange({
            ...formData,
            newCategories: [
                ...formData.newCategories,
                {
                    id: new Date().getTime(),
                    name: categoryInputValues.name.trim(),
                    color: categoryInputValues.color,
                },
            ],
        });
        onCategoryInputValuesChange({ name: "", color: PALETTE[0] });
    };

    const updateCategory = (id: number, patch: Partial<Category>) => {
        onFormDataChange({
            ...formData,
            categories: formData.categories.map((category) =>
                category.id === id ? { ...category, ...patch } : category,
            ),
            newCategories: formData.newCategories.map((category) =>
                category.id === id ? { ...category, ...patch } : category,
            ),
        });
    };

    const removeCategory = (id: number) => {
        onFormDataChange({
            ...formData,
            categories: formData.categories.filter(
                (category) => category.id !== id,
            ),
            newCategories: formData.newCategories.filter(
                (category) => category.id !== id,
            ),
        });
    };

    return (
        <div className="space-y-2">
            <h3 className="font-semibold">Categories</h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    {formData.categories.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-gray-50"
                        >
                            <ColorPicker
                                value={category.color}
                                onChange={(color) =>
                                    updateCategory(category.id, { color })
                                }
                                isPending={isPending}
                                buttonClassName="size-6"
                            />
                            {editingCategory === category.id ? (
                                <Input
                                    name="editing-category"
                                    autoFocus
                                    value={category.name}
                                    defaultValue={
                                        formState?.formData
                                            ?.get("editing-category")
                                            ?.toString() ?? undefined
                                    }
                                    onChange={(e) =>
                                        updateCategory(category.id, {
                                            name: e.target.value,
                                        })
                                    }
                                    onBlur={() => setEditingCategory(null)}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        setEditingCategory(null)
                                    }
                                    className="h-7 flex-1 rounded-md px-2 text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                                    disabled={isPending}
                                />
                            ) : (
                                <span className="flex-1 text-sm font-medium">
                                    {category.name}
                                </span>
                            )}
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditingCategory(category.id)
                                    }
                                    className="ml-1 flex size-6 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                                    disabled={isPending}
                                >
                                    <PencilSimpleIcon
                                        weight="duotone"
                                        size={16}
                                    />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeCategory(category.id)}
                                    className="flex size-6 items-center justify-center rounded-md text-gray-500 hover:bg-red-50 hover:text-red-400"
                                    disabled={isPending}
                                >
                                    <TrashSimpleIcon
                                        weight="duotone"
                                        size={16}
                                    />
                                </button>
                            </div>
                        </div>
                    ))}
                    {formData.newCategories.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-gray-50"
                        >
                            <ColorPicker
                                value={category.color}
                                onChange={(color) =>
                                    updateCategory(category.id, { color })
                                }
                                isPending={isPending}
                                buttonClassName="size-6"
                            />
                            {editingCategory === category.id ? (
                                <Input
                                    name="editing-category"
                                    autoFocus
                                    value={category.name}
                                    defaultValue={
                                        formState?.formData
                                            ?.get("editing-category")
                                            ?.toString() ?? undefined
                                    }
                                    onChange={(e) =>
                                        updateCategory(category.id, {
                                            name: e.target.value,
                                        })
                                    }
                                    onBlur={() => setEditingCategory(null)}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        setEditingCategory(null)
                                    }
                                    className="h-7 flex-1 rounded-md px-2 text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                                    disabled={isPending}
                                />
                            ) : (
                                <span className="flex-1 text-sm font-medium">
                                    {category.name}
                                </span>
                            )}
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditingCategory(category.id)
                                    }
                                    className="ml-1 flex size-6 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                                    disabled={isPending}
                                >
                                    <PencilSimpleIcon
                                        weight="duotone"
                                        size={16}
                                    />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeCategory(category.id)}
                                    className="flex size-6 items-center justify-center rounded-md text-gray-500 hover:bg-red-50 hover:text-red-400"
                                    disabled={isPending}
                                >
                                    <TrashSimpleIcon
                                        weight="duotone"
                                        size={16}
                                    />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2 rounded-md border p-3">
                    <ColorPicker
                        value={categoryInputValues.color}
                        onChange={(color) =>
                            onCategoryInputValuesChange({
                                ...categoryInputValues,
                                color: color,
                            })
                        }
                        isPending={isPending}
                    />
                    <div className="flex w-full items-center gap-2">
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
