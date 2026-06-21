"use client";

import { BaseAction } from "@/types/actions";
import { CreateTaskFormData } from "@/types/types";
import { Subtask } from "@/types/types";
import { useState } from "react";
import { Checkbox } from "../../shadcn/checkbox";
import { cn } from "@/libs/utils";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import { Input } from "../../shadcn/input";
import { Button } from "../../shadcn/button";
import { ZodErrors } from "../../zodErrors/ZodErrors";

interface SubtasksSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    formData: CreateTaskFormData;
    progressShow: boolean;
    onShowProgress: (show: boolean) => void;
    onFormDataChange: (formData: CreateTaskFormData) => void;
}

export default function SubtasksSection({
    formState,
    isPending,
    formData,
    progressShow,
    onShowProgress,
    onFormDataChange,
}: Readonly<SubtasksSectionProps>) {
    const [newSubtaskName, setNewSubtaskName] = useState<string>("");

    const completedChecks = formData.subtasks.filter(
        (subtask) => subtask.is_done,
    ).length;

    const onSubtaskAdd = () => {
        if (!newSubtaskName.trim()) {
            return;
        }

        onFormDataChange({
            ...formData,
            subtasks: [
                ...formData.subtasks,
                {
                    id: new Date().getTime(),
                    title: newSubtaskName,
                    is_done: false,
                    position: formData.subtasks.length,
                },
            ],
        });
        setNewSubtaskName("");
    };

    const onSubtaskToggle = (subtaskValue: Omit<Subtask, "created_at">) => {
        onFormDataChange({
            ...formData,
            subtasks: formData.subtasks.map((subtask) =>
                subtask.id === subtaskValue.id
                    ? { ...subtask, is_done: !subtask.is_done }
                    : subtask,
            ),
        });
    };

    const onSubtaskRemove = (subtaskValue: Omit<Subtask, "created_at">) => {
        onFormDataChange({
            ...formData,
            subtasks: formData.subtasks.filter(
                (subtask) => subtaskValue.id !== subtask.id,
            ),
        });
    };

    return (
        <div className="space-y-1">
            <label className="font-semibold" htmlFor="subtasks">
                Subtasks
            </label>
            <div className="space-y-3">
                {formData.subtasks.length > 0 && (
                    <>
                        {progressShow && (
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-bright-blue transition-all duration-500"
                                        style={{
                                            width: `${(completedChecks / formData.subtasks.length) * 100}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] text-muted-foreground">
                                    {completedChecks}/{formData.subtasks.length}
                                </span>
                            </div>
                        )}
                        <div className="space-y-1.5">
                            {formData.subtasks.map((subtask) => (
                                <div
                                    key={subtask.id}
                                    className="group flex items-center gap-3 rounded-md border border-border/50 bg-white px-3 py-2"
                                >
                                    <Checkbox
                                        id={subtask.id.toString()}
                                        name={subtask.id.toString()}
                                        checked={subtask.is_done}
                                        defaultValue={
                                            formState?.formData
                                                ?.get(subtask.id.toString())
                                                ?.toString() ?? undefined
                                        }
                                        onCheckedChange={() =>
                                            onSubtaskToggle(subtask)
                                        }
                                        className="rounded-md border-border data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                                        disabled={isPending}
                                    />
                                    <label
                                        htmlFor={subtask.id.toString()}
                                        className={cn(
                                            "flex-1 cursor-pointer text-sm",
                                            subtask.is_done
                                                ? "text-muted-foreground line-through"
                                                : "text-foreground",
                                        )}
                                    >
                                        {subtask.title}
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => onSubtaskRemove(subtask)}
                                        className="text-muted-foreground/50 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                                        disabled={isPending}
                                    >
                                        <XIcon
                                            weight="duotone"
                                            className="size-3.5"
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
                <div className="flex gap-2">
                    <Input
                        id="subtasks"
                        placeholder="Add subtasks item…"
                        value={newSubtaskName}
                        defaultValue={
                            formState?.formData?.get("subtasks")?.toString() ??
                            undefined
                        }
                        onChange={(e) => setNewSubtaskName(e.target.value)}
                        onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), onSubtaskAdd())
                        }
                        className={cn(
                            "h-8 flex-1 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue",
                            formState?.zodErrors?.subtasks
                                ? "border-red-500"
                                : "",
                        )}
                        disabled={isPending}
                    />
                    <Button
                        type="button"
                        size="sm"
                        onClick={onSubtaskAdd}
                        className="h-8 gap-1 bg-bright-blue text-white hover:bg-blue-600"
                        disabled={isPending}
                    >
                        <PlusIcon weight="duotone" className="size-3.5" /> Add
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="show-progress-input"
                        name="show-progress-input"
                        checked={progressShow}
                        onCheckedChange={() => onShowProgress(!progressShow)}
                        defaultValue={
                            formState?.formData
                                ?.get("show-progress-input")
                                ?.toString() ?? undefined
                        }
                        className="rounded-md border-border data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                        disabled={isPending}
                    />
                    <label
                        htmlFor="show-progress-input"
                        className="text-sm text-muted-foreground"
                    >
                        Show progress in the task
                    </label>
                </div>
            </div>
            <ZodErrors error={formState?.zodErrors?.showProgress} />
            <ZodErrors error={formState?.zodErrors?.subtasks} />
        </div>
    );
}
