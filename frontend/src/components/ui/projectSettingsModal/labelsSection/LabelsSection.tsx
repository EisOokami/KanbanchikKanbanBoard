"use client";

import {
    PencilSimpleIcon,
    PlusIcon,
    TrashSimpleIcon,
} from "@phosphor-icons/react";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { cn } from "@/libs/utils";
import { PALETTE } from "@/constants/constants";
import { useState } from "react";
import { Label, ProjectSettingsFormData } from "@/types/types";
import { BaseAction } from "@/types/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";

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
        onLabelInputValuesChange({ name: "", color: PALETTE[0] });
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
                            className="flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-gray-50"
                        >
                            <div
                                className="size-5 shrink-0 rounded-full border-2 border-white shadow-sm"
                                style={{
                                    background: label.color,
                                }}
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
                                {PALETTE.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() =>
                                            updateLabel(label.id, {
                                                color: c,
                                            })
                                        }
                                        className={cn(
                                            "size-4 rounded-full transition-transform hover:scale-110",
                                            label.color === c
                                                ? "ring-2 ring-gray-400 ring-offset-1"
                                                : "",
                                        )}
                                        style={{
                                            background: c,
                                        }}
                                        disabled={isPending}
                                    />
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setEditingLabel(label.id)}
                                    className="ml-1 flex size-6 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                                    disabled={isPending}
                                >
                                    <PencilSimpleIcon
                                        weight="duotone"
                                        size={11}
                                    />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeLabel(label.id)}
                                    className="flex size-6 items-center justify-center rounded-md text-gray-500 hover:bg-red-50 hover:text-red-400"
                                    disabled={isPending}
                                >
                                    <TrashSimpleIcon
                                        weight="duotone"
                                        size={11}
                                    />
                                </button>
                            </div>
                        </div>
                    ))}
                    {formData.newLabels.map((label) => (
                        <div
                            key={label.id}
                            className="flex items-center gap-3 rounded-md border px-3 py-2.5 transition-colors hover:bg-gray-50"
                        >
                            <div
                                className="size-5 shrink-0 rounded-full border-2 border-white shadow-sm"
                                style={{
                                    background: label.color,
                                }}
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
                                {PALETTE.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() =>
                                            updateLabel(label.id, {
                                                color: c,
                                            })
                                        }
                                        className={cn(
                                            "size-4 rounded-full transition-transform hover:scale-110",
                                            label.color === c
                                                ? "ring-2 ring-gray-400 ring-offset-1"
                                                : "",
                                        )}
                                        style={{
                                            background: c,
                                        }}
                                        disabled={isPending}
                                    />
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setEditingLabel(label.id)}
                                    className="ml-1 flex size-6 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100"
                                    disabled={isPending}
                                >
                                    <PencilSimpleIcon
                                        weight="duotone"
                                        size={11}
                                    />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeLabel(label.id)}
                                    className="flex size-6 items-center justify-center rounded-md text-gray-500 hover:bg-red-50 hover:text-red-400"
                                    disabled={isPending}
                                >
                                    <TrashSimpleIcon
                                        weight="duotone"
                                        size={11}
                                    />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-2 rounded-md border p-3">
                    <div className="flex flex-wrap gap-1.5">
                        {PALETTE.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() =>
                                    onLabelInputValuesChange({
                                        ...labelInputValues,
                                        color: c,
                                    })
                                }
                                className={cn(
                                    "size-5 rounded-full transition-transform hover:scale-110",
                                    labelInputValues.color === c
                                        ? "ring-2 ring-bright-blue ring-offset-1"
                                        : "",
                                )}
                                style={{
                                    background: c,
                                }}
                                disabled={isPending}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <div
                            className="size-5 shrink-0 self-center rounded-full border-2 border-white shadow"
                            style={{
                                background: labelInputValues.color,
                            }}
                        />
                        <Input
                            name="label"
                            placeholder="Label name…"
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
                            className="h-8 flex-1 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
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
                <ZodErrors error={formState?.zodErrors?.labels} />
            </div>
        </div>
    );
}
