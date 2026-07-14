"use client";

import {
    BookmarkSimpleIcon,
    CheckIcon,
    PlusIcon,
    XIcon,
} from "@phosphor-icons/react";
import FieldRow from "../../fieldRow/FieldRow";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import { Label, Project, UpdateTaskFormData } from "@/types/types";
import { useState } from "react";
import { cn } from "@/libs/utils";

interface LabelsSectionProps {
    isPending: boolean;
    formData: UpdateTaskFormData;
    projectData: Project;
    hasPermission: boolean;
    onFormDataChange: (formData: UpdateTaskFormData) => void;
}

export default function LabelsSection({
    isPending,
    formData,
    projectData,
    hasPermission,
    onFormDataChange,
}: Readonly<LabelsSectionProps>) {
    const [labelOpen, setLabelOpen] = useState<boolean>(false);

    const toggleLabel = (labelValue: Label) => {
        const exists = formData.labels.some(
            (label) => label.id === labelValue.id,
        );

        onFormDataChange({
            ...formData,
            labels: exists
                ? formData.labels.filter((label) => label.id !== labelValue.id)
                : [...formData.labels, labelValue],
        });
    };

    return (
        <FieldRow
            icon={<BookmarkSimpleIcon weight="duotone" size={16} />}
            label="Labels"
        >
            <div className="flex flex-wrap items-center gap-1.5">
                {formData.labels.map((label) => {
                    const selectedLabel = projectData.labels.find(
                        (projectLabel) => projectLabel.id === label.id,
                    );

                    if (!selectedLabel) {
                        return null;
                    }

                    return (
                        <span
                            key={label.id}
                            className={cn(
                                "flex items-center gap-1 rounded-md border border-border px-2 py-0.5 text-xs font-medium capitalize text-white",
                                hasPermission &&
                                    "cursor-pointer transition-colors hover:opacity-80",
                            )}
                            style={{
                                background: selectedLabel.color,
                            }}
                            onClick={() =>
                                hasPermission && toggleLabel(selectedLabel)
                            }
                        >
                            {label.name}
                            {hasPermission && (
                                <XIcon weight="duotone" size={14} />
                            )}
                        </span>
                    );
                })}
                {hasPermission && (
                    <Popover open={labelOpen} onOpenChange={setLabelOpen}>
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
                        <PopoverContent className="w-48 border-border p-2">
                            <div className="flex flex-col gap-0.5">
                                {projectData.labels.map((label) => {
                                    const selectedLabel = formData.labels.some(
                                        (formDataLabel) =>
                                            formDataLabel.id === label.id,
                                    );

                                    return (
                                        <button
                                            type="button"
                                            key={label.id}
                                            onClick={() => toggleLabel(label)}
                                            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-control-active"
                                            disabled={isPending}
                                        >
                                            <span
                                                className="size-2 shrink-0 rounded-full"
                                                style={{
                                                    background: label.color,
                                                }}
                                            />
                                            <span className="flex-1 text-left font-medium capitalize">
                                                {label.name}
                                            </span>
                                            {selectedLabel && (
                                                <CheckIcon
                                                    weight="duotone"
                                                    size={16}
                                                    className="text-bright-blue"
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
                {formData.labels.length === 0 && (
                    <span className="text-sm text-gray-300">No labels</span>
                )}
            </div>
        </FieldRow>
    );
}
