"use client";

import { BaseAction } from "@/types/actions";
import { CreateTaskFormData } from "@/types/types";
import Chip from "../chip/Chip";
import ColorDotPicker from "../colorDotPicker/ColorDotPicker";
import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "../../shadcn/button";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { Label, Project } from "@/types/types";
import { useState } from "react";
import { PALETTE } from "@/constants/constants";
import { Input } from "../../shadcn/input";

interface LabelsSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    formData: CreateTaskFormData;
    selectedProject: Project;
    onFormDataChange: (formData: CreateTaskFormData) => void;
}

export default function LabelsSection({
    formState,
    isPending,
    formData,
    selectedProject,
    onFormDataChange,
}: Readonly<LabelsSectionProps>) {
    const [newLabelName, setNewLabelName] = useState<string>("");
    const [newLabelColor, setNewLabelColor] = useState<string>(PALETTE[0]);

    const onNewLabelAdd = () => {
        const label = newLabelName.trim();

        if (
            !label ||
            formData.labels.some(
                (formDataLabel) => formDataLabel.name === label,
            )
        ) {
            return;
        }

        onFormDataChange({
            ...formData,
            newLabels: [
                ...formData.newLabels,
                {
                    id: new Date().getTime(),
                    name: newLabelName,
                    color: newLabelColor,
                },
            ],
        });
        setNewLabelName("");
    };

    const onNewLabelRemove = (
        labelValue: Omit<Label, "created_at" | "updated_at">,
    ) => {
        onFormDataChange({
            ...formData,
            newLabels: formData.newLabels.filter(
                (label) => label.id !== labelValue.id,
            ),
        });
    };

    const onLabelSelect = (label: Label) => {
        onFormDataChange({
            ...formData,
            labels: [...formData.labels, label],
        });
    };

    const onLabelRemove = (labelValue: Label) => {
        onFormDataChange({
            ...formData,
            labels: formData.labels.filter(
                (label) => label.id !== labelValue.id,
            ),
        });
    };

    return (
        <div className="space-y-1">
            <label className="font-semibold" htmlFor="label">
                Labels <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
                {formData.labels.length || formData.newLabels.length ? (
                    <div className="flex flex-wrap gap-1.5">
                        {formData.labels.map((label) => (
                            <Chip
                                key={label.id}
                                label={label.name}
                                color={label.color}
                                onRemove={() => onLabelRemove(label)}
                                isPending={isPending}
                            />
                        ))}
                        {formData.newLabels.map((label) => (
                            <Chip
                                key={label.id}
                                label={label.name}
                                color={label.color}
                                onRemove={() => onNewLabelRemove(label)}
                                isPending={isPending}
                            />
                        ))}
                    </div>
                ) : null}
                <div className="flex flex-wrap gap-1.5">
                    {selectedProject.labels
                        .filter(
                            (label) =>
                                !formData.labels.some(
                                    (formDataLabel) =>
                                        formDataLabel.id === label.id,
                                ),
                        )
                        .map((label) => (
                            <button
                                key={label.id}
                                type="button"
                                onClick={() => onLabelSelect(label)}
                                className="flex items-center gap-1 rounded-md border border-border/60 bg-white px-2.5 py-0.5 text-sm capitalize text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                                disabled={isPending}
                            >
                                {label.name}
                                <PlusIcon weight="duotone" className="size-4" />
                            </button>
                        ))}
                </div>
                <div className="space-y-4">
                    <ColorDotPicker
                        value={newLabelColor}
                        onChange={setNewLabelColor}
                        colors={PALETTE}
                    />
                    <div className="flex gap-2">
                        <Input
                            id="label"
                            name="label"
                            placeholder="Label name…"
                            value={newLabelName}
                            defaultValue={
                                formState?.formData?.get("label")?.toString() ??
                                undefined
                            }
                            onChange={(e) => setNewLabelName(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), onNewLabelAdd())
                            }
                            className={`h-8 flex-1 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue ${
                                formState?.zodErrors?.labels
                                    ? "border-red-500"
                                    : ""
                            }`}
                            disabled={isPending}
                        />
                        <Button
                            type="button"
                            size="sm"
                            onClick={onNewLabelAdd}
                            className="h-8 gap-1 bg-bright-blue text-white hover:bg-blue-600"
                            disabled={isPending}
                        >
                            <PlusIcon weight="duotone" className="size-3.5" />{" "}
                            Add
                        </Button>
                    </div>
                </div>
                <ZodErrors error={formState?.zodErrors?.labels} />
            </div>
        </div>
    );
}
