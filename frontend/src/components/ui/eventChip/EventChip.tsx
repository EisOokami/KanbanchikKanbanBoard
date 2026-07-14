"use client";

import { formatDate } from "@/libs/utils";
import { Task } from "@/types/types";

interface EventChipProps {
    task: Task;
    onClick: (task: Task) => void;
}

export default function EventChip({ task, onClick }: Readonly<EventChipProps>) {
    return (
        <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onClick(task);
            }}
            className="flex w-full items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-semibold transition-all hover:brightness-95"
            style={{
                background: `${task.project ? task.project.color : "#0096FF"}40`,
            }}
            title={task.title}
        >
            <span className="flex-shrink-0 opacity-70">
                {formatDate(task.due_date ?? "")}
            </span>
            <span className="truncate">{task.title}</span>
        </button>
    );
}
