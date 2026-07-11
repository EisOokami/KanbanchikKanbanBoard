"use client";

import { Textarea } from "../../shadcn/textarea";
import { Input } from "../../shadcn/input";
import { STATUS_CONFIG } from "@/constants/constants";
import { Status } from "@/types/types";
import { cn } from "@/libs/utils";
import { BaseAction } from "@/types/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import ProjectColorPicker from "../../projectColorPicker/ProjectColorPicker";
import ProjectIconPicker from "../../projectIconPicker/ProjectIconPicker";
import { Checkbox } from "../../shadcn/checkbox";

interface GeneralSectionProps {
    icon: string;
    color: string;
    name: string;
    description: string;
    status: Status;
    showPriorityEmoji: boolean;
    formState: BaseAction | undefined;
    isPending: boolean;
    onIconChange: (iconValue: string) => void;
    onColorChange: (colorValue: string) => void;
    onNameChange: (nameValue: string) => void;
    onDescriptionChange: (descriptionValue: string) => void;
    onStatusChange: (status: Status) => void;
    onShowPriorityEmojiChange: (isChecked: boolean) => void;
}

export default function GeneralSection({
    icon,
    color,
    name,
    description,
    status,
    showPriorityEmoji,
    formState,
    isPending,
    onIconChange,
    onColorChange,
    onNameChange,
    onDescriptionChange,
    onStatusChange,
    onShowPriorityEmojiChange,
}: Readonly<GeneralSectionProps>) {
    return (
        <div className="space-y-5">
            <div className="flex items-start gap-6">
                <div className="space-y-2">
                    <h3 className="font-semibold">Project Icon</h3>
                    <div className="flex items-start gap-3">
                        <ProjectIconPicker
                            projectIcon={icon}
                            projectColor={color}
                            isPending={isPending}
                            onProjectIconChange={(iconValue) =>
                                onIconChange(iconValue)
                            }
                        />
                        <ProjectColorPicker
                            projectColor={color}
                            onProjectColorChange={(colorValue) =>
                                onColorChange(colorValue)
                            }
                            isPending={isPending}
                        />
                    </div>
                    <div>
                        <ZodErrors error={formState?.zodErrors?.icon} />
                        <ZodErrors error={formState?.zodErrors?.color} />
                    </div>
                </div>
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold">Name</h3>
                <Input
                    value={name}
                    defaultValue={
                        formState?.formData?.get("name")?.toString() ??
                        undefined
                    }
                    onChange={(e) => onNameChange(e.target.value)}
                    className={cn(
                        "h-10 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue",
                        formState?.zodErrors?.name ? "border-red-500" : "",
                    )}
                    disabled={isPending}
                />
                <div>
                    <ZodErrors error={formState?.zodErrors?.name} />
                </div>
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold">Description</h3>
                <Textarea
                    name="description"
                    value={description}
                    defaultValue={
                        formState?.formData?.get("description")?.toString() ??
                        undefined
                    }
                    onChange={(e) => onDescriptionChange(e.target.value)}
                    rows={4}
                    className={cn(
                        "resize-none rounded-md text-xs placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue",
                        formState?.zodErrors?.description
                            ? "border-red-500"
                            : "",
                    )}
                    disabled={isPending}
                />
                <p className="mt-1 text-xs text-gray-500">
                    {description ? description.length : 0}
                    /500
                </p>
                <div>
                    <ZodErrors error={formState?.zodErrors?.description} />
                </div>
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold">Status</h3>
                <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(STATUS_CONFIG) as Status[]).map(
                        (statusConfig) => (
                            <button
                                key={statusConfig}
                                type="button"
                                onClick={() => onStatusChange(statusConfig)}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium transition-all hover:bg-muted",
                                    status === statusConfig
                                        ? "bg-muted ring-1 ring-border"
                                        : "opacity-60 hover:opacity-100",
                                )}
                                disabled={isPending}
                            >
                                <span
                                    className="size-1.5 rounded-full"
                                    style={{
                                        backgroundColor:
                                            STATUS_CONFIG[statusConfig].dot,
                                    }}
                                />
                                {STATUS_CONFIG[statusConfig].label}
                            </button>
                        ),
                    )}
                </div>
                <div>
                    <ZodErrors error={formState?.zodErrors?.status} />
                </div>
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold">Priority</h3>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="show-priority-emoji-input"
                        name="show-priority-emoji-input"
                        checked={!!showPriorityEmoji}
                        onCheckedChange={() =>
                            onShowPriorityEmojiChange(!showPriorityEmoji)
                        }
                        defaultValue={
                            formState?.formData
                                ?.get("show-priority-emoji-input")
                                ?.toString() ?? undefined
                        }
                        className="rounded-md border-border data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                        disabled={isPending}
                    />
                    <label
                        htmlFor="show-priority-emoji-input"
                        className="text-sm text-muted-foreground"
                    >
                        Show emoji in the priority
                    </label>
                </div>
                <div>
                    <ZodErrors
                        error={formState?.zodErrors?.showPriorityEmoji}
                    />
                </div>
            </div>
        </div>
    );
}
