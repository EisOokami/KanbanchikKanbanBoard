"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import { Task, User } from "@/types/types";
import { PRIORITY_CONFIG } from "@/constants/constants";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/shadcn/avatar";
import { cn, formatDate, getInitials, isOverdue } from "@/libs/utils";
import {
    CalendarBlankIcon,
    ChatTeardropDotsIcon,
    CheckSquareIcon,
    DotsThreeOutlineIcon,
    PaperclipIcon,
    TrashIcon,
    WarningIcon,
} from "@phosphor-icons/react";
import { Progress } from "../shadcn/progress";
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

interface KanbanTaskProps {
    task: Task;
    showPriorityEmoji: boolean;
    userData: User;
    onDelete: (id: number) => void;
    onOpenDetails: (task: Task) => void;
}

export default function KanbanTask({
    task,
    showPriorityEmoji,
    userData,
    onDelete,
    onOpenDetails,
}: Readonly<KanbanTaskProps>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        disabled:
            userData.role === "viewer" ||
            (userData.role === "member" &&
                userData.id !== task.creator_id &&
                !task.members.some((member) => member.id === userData.id)),
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const overdue = isOverdue(task.due_date ?? undefined, task.column.name);
    const progress = Math.round(
        ((task.subtasks_done ? task.subtasks_done : 0) * 100) /
            (task.subtasks_total ? task.subtasks_total : 1),
    );

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onOpenDetails(task)}
            {...attributes}
            {...listeners}
            className={cn(
                "group relative cursor-default select-none rounded-xl border border-border bg-background-secondary p-3 text-left",
                userData.role === "viewer" ||
                    (userData.role === "member" &&
                        userData.id !== task.creator_id &&
                        !task.members.some(
                            (member) => member.id === userData.id,
                        ))
                    ? "cursor-pointer"
                    : "cursor-grab transition-all duration-150 hover:border-gray-300 hover:shadow-md dark:hover:border-gray-700",
            )}
        >
            <div className="mb-2.5 flex items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                    <div className="flex items-center gap-1">
                        <span
                            className="rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize text-white"
                            style={{
                                backgroundColor:
                                    PRIORITY_CONFIG[task.priority].color,
                            }}
                        >
                            {showPriorityEmoji
                                ? PRIORITY_CONFIG[task.priority].emoji + " "
                                : ""}
                            {PRIORITY_CONFIG[task.priority].label}
                        </span>
                    </div>
                    {task.categories.map((category) => (
                        <span
                            key={category.id}
                            className="truncate break-words rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize text-white"
                            style={{
                                background: category.color,
                            }}
                        >
                            {category.name}
                        </span>
                    ))}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                    {!(
                        userData.role === "viewer" ||
                        (userData.role === "member" &&
                            userData.id !== task.creator_id)
                    ) && (
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="ml-auto size-6 text-control-text opacity-0 transition-opacity hover:bg-control-active hover:!opacity-100 group-hover:opacity-50 [&_svg]:size-4"
                                    >
                                        <DotsThreeOutlineIcon weight="duotone" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-36 border-border bg-control"
                                >
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="cursor-pointer gap-2 text-xs text-red-500 hover:!bg-control-active focus:text-red-500 dark:text-red-400 dark:focus:text-red-400">
                                            <TrashIcon
                                                weight="duotone"
                                                className="size-3.5"
                                            />{" "}
                                            Delete task
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
                                        className="bg-red-600 font-semibold text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>
            <p className="mb-1 break-words text-sm font-medium leading-snug">
                {task.title}
            </p>
            <p className="mb-2 line-clamp-1 break-words text-xs text-muted-foreground">
                {task.description}
            </p>
            {(!task.show_progress || task.subtasks_total === 0) &&
                task.due_date && (
                    <div
                        className={cn(
                            "mb-2 flex items-center gap-0.5",
                            overdue
                                ? "font-semibold text-rose-500"
                                : "font-medium text-gray-400",
                        )}
                    >
                        <CalendarBlankIcon
                            weight="duotone"
                            className="size-4"
                        />
                        {task.start_date && (
                            <>
                                <span className="text-xs">
                                    {formatDate(task.start_date)}
                                </span>
                                <span>-</span>
                            </>
                        )}
                        <span className="text-xs">
                            {formatDate(task.due_date)}
                        </span>
                    </div>
                )}
            {task.show_progress &&
            task.subtasks_total &&
            task.subtasks_total > 0 ? (
                <div className="my-3">
                    <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-0.5 text-gray-400">
                            <CheckSquareIcon
                                weight="duotone"
                                className="size-3"
                            />
                            <span className="text-[10px]">
                                {task.subtasks_done ? task.subtasks_done : 0}/
                                {task.subtasks_total}
                            </span>
                        </div>
                        {task.start_date || task.due_date ? (
                            <div className="flex items-center gap-0.5 text-gray-400">
                                <CalendarBlankIcon
                                    weight="duotone"
                                    className="size-3"
                                />
                                {task.start_date && (
                                    <>
                                        <span className="text-[10px]">
                                            {formatDate(task.start_date)}
                                        </span>
                                        <span>-</span>
                                    </>
                                )}
                                {task.due_date && (
                                    <span
                                        className={cn(
                                            "text-[10px]",
                                            overdue
                                                ? "text-rose-500"
                                                : "text-gray-400",
                                        )}
                                    >
                                        {formatDate(task.due_date)}
                                    </span>
                                )}
                            </div>
                        ) : null}
                    </div>
                    <Progress
                        value={progress}
                        className="h-1 w-full [&>*]:bg-bright-blue"
                    />
                </div>
            ) : null}
            <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
                <div className="flex items-center gap-2">
                    {task.members.length ? (
                        <div className="flex -space-x-1.5">
                            {task.members.slice(0, 2).map((member) => (
                                <Avatar key={member.id} className="size-6">
                                    <AvatarImage src={member.avatar_url} />
                                    <AvatarFallback
                                        className="text-[8px] text-white"
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
                            ))}
                        </div>
                    ) : null}
                </div>
                <div className="flex items-center gap-2">
                    {task.attachments.length ? (
                        <div className="flex items-center gap-0.5 text-gray-400">
                            <PaperclipIcon
                                weight="duotone"
                                className="size-4"
                            />
                            <span className="text-xs">
                                {task.attachments.length}
                            </span>
                        </div>
                    ) : null}
                    {task.comments.length ? (
                        <div className="flex items-center gap-0.5 text-gray-400">
                            <ChatTeardropDotsIcon
                                weight="duotone"
                                className="size-4"
                            />
                            <span className="text-xs">
                                {task.comments.length}
                            </span>
                        </div>
                    ) : null}
                    {!task.show_progress &&
                    task.subtasks_total &&
                    task.subtasks_total > 0 ? (
                        <div className="flex items-center gap-0.5 text-gray-400">
                            <CheckSquareIcon
                                weight="duotone"
                                className="size-4"
                            />
                            <span className="text-xs">
                                {task.subtasks_done ? task.subtasks_done : 0}/
                                {task.subtasks_total}
                            </span>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
