"use client";

import { INITIAL_PROJECTS, PRIORITY_CONFIG } from "@/constants/constants";
import { Task } from "@/types/types";
import { CalendarBlankIcon } from "@phosphor-icons/react";

interface SidebarEventCardProps {
    task: Task;
    onOpen: () => void;
}

export default function SidebarEventCard({
    task,
    onOpen,
}: SidebarEventCardProps) {
    const proj = INITIAL_PROJECTS[0] ?? {
        color: "#94a3b8",
        emoji: "📌",
    };
    const priority = PRIORITY_CONFIG[task.priority];
    const isDone = task.column === "done";

    return (
        <button
            className={`w-full rounded-md border p-3 text-left transition-all ${isDone ? "bg-gray-50/60 opacity-60" : "bg-white hover:border-blue-200 hover:shadow-sm"}`}
            onClick={onOpen}
        >
            <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                    <p
                        className={`text-xs font-semibold leading-tight ${isDone ? "text-gray-500 line-through" : "text-gray-800"}`}
                    >
                        {task.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                            className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                            style={{
                                background: `${proj.color}15`,
                                color: proj.color,
                            }}
                        >
                            {proj.icon}
                            {proj.name}
                        </span>
                        <span
                            className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white"
                            style={{
                                backgroundColor: priority.color,
                            }}
                        >
                            {priority.label}
                        </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <CalendarBlankIcon
                                weight="duotone"
                                className="size-3"
                            />{" "}
                            {task.due_date.toString()}
                        </div>
                    </div>
                </div>
            </div>
        </button>
    );
}
