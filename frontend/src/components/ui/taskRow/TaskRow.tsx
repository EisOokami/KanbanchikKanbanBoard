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
import { Task, User } from "@/types/types";
import { Progress } from "../shadcn/progress";
import { PRIORITY_CONFIG } from "@/constants/constants";
import {
    CalendarBlankIcon,
    ChatTeardropDotsIcon,
    DotsThreeOutlineIcon,
    FireIcon,
    PaperclipIcon,
    TrashSimpleIcon,
    WarningIcon,
} from "@phosphor-icons/react";

interface TaskRowProps {
    task: Task;
    userData: User;
    onDelete: (id: number) => void;
    onOpenDetails: () => void;
}

export default function TaskRow({
    task,
    userData,
    onDelete,
    onOpenDetails,
}: Readonly<TaskRowProps>) {
    const priority = PRIORITY_CONFIG[task.priority];
    const overdue = isOverdue(task.due_date ?? undefined, task.column.name);
    const progress = Math.round(
        ((task.subtasks_done ? task.subtasks_done : 0) * 100) /
            (task.subtasks_total ? task.subtasks_total : 1),
    );
    const updatedUserData = {
        ...userData,
        role: task.project.members.find((member) => member.id === userData.id)
            ?.role,
    };
    const hasPermission = !(
        updatedUserData.role === "viewer" ||
        (updatedUserData.role === "member" &&
            updatedUserData.id !== task.creator_id &&
            !task.members.some((member) => member.id === updatedUserData.id))
    );

    return (
        <tr
            className="group cursor-pointer border-b border-border transition-colors duration-100"
            onClick={onOpenDetails}
        >
            <td className="w-24 py-3 pl-8 pr-2">
                <span className="font-mono text-xs font-medium text-muted-foreground">
                    {task.id}
                </span>
            </td>
            <td className="min-w-[240px] py-3 pr-4">
                <span className="text-sm font-medium leading-snug">
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
                            <span className="text-[10px] text-muted-foreground">
                                +{task.labels.length - 2}
                            </span>
                        )}
                        {task.categories.slice(0, 2).map((category) => (
                            <span
                                key={category.id}
                                className="rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize text-white"
                                style={{ backgroundColor: category.color }}
                            >
                                {category.name}
                            </span>
                        ))}
                        {task.categories.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                                +{task.categories.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </td>
            <td className="w-36 py-3 pr-4">
                <span className="inline-flex rounded-md border border-border px-2 py-1 text-xs">
                    {task.column.name}
                </span>
            </td>
            <td className="w-28 py-3 pr-4">
                <span
                    className="inline-flex rounded-md border border-border px-2 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: priority.color }}
                >
                    {priority.label}
                </span>
            </td>
            <td className="w-36 py-3 pr-4">
                <div className="flex items-center gap-1">
                    <div
                        className="grid size-5 place-content-center rounded-md"
                        style={{
                            backgroundColor: task.project.color + "33",
                        }}
                    >
                        <span className="text-[10px]">{task.project.icon}</span>
                    </div>
                    <span className="text-xs font-medium">
                        {task.project.name}
                    </span>
                </div>
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
                        <div className="z-10 flex size-6 items-center justify-center rounded-full bg-muted text-[9px] font-bold text-muted-foreground ring-2 ring-background-secondary">
                            +{task.members.length - 3}
                        </div>
                    )}
                </div>
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
                        <span className="text-[10px] text-muted-foreground">
                            {task.subtasks_done ? task.subtasks_done : 0}/
                            {task.subtasks_total ? task.subtasks_total : 0}
                        </span>
                    </div>
                ) : null}
            </td>
            <td className="w-24 py-3 pr-4">
                <div className="flex items-center gap-2.5 text-muted-foreground">
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
                {hasPermission && (
                    <AlertDialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-6 text-control-text opacity-0 transition-opacity hover:bg-control-active hover:!opacity-100 group-hover:opacity-50 [&_svg]:size-4"
                                >
                                    <DotsThreeOutlineIcon weight="duotone" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="w-44 border-border bg-control"
                            >
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                        className="cursor-pointer gap-2 text-xs text-red-500 hover:!bg-control-active focus:text-red-500 dark:text-red-400 dark:focus:text-red-400"
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        <TrashSimpleIcon
                                            weight="duotone"
                                            className="size-3.5"
                                        />{" "}
                                        Delete
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
                                    &quot;{task.title}&quot; will be permanently
                                    deleted. This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onDelete(task.id)}
                                    className="bg-red-600 font-semibold text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </td>
        </tr>
    );
}
