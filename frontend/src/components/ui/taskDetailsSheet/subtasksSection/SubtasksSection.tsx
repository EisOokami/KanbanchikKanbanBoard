"use client";

import { CheckSquareIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { Checkbox } from "../../shadcn/checkbox";
import { Input } from "../../shadcn/input";
import { cn } from "@/libs/utils";
import { Button } from "../../shadcn/button";
import { Task, UpdateTaskFormData } from "@/types/types";
import { useState } from "react";
import { BaseAction } from "@/types/actions";
import { ZodErrors } from "../../zodErrors/ZodErrors";

interface SubtasksSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    formData: UpdateTaskFormData;
    task: Task;
    onFormDataChange: (formData: UpdateTaskFormData) => void;
}

export default function SubtasksSection({
    formData,
    formState,
    isPending,
    task,
    onFormDataChange,
}: Readonly<SubtasksSectionProps>) {
    const [newSubtaskText, setNewSubtaskText] = useState<string>("");
    const [progressShow, setProgressShow] = useState<boolean>(
        task.show_progress,
    );

    const toggleSubtask = (id: number) => {
        onFormDataChange({
            ...formData,
            subtasks: formData.subtasks.map((subtask) =>
                subtask.id === id
                    ? { ...subtask, is_done: !subtask.is_done }
                    : subtask,
            ),
            newSubtasks: formData.newSubtasks.map((subtask) =>
                subtask.id === id
                    ? { ...subtask, is_done: !subtask.is_done }
                    : subtask,
            ),
        });
    };

    const removeSubtask = (id: number) => {
        onFormDataChange({
            ...formData,
            subtasks: formData.subtasks.filter((subtask) => subtask.id !== id),
            newSubtasks: formData.newSubtasks.filter(
                (subtask) => subtask.id !== id,
            ),
        });
    };

    const updateSubtaskText = (id: number, text: string) => {
        onFormDataChange({
            ...formData,
            subtasks: formData.subtasks.map((subtask) =>
                subtask.id === id ? { ...subtask, text } : subtask,
            ),
            newSubtasks: formData.newSubtasks.map((subtask) =>
                subtask.id === id ? { ...subtask, text } : subtask,
            ),
        });
    };

    const addSubtask = () => {
        if (!newSubtaskText.trim()) {
            return;
        }

        const newSubtask = {
            id: new Date().getTime(),
            title: newSubtaskText.trim(),
            is_done: false,
            position: formData.subtasks.length + formData.newSubtasks.length,
        };

        onFormDataChange({
            ...formData,
            newSubtasks: [...formData.newSubtasks, newSubtask],
        });
        setNewSubtaskText("");
    };

    const doneSubtasks = formData.subtasks.filter(
        (subtask) => subtask.is_done,
    ).length;
    const totalSubtasks = formData.subtasks.length;
    const subtasksPercent = totalSubtasks
        ? Math.round((doneSubtasks / totalSubtasks) * 100)
        : 0;

    return (
        <div className="mb-5">
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <CheckSquareIcon
                        weight="duotone"
                        size={16}
                        className="text-gray-500"
                    />
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Subtasks
                    </span>
                    {totalSubtasks > 0 && (
                        <span className="ml-1 text-xs text-gray-500">
                            {doneSubtasks}/{totalSubtasks}
                        </span>
                    )}
                </div>
                {totalSubtasks > 0 && (
                    <span
                        className="text-xs font-semibold"
                        style={{
                            color:
                                subtasksPercent === 100 ? "#1E7E3A" : "#0096FF",
                        }}
                    >
                        {subtasksPercent}%
                    </span>
                )}
            </div>
            {totalSubtasks > 0 && (
                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${subtasksPercent}%`,
                            background:
                                subtasksPercent === 100 ? "#1E7E3A" : "#0096FF",
                        }}
                    />
                </div>
            )}
            <div className="space-y-2">
                {formData.subtasks.map((subtask) => (
                    <div
                        key={subtask.id}
                        className={cn(
                            "group/ci flex items-center gap-2.5 rounded-md px-1 py-0.5 transition-colors hover:bg-gray-50",
                            formState?.zodErrors?.subtasks
                                ? "border-red-500"
                                : "",
                        )}
                    >
                        <Checkbox
                            name="subtask-checkbox"
                            checked={!!subtask.is_done}
                            onCheckedChange={() => toggleSubtask(subtask.id)}
                            className="size-3.5 rounded border-gray-300 data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                            disabled={isPending}
                        />
                        <Input
                            name="subtask-title"
                            value={subtask.title}
                            onChange={(e) =>
                                updateSubtaskText(subtask.id, e.target.value)
                            }
                            className={cn(
                                "h-auto flex-1 rounded-none border-0 bg-transparent px-0 py-0 text-sm focus-visible:ring-0",
                                subtask.is_done ? "line-through" : "",
                            )}
                            style={{
                                color: subtask.is_done ? "#6b7280" : "#374151",
                            }}
                            disabled={isPending}
                        />
                        <button
                            type="button"
                            onClick={() => removeSubtask(subtask.id)}
                            className="shrink-0 text-gray-300 opacity-0 transition-all hover:text-red-400 group-hover/ci:opacity-100"
                            disabled={isPending}
                        >
                            <XIcon weight="duotone" size={16} />
                        </button>
                    </div>
                ))}
                {formData.newSubtasks.map((subtask) => (
                    <div
                        key={subtask.id}
                        className={cn(
                            "group/ci flex items-center gap-2.5 rounded-md px-1 py-0.5 transition-colors hover:bg-gray-50",
                            formState?.zodErrors?.newSubtasks
                                ? "border-red-500"
                                : "",
                        )}
                    >
                        <Checkbox
                            name="subtask-checkbox"
                            checked={!!subtask.is_done}
                            onCheckedChange={() => toggleSubtask(subtask.id)}
                            className="size-3.5 rounded border-gray-300 data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                            disabled={isPending}
                        />
                        <Input
                            name="subtask-title"
                            value={subtask.title}
                            onChange={(e) =>
                                updateSubtaskText(subtask.id, e.target.value)
                            }
                            className={cn(
                                "h-auto flex-1 rounded-none border-0 bg-transparent px-0 py-0 text-sm focus-visible:ring-0",
                                subtask.is_done ? "line-through" : "",
                            )}
                            style={{
                                color: subtask.is_done ? "#6b7280" : "#374151",
                            }}
                            disabled={isPending}
                        />
                        <button
                            type="button"
                            onClick={() => removeSubtask(subtask.id)}
                            className="shrink-0 text-gray-300 opacity-0 transition-all hover:text-red-400 group-hover/ci:opacity-100"
                            disabled={isPending}
                        >
                            <XIcon weight="duotone" size={16} />
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-3 flex gap-2">
                <Input
                    name="add-subtask"
                    placeholder="Add subtask…"
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                    className="h-8 flex-1 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                    disabled={isPending}
                />
                <Button
                    type="button"
                    size="sm"
                    onClick={addSubtask}
                    className="h-8 rounded-md border bg-bright-blue px-3 transition-colors hover:bg-blue-600 [&_svg]:size-4"
                    disabled={isPending}
                >
                    <PlusIcon weight="duotone" size={16} />
                </Button>
            </div>
            <div className="mt-2 flex items-center gap-2">
                <Checkbox
                    id="show-progress-input"
                    name="show-progress-input"
                    checked={!!progressShow}
                    onCheckedChange={() => setProgressShow(!progressShow)}
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
            <ZodErrors error={formState?.zodErrors?.subtasks} />
            <ZodErrors error={formState?.zodErrors?.newSubtasks} />
            <input
                type="hidden"
                name="show-progress"
                value={String(!!progressShow)}
            />
        </div>
    );
}
