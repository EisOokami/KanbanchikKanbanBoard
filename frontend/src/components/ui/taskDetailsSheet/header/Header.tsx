"use client";

import {
    CaretDownIcon,
    CheckIcon,
    LinkIcon,
    TrashSimpleIcon,
    WarningIcon,
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
import { cn } from "@/libs/utils";
import { Button } from "../../shadcn/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "../../shadcn/alert-dialog";

interface HeaderProps {
    isPending: boolean;
    task: Task;
    projectData: Project;
    column: Column;
    priority: Priority;
    hasPermission: boolean;
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
    hasPermission,
    onOpenChange,
    onColumnChange,
    onPriorityChange,
}: Readonly<HeaderProps>) {
    const [linkCopied, setLinkCopied] = useState<boolean>(false);

    const handleCopyLink = async () => {
        const result = await generateInviteAction(projectData.id);

        if (!result || !result.ok || !result.inviteUrl) {
            toast.error("Error", {
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
            toast.error("Error", {
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
            toast.error("Error", {
                description: "Something went wrong",
            });
        }

        if (result && result.ok) {
            toast.success("Success", {
                description: `Task has been deleted`,
            });
        }

        if (result && !result.ok) {
            toast.error("Error", {
                description: result.message,
            });
        }
    };

    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
                {!hasPermission ? (
                    <>
                        <div className="flex items-center gap-1.5 rounded-md border border-border bg-control px-2.5 py-1 text-xs font-medium capitalize">
                            {column.name}
                        </div>
                        <div className="flex items-center gap-1.5 rounded-md border border-border bg-control px-2.5 py-1 text-xs font-medium capitalize">
                            {priority}
                        </div>
                    </>
                ) : (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild disabled={isPending}>
                                <button
                                    type="button"
                                    className="flex items-center gap-1.5 rounded-md border border-border bg-control px-2.5 py-1 text-xs font-medium transition-colors hover:bg-control-active"
                                    disabled={isPending}
                                >
                                    {column.name}
                                    <CaretDownIcon weight="duotone" size={12} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="border-border bg-control">
                                {projectData.columns.map((projectColumn) => (
                                    <DropdownMenuItem
                                        key={projectColumn.id}
                                        className="cursor-pointer gap-2 text-sm hover:!bg-control-active"
                                        onClick={() =>
                                            onColumnChange(projectColumn)
                                        }
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
                                    className="flex items-center gap-1.5 rounded-md border border-border bg-control px-2.5 py-1 text-xs font-medium capitalize transition-colors hover:bg-control-active"
                                    disabled={isPending}
                                >
                                    {priority}
                                    <CaretDownIcon weight="duotone" size={12} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="border-border bg-control">
                                {(
                                    Object.keys(PRIORITY_CONFIG) as Priority[]
                                ).map((priorityConfig) => (
                                    <DropdownMenuItem
                                        key={priorityConfig}
                                        className="cursor-pointer gap-2 text-sm capitalize hover:!bg-control-active"
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
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                )}
            </div>
            <div className="ml-auto flex items-center gap-1">
                {hasPermission && (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild disabled={isPending}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    onClick={handleCopyLink}
                                    className={cn(
                                        "size-8 transition-colors hover:bg-control-active [&_svg]:size-4",
                                        linkCopied
                                            ? "text-green-500"
                                            : "text-control-text",
                                    )}
                                    disabled={isPending}
                                >
                                    {linkCopied ? (
                                        <CheckIcon weight="duotone" />
                                    ) : (
                                        <LinkIcon weight="duotone" />
                                    )}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {linkCopied ? "Copied!" : "Copy link"}
                            </TooltipContent>
                        </Tooltip>
                        <AlertDialog>
                            <Tooltip>
                                <TooltipTrigger asChild disabled={isPending}>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-control-text hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-950  dark:hover:text-red-600 [&_svg]:size-4"
                                            disabled={isPending}
                                        >
                                            <TrashSimpleIcon weight="duotone" />
                                        </Button>
                                    </AlertDialogTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Delete task</TooltipContent>
                            </Tooltip>
                            <AlertDialogContent className="border-border">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <WarningIcon
                                            weight="duotone"
                                            className="size-5 text-red-500"
                                        />
                                        Delete task?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        &quot;{task.title}&quot; will be
                                        permanently deleted. This cannot be
                                        undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isPending}>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => {
                                            handleDeleteTask(task.id);
                                            onOpenChange(false);
                                        }}
                                        disabled={isPending}
                                        className="bg-red-600 font-semibold text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                                    >
                                        Delete project
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </>
                )}
                <Tooltip>
                    <TooltipTrigger asChild disabled={isPending}>
                        <Button
                            size="icon"
                            variant="ghost"
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="ml-1 size-8 text-control-text hover:bg-control-active [&_svg]:size-4"
                            disabled={isPending}
                        >
                            <XIcon weight="duotone" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Close task</TooltipContent>
                </Tooltip>
            </div>
            <input type="hidden" name="column-id" value={column.id} />
            <input type="hidden" name="priority" value={priority} />
        </div>
    );
}
