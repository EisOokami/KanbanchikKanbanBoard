"use client";

import { INITIAL_PROJECTS } from "@/constants/constants";
import { Task } from "@/types/types";

interface EventChipProps {
    task: Task;
    onClick: (task: Task) => void;
}

export default function EventChip({ task, onClick }: EventChipProps) {
    const proj = INITIAL_PROJECTS[0] ?? {
        color: "#94a3b8",
        emoji: "📌",
    };
    const isDone = task.column === "done";

    return (
        <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                onClick(task);
            }}
            className="flex w-full items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-semibold transition-all hover:brightness-95"
            style={{
                background: `${proj.color}18`,
                color: isDone ? "#94a3b8" : proj.color,
                textDecoration: isDone ? "line-through" : "none",
                opacity: isDone ? 0.65 : 1,
            }}
            title={task.title}
        >
            <span className="flex-shrink-0 opacity-70">
                {task.due_date.toString()}
            </span>
            <span className="truncate">{task.title}</span>
        </button>
    );
}
