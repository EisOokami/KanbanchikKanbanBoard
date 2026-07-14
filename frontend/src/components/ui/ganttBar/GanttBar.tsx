"use client";

import { Task } from "@/types/types";
import { cn } from "@/libs/utils";

interface GanttBarProps {
    task: Task;
    isStartDay: boolean;
    isEndDay: boolean;
    isToday: boolean;
    onClick: () => void;
}

export default function GanttBar({
    task,
    isStartDay,
    isEndDay,
    isToday,
    onClick,
}: Readonly<GanttBarProps>) {
    const baseColor = task.categories[0]?.color || "#6366f1";

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={cn(
                "relative h-5 cursor-pointer transition-all hover:brightness-110",
            )}
            style={{
                background: `${baseColor}CC`,
                borderLeft: isStartDay ? `2px solid ${baseColor}` : "none",
                borderRight: isEndDay ? `2px solid ${baseColor}` : "none",
                borderTop: "2px solid " + baseColor,
                borderBottom: "2px solid " + baseColor,
                borderTopLeftRadius: isStartDay ? "6px" : "0",
                borderBottomLeftRadius: isStartDay ? "6px" : "0",
                borderTopRightRadius: isEndDay ? "6px" : "0",
                borderBottomRightRadius: isEndDay ? "6px" : "0",
            }}
            title={`${task.title} (${task.start_date} → ${task.due_date})`}
        >
            <div className="flex h-full items-center overflow-hidden px-1.5">
                <span className="truncate text-[9px] text-white drop-shadow-md">
                    {isStartDay ? task.title : ""}
                </span>
            </div>
            {isToday && (
                <div className="absolute right-0 top-0 h-full w-0.5 bg-white/50" />
            )}
        </div>
    );
}
