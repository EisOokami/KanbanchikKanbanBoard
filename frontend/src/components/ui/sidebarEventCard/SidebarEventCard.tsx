"use client";

import { PRIORITY_CONFIG } from "@/constants/constants";
import { formatDate } from "@/libs/utils";
import { Task } from "@/types/types";
import { CalendarBlankIcon } from "@phosphor-icons/react";

interface SidebarEventCardProps {
    task: Task;
    showPriorityEmoji?: boolean;
    onOpen: () => void;
}

export default function SidebarEventCard({
    task,
    showPriorityEmoji,
    onOpen,
}: Readonly<SidebarEventCardProps>) {
    const priority = PRIORITY_CONFIG[task.priority];

    return (
        <button
            className="w-full max-w-60 rounded-md border bg-white p-3 text-left transition-all hover:border-blue-200 hover:shadow-sm"
            onClick={onOpen}
        >
            <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold leading-tight text-gray-800">
                        {task.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white"
                            style={{
                                backgroundColor: priority.color,
                            }}
                        >
                            {showPriorityEmoji ? priority.emoji + " " : ""}
                            {priority.label}
                        </span>
                        {task.categories.map((category) => (
                            <span
                                key={category.id}
                                className="flex items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white"
                                style={{
                                    backgroundColor: category.color,
                                }}
                            >
                                {category.name}
                            </span>
                        ))}
                        {task.labels.map((label) => (
                            <span
                                key={label.id}
                                className="flex items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white"
                                style={{
                                    backgroundColor: label.color,
                                }}
                            >
                                {label.name}
                            </span>
                        ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <CalendarBlankIcon
                                weight="duotone"
                                className="size-3"
                            />{" "}
                            {formatDate(task.due_date)}
                        </div>
                    </div>
                </div>
            </div>
        </button>
    );
}
