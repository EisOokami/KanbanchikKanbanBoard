"use client";

import { cn, formatDate, getInitials, isOverdue } from "@/libs/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../shadcn/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../shadcn/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import { Button } from "../shadcn/button";
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
} from "../shadcn/alert-dialog";
import { Column, Task } from "@/types/types";
import { Progress } from "../shadcn/progress";
import { PRIORITY_CONFIG } from "@/constants/constants";
import {
    CalendarBlankIcon,
    ChatTeardropDotsIcon,
    DotsThreeOutlineIcon,
    FireIcon,
    PaperclipIcon,
    TrashIcon,
} from "@phosphor-icons/react";

interface TaskRowProps {
    task: Task;
    column: Column;
    onDelete: (id: number) => void;
    onOpenDetails: (task: Task) => void;
}

export default function ProjectTaskRow({
    task,
    column,
    onDelete,
    onOpenDetails,
}: Readonly<TaskRowProps>) {
    const priority = PRIORITY_CONFIG[task.priority];
    const overdue = isOverdue(task.due_date, column.name);
    const progress = Math.round(
        ((task.subtasks_done ? task.subtasks_done : 0) * 100) /
            (task.subtasks_total ? task.subtasks_total : 1),
    );

    return (
        <tr
            className="group cursor-pointer border-b transition-colors duration-100"
            onClick={() => onOpenDetails(task)}
        >
            <td className="w-24 py-3 pl-8 pr-2">
                <span className="font-mono text-xs font-medium text-gray-400">
                    {task.id}
                </span>
            </td>
            <td className="min-w-[240px] py-3 pr-4">
                <span className="text-sm font-medium leading-snug text-gray-800">
                    {task.title}
                </span>
                {task.labels.length > 0 && (
                    <div className="mt-1 flex gap-1">
                        {task.labels.slice(0, 2).map((label) => (
                            <span
                                key={label.id}
                                className="rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize text-white"
                                style={{ backgroundColor: label.color }}
                            >
                                {label.name}
                            </span>
                        ))}
                        {task.labels.length > 2 && (
                            <span className="text-[10px] text-gray-400">
                                +{task.labels.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </td>
            <td className="w-36 py-3 pr-4">
                {task.categories.map((category) => (
                    <span
                        key={category.id}
                        className="inline-flex rounded-md border px-2 py-1 text-xs font-medium capitalize text-white"
                        style={{ backgroundColor: category.color }}
                    >
                        {category.name}
                    </span>
                ))}
            </td>
            <td className="w-36 py-3 pr-4">
                <span className="inline-flex rounded-md border px-2.5 py-1 text-xs font-medium">
                    {column.name}
                </span>
            </td>
            <td className="w-28 py-3 pr-4">
                <span
                    className="inline-flex rounded-md border px-2.5 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: priority.color }}
                >
                    {priority.label}
                </span>
            </td>
            <td className="w-28 py-3 pr-4">
                {task.due_date && (
                    <div
                        className={cn(
                            "flex items-center gap-1 text-xs font-medium",
                            overdue ? "text-rose-500" : "text-gray-500",
                        )}
                    >
                        {overdue ? (
                            <FireIcon weight="duotone" className="size-3" />
                        ) : (
                            <CalendarBlankIcon
                                weight="duotone"
                                className="size-3"
                            />
                        )}
                        {formatDate(task.due_date)}
                    </div>
                )}
            </td>
            <td className="w-24 py-3 pr-4">
                {task.subtasks_total && task.subtasks_total > 0 ? (
                    <div className="flex items-center gap-2">
                        <Progress
                            value={progress}
                            className="h-1 w-12 [&>*]:bg-bright-blue"
                        />
                        <span className="text-[10px] text-gray-400">
                            {task.subtasks_done ? task.subtasks_done : 0}/
                            {task.subtasks_total ? task.subtasks_total : 0}
                        </span>
                    </div>
                ) : null}
            </td>
            <td className="w-28 py-3 pr-4">
                <div className="flex -space-x-1.5">
                    {task.members.slice(0, 3).map((member) => (
                        <Tooltip key={member.id}>
                            <TooltipTrigger asChild>
                                <Avatar className="size-6">
                                    <AvatarImage
                                        src={member.avatar_url}
                                        alt={member.name}
                                    />
                                    <AvatarFallback
                                        className="text-[9px] font-medium text-white"
                                        style={{
                                            backgroundColor: member.color,
                                        }}
                                    >
                                        {getInitials(
                                            member.name,
                                            member.surname,
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                {member.name} {member.surname}
                            </TooltipContent>
                        </Tooltip>
                    ))}
                    {task.members.length > 3 && (
                        <div className="z-10 flex size-6 items-center justify-center rounded-full bg-gray-200 text-[9px] font-bold text-gray-500 ring-2 ring-white">
                            +{task.members.length - 3}
                        </div>
                    )}
                </div>
            </td>
            <td className="w-24 py-3 pr-4">
                <div className="flex items-center gap-2.5 text-gray-400">
                    {task.comments.length > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px]">
                            <ChatTeardropDotsIcon
                                weight="duotone"
                                className="size-3"
                            />{" "}
                            {task.comments.length}
                        </span>
                    )}
                    {task.attachments.length > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px]">
                            <PaperclipIcon
                                weight="duotone"
                                className="size-3"
                            />{" "}
                            {task.attachments.length}
                        </span>
                    )}
                </div>
            </td>
            <td className="w-10 py-3 pr-3" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <DotsThreeOutlineIcon
                                weight="duotone"
                                className="size-3.5 text-gray-400"
                            />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    className="cursor-pointer gap-2 text-xs text-rose-500 focus:text-rose-500"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <TrashIcon
                                        weight="duotone"
                                        className="size-3.5"
                                    />{" "}
                                    Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Delete task?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        &quot;{task.title}&quot; will be
                                        permanently deleted. This cannot be
                                        undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => onDelete(task.id)}
                                        className="bg-rose-600 hover:bg-rose-700"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
}
