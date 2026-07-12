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
} from "@phosphor-icons/react";
import { Progress } from "../shadcn/progress";

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
                "group relative cursor-default select-none rounded-xl border bg-white p-3 text-left",
                userData.role === "viewer" ||
                    (userData.role === "member" &&
                        userData.id !== task.creator_id &&
                        !task.members.some(
                            (member) => member.id === userData.id,
                        ))
                    ? "cursor-pointer"
                    : "cursor-grab transition-shadow duration-150 hover:border-gray-300 hover:shadow-md",
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
                {!(
                    userData.role === "viewer" ||
                    (userData.role === "member" &&
                        userData.id !== task.creator_id)
                ) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="ml-auto flex-shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-gray-100 hover:!opacity-100 group-hover:opacity-50"
                            >
                                <DotsThreeOutlineIcon
                                    weight="duotone"
                                    className="size-3.5 text-gray-400"
                                />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-36 border"
                        >
                            <DropdownMenuItem
                                className="cursor-pointer gap-2 text-xs text-red-400 focus:bg-red-500/10 focus:text-red-400"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(task.id);
                                }}
                            >
                                <TrashIcon
                                    weight="duotone"
                                    className="size-3"
                                />{" "}
                                Delete task
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
            <p className="mb-1 break-words text-sm font-medium leading-snug">
                {task.title}
            </p>
            <p className="mb-2 line-clamp-1 break-words text-xs text-gray-500">
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
            <div className="flex items-center justify-between gap-2 border-t pt-2">
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
