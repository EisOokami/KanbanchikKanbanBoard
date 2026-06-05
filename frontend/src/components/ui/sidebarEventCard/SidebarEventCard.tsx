"use client";

import { Clock } from "lucide-react";
import {
    COLUMNS_CONFIG,
    INITIAL_PROJECTS,
    PRIORITY_CONFIG,
} from "@/constants/constants";
import { cn } from "@/libs/utils";
import { Task } from "@/types/types";

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

    // const STATUS_ORDER: Status[] = ["todo", "inprogress", "review", "done"];

    // const cycleStatus = (): void => {
    //     const next: Status =
    //         STATUS_ORDER[
    //             (STATUS_ORDER.indexOf(task.status) + 1) % STATUS_ORDER.length
    //         ];
    //     onUpdate({ ...task, status: next });
    // };

    const StatusIcon = COLUMNS_CONFIG[task.column].icon;
    const statusColor = COLUMNS_CONFIG[task.column].pill;

    return (
        <button
            className={`w-full rounded-md border p-3 text-left transition-all ${isDone ? "bg-gray-50/60 opacity-60" : "bg-white hover:border-blue-200 hover:shadow-sm"}`}
            onClick={onOpen}
        >
            <div className="flex items-start gap-2">
                {StatusIcon && (
                    <div
                        // onClick={cycleStatus}
                        className={`mt-0.5 flex-shrink-0 ${statusColor} transition-transform hover:scale-110`}
                        title="Click to advance status"
                    >
                        <StatusIcon className="size-3.5" />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p
                        className={`text-xs font-semibold leading-tight ${isDone ? "text-gray-400 line-through" : "text-gray-800"}`}
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
                            {/* {proj.emoji}  */}
                            {/* {task.project} */}
                            {proj.icon}
                            {proj.name}
                        </span>
                        <span
                            className={cn(
                                "flex items-center gap-1 text-[10px] font-semibold",
                                priority.pill,
                            )}
                        >
                            <span
                                className={`size-1.5 rounded-full ${priority.dot}`}
                            />
                            {priority.label}
                        </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Clock className="size-3" />{" "}
                            {task.due_date.toString()}
                        </div>
                        {/* <div className="flex items-center gap-1">
                            <Avatar className="size-5">
                                <AvatarFallback
                                    className={`text-[8px] font-bold text-white ${TEAM_COLORS[task.assignee]?.bg ?? "bg-gray-400"}`}
                                >
                                    {task.assignee}
                                </AvatarFallback>
                            </Avatar> */}
                        {/* <button
                                onClick={() => onDelete(task.id)}
                                className="rounded p-0.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-400"
                            >
                                <X className="size-3" />
                            </button> */}
                        {/* </div> */}
                    </div>
                </div>
            </div>
        </button>
    );
}
