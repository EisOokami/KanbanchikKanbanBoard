"use client";

import { BaseAction } from "@/types/actions";
import { Label, NewProjectFormData } from "@/types/types";
import Chip from "../chip/Chip";
import ColorPicker from "../../colorPicker/ColorPicker";
import { Input } from "../../shadcn/input";
import { cn } from "@/libs/utils";
import { Button } from "../../shadcn/button";
import { PlusIcon } from "@phosphor-icons/react";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { useState } from "react";

interface LabelsSectionProps {
    formData: NewProjectFormData;
    formState: BaseAction | undefined;
    isPending: boolean;
    onFormDataChange: (formData: NewProjectFormData) => void;
}

export default function LabelsSection({
    formData,
    formState,
    isPending,
    onFormDataChange,
}: Readonly<LabelsSectionProps>) {
    const [newLabelName, setNewLabelName] = useState<string>("");
    const [newLabelColor, setNewLabelColor] = useState<string>("#000000");

    const addLabel = () => {
        if (!newLabelName.trim()) {
            return;
        }

        onFormDataChange({
            ...formData,
            labels: [
                ...formData.labels,
                {
                    id: new Date().getTime(),
                    name: newLabelName.trim(),
                    color: newLabelColor,
                },
            ],
        });
        setNewLabelName("");
    };

    const handleRemoveLabel = (
        label: Omit<Label, "updated_at" | "created_at">,
    ) => {
        onFormDataChange({
            ...formData,
            labels: formData.labels.filter(
                (labelState) => labelState.id !== label.id,
            ),
        });
    };

    return (
        <div className="space-y-1">
            <label className="font-semibold" htmlFor="labels">
                Labels
            </label>
            <div className="space-y-3">
                {formData.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {formData.labels.map((label) => (
                            <Chip
                                key={label.id}
                                label={label.name}
                                color={label.color}
                                onRemove={() =>
                                    isPending ? null : handleRemoveLabel(label)
                                }
                            />
                        ))}
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <ColorPicker
                        value={newLabelColor}
                        onChange={setNewLabelColor}
                        isPending={isPending}
                    />
                    <div className="flex w-full gap-2">
                        <Input
                            id="labels"
                            name="label"
                            placeholder="Label name…"
                            value={newLabelName}
                            onChange={(e) => setNewLabelName(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addLabel())
                            }
                            className={cn(
                                "h-8 flex-1 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue",
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
                            className="h-8 gap-1 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                            disabled={isPending}
                        >
                            <PlusIcon weight="duotone" className="size-4" /> Add
                        </Button>
                    </div>
                    <ZodErrors error={formState?.zodErrors?.labels} />
                </div>
            </div>
        </div>
    );
}
