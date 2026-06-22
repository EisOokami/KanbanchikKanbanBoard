"use client";

import { PRIORITY_CONFIG } from "@/constants/constants";
import { Task } from "@/types/types";

interface ListDragOverlayProps {
    task: Task;
}

export default function ListDragOverlay({
    task,
}: Readonly<ListDragOverlayProps>) {
    const priority = PRIORITY_CONFIG[task.priority];

    return (
        <div className="flex w-[600px] items-center gap-3 rounded-lg border bg-white px-4 py-2.5 shadow-xl ring-1 ring-bright-blue/20">
            <span
                className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                style={{ backgroundColor: priority.color }}
            >
                {priority.label}
            </span>
            <span className="truncate text-sm font-medium text-gray-800">
                {task.title}
            </span>
            <span className="ml-auto shrink-0 rounded border px-2 py-0.5 text-xs text-gray-400">
                {task.column.name}
            </span>
        </div>
    );
}
