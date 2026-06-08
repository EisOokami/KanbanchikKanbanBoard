"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Paperclip, CheckSquare, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import { Task } from "@/types/types";
import { PRIORITY_CONFIG } from "@/constants/constants";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/shadcn/avatar";
import { formatDate, getInitials, isOverdue } from "@/libs/utils";
import {
    CalendarBlankIcon,
    ChatTeardropDotsIcon,
    CheckSquareIcon,
    DotsThreeOutlineIcon,
    PaperclipIcon,
    TrashIcon,
} from "@phosphor-icons/react";

interface KanbanCardProps {
    card: Task;
    onDelete: () => void;
    onOpenDetails: () => void;
}

function formatDate(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isOverdue(date: string | Date): boolean {
    const d = typeof date === "string" ? new Date(date) : date;
    return d < new Date();
}

export default function KanbanCard({
    card,
    onDelete,
    onOpenDetails,
}: Readonly<KanbanCardProps>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const priorityDot = PRIORITY_CONFIG[card.priority]?.dot ?? "bg-gray-300";
    const category = card.categories[0];
    const overdue = isOverdue(card.due_date);
    const subtasksDone = card.subtasks.filter((s) => s.is_done).length;
    const subtasksTotal = card.subtasks.length;

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={onOpenDetails}
            className="group relative cursor-default select-none rounded-xl border bg-white p-3 text-left transition-shadow duration-150 hover:border-gray-300 hover:shadow-md"
        >
            {/* <div
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                className="absolute left-1 top-1/2 z-10 -translate-y-1/2 cursor-grab p-1 opacity-0 transition-opacity hover:!opacity-80 active:cursor-grabbing group-hover:opacity-40"
            >
                <GripVertical className="size-3.5 text-gray-400" />
            </div> */}
            {/* <div className="pl-4"> */}
            <div
                className="mb-2.5 flex items-center justify-between gap-2"
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
            >
                {category && (
                    <span
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize leading-none"
                        style={{
                            background: category.color + "22",
                            color: category.color,
                        }}
                    >
                        {category.name}
                    </span>
                )}
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
                    <DropdownMenuContent align="end" className="w-36 border">
                        <DropdownMenuItem
                            className="cursor-pointer gap-2 text-xs text-red-400 focus:bg-red-500/10 focus:text-red-400"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                        >
                            <TrashIcon weight="duotone" className="size-3" />{" "}
                            Delete card
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <p className="mb-3 text-sm font-medium leading-snug">
                {card.title}
            </p>
            <p className="line-clamp-1 text-xs text-gray-500">
                {card.description}
            </p>
            {!card.showProgress && (
                <div className="my-2 flex items-center gap-0.5 text-gray-400">
                    <CalendarBlankIcon weight="duotone" className="size-4" />
                    <span
                        className={`text-xs font-medium ${
                            overdue ? "text-rose-500" : "text-gray-400"
                        }`}
                    >
                        {formatDate(card.due_date)}
                    </span>
                </div>
            )}
            {card.showProgress && subtasksTotal > 0 && (
                <div className="my-3">
                    <div className="mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-0.5 text-gray-400">
                            <CheckSquareIcon
                                weight="duotone"
                                className="size-3"
                            />
                            <span className="text-[10px]">
                                {subtasksDone}/{subtasksTotal}
                            </span>
                        </div>
                        <div className="flex items-center gap-0.5 text-gray-400">
                            <CalendarBlankIcon
                                weight="duotone"
                                className="size-3"
                            />
                            <span
                                className={`text-[10px] font-medium ${
                                    overdue ? "text-rose-500" : "text-gray-400"
                                }`}
                            >
                                {formatDate(card.due_date)}
                            </span>
                        </div>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                            className="h-full rounded-full bg-bright-blue transition-all"
                            style={{
                                width: `${Math.round((subtasksDone / subtasksTotal) * 100)}%`,
                            }}
                        />
                    </div>
                </div>
            )}
            <div className="flex items-center justify-between gap-2 border-t pt-2">
                <div className="flex items-center gap-2">
                    {card.assignees.length > 0 && (
                        <div className="flex -space-x-1.5">
                            {card.assignees.slice(0, 2).map((a) => (
                                <Avatar
                                    key={a.id}
                                    className="size-5 ring-1 ring-white"
                                >
                                    <AvatarImage src={a.avatar_url} />
                                    <AvatarFallback className="text-[8px]">
                                        {getInitials(a.name, a.surname)}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {card.attachments.length > 0 && (
                        <div className="flex items-center gap-0.5 text-gray-400">
                            <PaperclipIcon
                                weight="duotone"
                                className="size-4"
                            />
                            <span className="text-xs">
                                {card.attachments.length}
                            </span>
                        </div>
                    )}
                    {card.comments.length > 0 && (
                        <div className="flex items-center gap-0.5 text-gray-400">
                            <ChatTeardropDotsIcon
                                weight="duotone"
                                className="size-4"
                            />
                            <span className="text-xs">
                                {card.comments.length}
                            </span>
                        </div>
                    )}
                    {!card.showProgress && subtasksTotal > 0 && (
                        <div className="flex items-center gap-0.5 text-gray-400">
                            <CheckSquareIcon
                                weight="duotone"
                                className="size-4"
                            />
                            <span className="text-xs">
                                {subtasksDone}/{subtasksTotal}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {/* </div> */}
        </div>
    );
}
