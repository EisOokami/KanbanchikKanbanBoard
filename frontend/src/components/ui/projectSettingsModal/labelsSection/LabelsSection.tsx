"use client";

import {
    PencilSimpleIcon,
    PlusIcon,
    TrashSimpleIcon,
} from "@phosphor-icons/react";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { useState } from "react";
import { Label, ProjectSettingsFormData } from "@/types/types";
import { BaseAction } from "@/types/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import ColorPicker from "../../colorPicker/ColorPicker";
import { cn } from "@/libs/utils";

interface LabelsSectionProps {
    formData: ProjectSettingsFormData;
    labelInputValues: {
        name: string;
        color: string;
    };
    formState: BaseAction | undefined;
    isPending: boolean;
    onLabelInputValuesChange: (inputValues: {
        name: string;
        color: string;
    }) => void;
    onFormDataChange: (formData: ProjectSettingsFormData) => void;
}

export default function LabelsSection({
    formData,
    labelInputValues,
    formState,
    isPending,
    onLabelInputValuesChange,
    onFormDataChange,
}: Readonly<LabelsSectionProps>) {
    const [editingLabel, setEditingLabel] = useState<number | null>(null);

    const addLabel = () => {
        if (!labelInputValues.name.trim()) {
            return;
        }

        onFormDataChange({
            ...formData,
            newLabels: [
                ...formData.newLabels,
                {
                    id: new Date().getTime(),
                    name: labelInputValues.name.trim(),
                    color: labelInputValues.color,
                },
            ],
        });
        onLabelInputValuesChange({ name: "", color: "#000000" });
    };

    const updateLabel = (id: number, patch: Partial<Label>) => {
        onFormDataChange({
            ...formData,
            labels: formData.labels.map((label) =>
                label.id === id ? { ...label, ...patch } : label,
            ),
            newLabels: formData.newLabels.map((label) =>
                label.id === id ? { ...label, ...patch } : label,
            ),
        });
    };

    const removeLabel = (id: number) => {
        onFormDataChange({
            ...formData,
            labels: formData.labels.filter((label) => label.id !== id),
            newLabels: formData.newLabels.filter((label) => label.id !== id),
            deletedLabelIds: formData.labels.some((label) => label.id === id)
                ? [...formData.deletedLabelIds, id]
                : formData.deletedLabelIds,
        });
    };

    return (
        <div className="space-y-1">
            <h3 className="font-semibold">Labels</h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    {formData.labels.map((label) => (
                        <div
                            key={label.id}
                            className="flex items-center gap-3 rounded-md border border-border bg-control px-3 py-2.5 transition-colors hover:bg-control-active"
                        >
                            <ColorPicker
                                value={label.color}
                                onChange={(color) =>
                                    updateLabel(label.id, {
                                        color: color,
                                    })
                                }
                                isPending={isPending}
                                buttonClassName="size-6"
                            />
                            {editingLabel === label.id ? (
                                <Input
                                    name="editing-label"
                                    autoFocus
                                    value={label.name}
                                    defaultValue={
                                        formState?.formData
                                            ?.get("editing-label")
                                            ?.toString() ?? undefined
                                    }
                                    onChange={(e) =>
                                        updateLabel(label.id, {
                                            name: e.target.value,
                                        })
                                    }
                                    onBlur={() => setEditingLabel(null)}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        setEditingLabel(null)
                                    }
                                    className="h-7 flex-1 rounded-md px-2 text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                                    disabled={isPending}
                                />
                            ) : (
                                <span className="flex-1 text-sm font-medium">
                                    {label.name}
                                </span>
                            )}
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingLabel(label.id)}
                                    className="ml-1 size-7 text-control-text hover:bg-control-active"
                                    disabled={isPending}
                                >
                                    <PencilSimpleIcon
                                        weight="duotone"
                                        size={16}
                                    />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeLabel(label.id)}
                                    className="size-7 text-control-text hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950  dark:hover:text-red-600"
                                    disabled={isPending}
                                >
                                    <TrashSimpleIcon
                                        weight="duotone"
                                        size={16}
                                    />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {formData.newLabels.map((label) => (
                        <div
                            key={label.id}
                            className="flex items-center gap-3 rounded-md border border-border bg-control px-3 py-2.5 transition-colors hover:bg-control-active"
                        >
                            <ColorPicker
                                value={label.color}
                                onChange={(color) =>
                                    updateLabel(label.id, {
                                        color: color,
                                    })
                                }
                                isPending={isPending}
                                buttonClassName="size-6"
                            />
                            {editingLabel === label.id ? (
                                <Input
                                    name="editing-label"
                                    autoFocus
                                    value={label.name}
                                    defaultValue={
                                        formState?.formData
                                            ?.get("editing-label")
                                            ?.toString() ?? undefined
                                    }
                                    onChange={(e) =>
                                        updateLabel(label.id, {
                                            name: e.target.value,
                                        })
                                    }
                                    onBlur={() => setEditingLabel(null)}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        setEditingLabel(null)
                                    }
                                    className="h-7 flex-1 rounded-md px-2 text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                                    disabled={isPending}
                                />
                            ) : (
                                <span className="flex-1 text-sm font-medium">
                                    {label.name}
                                </span>
                            )}
                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingLabel(label.id)}
                                    className="ml-1 size-7 text-control-text hover:bg-control-active"
                                    disabled={isPending}
                                >
                                    <PencilSimpleIcon
                                        weight="duotone"
                                        size={16}
                                    />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeLabel(label.id)}
                                    className="size-7 text-control-text hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950  dark:hover:text-red-600"
                                    disabled={isPending}
                                >
                                    <TrashSimpleIcon
                                        weight="duotone"
                                        size={16}
                                    />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <ColorPicker
                            value={labelInputValues.color}
                            onChange={(color) =>
                                onLabelInputValuesChange({
                                    ...labelInputValues,
                                    color: color,
                                })
                            }
                            isPending={isPending}
                        />
                        <Input
                            name="label"
                            placeholder="Label name..."
                            value={labelInputValues.name}
                            defaultValue={
                                formState?.formData?.get("label")?.toString() ??
                                undefined
                            }
                            onChange={(e) =>
                                onLabelInputValuesChange({
                                    ...labelInputValues,
                                    name: e.target.value,
                                })
                            }
                            onKeyDown={(e) => e.key === "Enter" && addLabel()}
                            className={cn(
                                "h-8 flex-1 rounded-md bg-control text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue",
                                formState?.zodErrors?.labels
                                    ? "border-red-500"
                                    : "",
                            )}
                            disabled={isPending}
                        />
                        <Button
                            type="button"
                            size="sm"
                            onClick={addLabel}
                            disabled={
                                !labelInputValues.name.trim() || isPending
                            }
                            className="h-8 rounded-md bg-bright-blue px-3 text-xs text-white hover:bg-blue-600 disabled:opacity-40"
                        >
                            <PlusIcon weight="duotone" size={13} />
                        </Button>
                    </div>
                </div>
                <div>
                    <ZodErrors error={formState?.zodErrors?.labels} />
                </div>
            </div>
        </div>
    );
}
