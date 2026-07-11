"use client";

import {
    CaretDownIcon,
    CheckIcon,
    LinkIcon,
    TrashSimpleIcon,
    XIcon,
} from "@phosphor-icons/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../shadcn/dropdown-menu";
import { PRIORITY_CONFIG } from "@/constants/constants";
import { Column, Priority, Project, Task } from "@/types/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../shadcn/tooltip";
import { useState } from "react";
import { deleteTaskAction, generateInviteAction } from "@/data/actions";
import { toast } from "sonner";

interface HeaderProps {
    isPending: boolean;
    task: Task;
    projectData: Project;
    column: Column;
    priority: Priority;
    onOpenChange: (open: boolean) => void;
    onColumnChange: (column: Column) => void;
    onPriorityChange: (priority: Priority) => void;
}

export default function Header({
    isPending,
    task,
    projectData,
    column,
    priority,
    onOpenChange,
    onColumnChange,
    onPriorityChange,
}: Readonly<HeaderProps>) {
    const [linkCopied, setLinkCopied] = useState<boolean>(false);

    const handleCopyLink = async () => {
        const result = await generateInviteAction(projectData.id);

        if (!result || !result.ok || !result.inviteUrl) {
            toast.success("Error", {
                description: "Something went wrong",
            });

            return;
        }

        if (result && result.ok) {
            toast.success("Success", {
                description: `Invite has been sent`,
            });
        }

        if (result && !result.ok) {
            toast.success("Error", {
                description: result.message,
            });
        }

        navigator.clipboard.writeText(result.inviteUrl);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleDeleteTask = async (id: number) => {
        const result = await deleteTaskAction(id);

        if (!result || !result.ok) {
            toast.success("Error", {
                description: "Something went wrong",
            });
        }

        if (result && result.ok) {
            toast.success("Success", {
                description: `Task has been deleted`,
            });
        }

        if (result && !result.ok) {
            toast.success("Error", {
                description: result.message,
            });
        }
    };

    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={isPending}>
                        <button
                            type="button"
                            className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:brightness-95"
                            disabled={isPending}
                        >
                            {column.name}
                            <CaretDownIcon weight="duotone" size={12} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {projectData.columns.map((projectColumn) => (
                            <DropdownMenuItem
                                key={projectColumn.id}
                                className="cursor-pointer gap-2 text-sm"
                                onClick={() => onColumnChange(projectColumn)}
                                disabled={isPending}
                            >
                                {projectColumn.name}
                                {column.id === projectColumn.id && (
                                    <CheckIcon
                                        weight="duotone"
                                        size={12}
                                        className="ml-auto text-bright-blue"
                                    />
                                )}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild disabled={isPending}>
                        <button
                            type="button"
                            className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition-colors hover:brightness-95"
                            disabled={isPending}
                        >
                            {priority}
                            <CaretDownIcon weight="duotone" size={12} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(
                            (priorityConfig) => (
                                <DropdownMenuItem
                                    key={priorityConfig}
                                    className="cursor-pointer gap-2 text-sm capitalize"
                                    onClick={() =>
                                        onPriorityChange(priorityConfig)
                                    }
                                    disabled={isPending}
                                >
                                    {priorityConfig}
                                    {priority === priorityConfig && (
                                        <CheckIcon
                                            weight="duotone"
                                            size={12}
                                            className="ml-auto text-bright-blue"
                                        />
                                    )}
                                </DropdownMenuItem>
                            ),
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="ml-auto flex items-center gap-1">
                <Tooltip>
                    <TooltipTrigger asChild disabled={isPending}>
                        <button
                            type="button"
                            onClick={handleCopyLink}
                            className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
                            style={{
                                color: linkCopied ? "#1E7E3A" : "#6b7280",
                            }}
                            disabled={isPending}
                        >
                            {linkCopied ? (
                                <CheckIcon weight="duotone" size={18} />
                            ) : (
                                <LinkIcon weight="duotone" size={16} />
                            )}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>
                        {linkCopied ? "Copied!" : "Copy link"}
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger
                        asChild
                        disabled={isPending}
                        onClick={() => handleDeleteTask(task.id)}
                    >
                        <button
                            type="button"
                            className="flex size-8 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50"
                            onClick={() => {
                                onOpenChange(false);
                            }}
                            disabled={isPending}
                        >
                            <TrashSimpleIcon weight="duotone" size={16} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>Delete task</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild disabled={isPending}>
                        <button
                            type="button"
                            className="ml-1 flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100"
                            onClick={() => onOpenChange(false)}
                            disabled={isPending}
                        >
                            <XIcon weight="duotone" size={18} />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>Close task</TooltipContent>
                </Tooltip>
            </div>
            <input type="hidden" name="column-id" value={column.id} />
            <input type="hidden" name="priority" value={priority} />
        </div>
    );
}
