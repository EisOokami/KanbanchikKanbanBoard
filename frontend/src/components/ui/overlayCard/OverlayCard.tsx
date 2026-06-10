"use client";

import { Task } from "@/types/types";
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
    PaperclipIcon,
} from "@phosphor-icons/react";

interface OverlayCardProps {
    card: Task;
}

export default function OverlayCard({ card }: Readonly<OverlayCardProps>) {
    const category = card.categories[0];
    const overdue = isOverdue(card.due_date, card.column);
    const subtasksDone = card.subtasks.filter((s) => s.is_done).length;
    const subtasksTotal = card.subtasks.length;

    return (
        <div className="w-[272px] rotate-2 cursor-grabbing rounded-xl border border-gray-300 bg-white p-3 shadow-2xl">
            <div className="mb-2.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                    <span
                        className={cn(
                            "rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize text-white",
                            PRIORITY_CONFIG[card.priority].dot,
                        )}
                    >
                        {PRIORITY_CONFIG[card.priority]?.label}
                    </span>
                </div>
                {category && (
                    <span
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize"
                        style={{
                            background: category.color + "22",
                            color: category.color,
                        }}
                    >
                        {category.name}
                    </span>
                )}
                <div className="ml-auto size-5 flex-shrink-0" />
            </div>
            <p className="mb-1 text-sm font-medium leading-snug">
                {card.title}
            </p>
            <p className="line-clamp-1 text-xs text-gray-500">
                {card.description}
            </p>
            {!card.show_progress && (
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
            {card.show_progress && subtasksTotal > 0 && (
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
                                    className="size-6 ring-1 ring-white"
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
                    {!card.show_progress && subtasksTotal > 0 && (
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
        </div>
    );
}
