"use client";

import EventChip from "../eventChip/EventChip";
import GanttBar from "../ganttBar/GanttBar";
import { Task } from "@/types/types";
import { cn, toDateStr } from "@/libs/utils";

const LANE_HEIGHT = 20;
const LANE_GAP = 2;
const DATE_HEADER_HEIGHT = 28;

interface DayCellProps {
    day: number;
    dateStr: string;
    tasks: Task[];
    isToday: boolean;
    isSelected: boolean;
    isOtherMonth: boolean;
    onClick: (dateStr: string) => void;
    onTaskClick: () => void;
    showGantt: boolean;
    taskLanes?: Record<number, number>;
    maxLanes?: number;
}

export default function DayCell({
    day,
    dateStr,
    tasks,
    isToday,
    isSelected,
    isOtherMonth,
    onClick,
    onTaskClick,
    showGantt,
    taskLanes = {},
    maxLanes = 3,
}: Readonly<DayCellProps>) {
    const visible = tasks.slice(0, 3);
    const overflow = tasks.length - 3;

    return (
        <div
            onClick={() => onClick(dateStr)}
            className={[
                "cursor-pointer border-b border-r border-border transition-colors",
                showGantt
                    ? "relative overflow-visible"
                    : "flex flex-col gap-1 p-2",
                isOtherMonth
                    ? "bg-background"
                    : "bg-background-secondary hover:bg-blue-50/25 dark:hover:bg-blue-950/25",
                isSelected
                    ? "bg-blue-50/50 ring-1 ring-inset ring-blue-300 dark:bg-blue-950/50"
                    : "",
            ].join(" ")}
        >
            <div
                className={cn(
                    "flex items-center justify-between",
                    showGantt && "px-2 pt-2",
                )}
                style={showGantt ? { height: DATE_HEADER_HEIGHT } : undefined}
            >
                <span
                    className={[
                        "flex size-6 items-center justify-center rounded-full text-xs transition-colors",
                        isToday
                            ? "bg-bright-blue text-white"
                            : isOtherMonth
                              ? "text-gray-300 dark:text-gray-700"
                              : "text-gray-600 dark:text-gray-400",
                    ].join(" ")}
                >
                    {day}
                </span>
                {tasks.length > 0 && (
                    <span className="text-[9px] font-semibold text-muted-foreground">
                        {tasks.length}
                    </span>
                )}
            </div>
            {showGantt && (
                <div
                    className="absolute left-0 right-0"
                    style={{ top: DATE_HEADER_HEIGHT }}
                >
                    {tasks.map((task) => {
                        if (!task.start_date || !task.due_date) {
                            return null;
                        }

                        const taskStartDate = new Date(task.start_date);
                        const taskEndDate = new Date(task.due_date);

                        const taskStartStr = toDateStr(
                            taskStartDate.getFullYear(),
                            taskStartDate.getMonth(),
                            taskStartDate.getDate(),
                        );
                        const taskEndStr = toDateStr(
                            taskEndDate.getFullYear(),
                            taskEndDate.getMonth(),
                            taskEndDate.getDate(),
                        );

                        if (dateStr < taskStartStr || dateStr > taskEndStr) {
                            return null;
                        }

                        const lane = taskLanes[task.id] ?? 0;

                        if (lane >= maxLanes) {
                            return null;
                        }

                        const isStartDay = dateStr === taskStartStr;
                        const isEndDay = dateStr === taskEndStr;

                        return (
                            <div
                                key={task.id}
                                className="absolute left-0 right-0"
                                style={{
                                    top: lane * (LANE_HEIGHT + LANE_GAP),
                                    height: LANE_HEIGHT,
                                    paddingLeft: isStartDay ? 4 : 0,
                                    paddingRight: isEndDay ? 4 : 0,
                                }}
                            >
                                <GanttBar
                                    task={task}
                                    isStartDay={isStartDay}
                                    isEndDay={isEndDay}
                                    isToday={isToday}
                                    onClick={onTaskClick}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
            {!showGantt && (
                <div className="flex h-16 flex-col gap-0.5">
                    {visible.map((task) => (
                        <EventChip
                            key={task.id}
                            task={task}
                            onClick={() => onClick(dateStr)}
                        />
                    ))}
                    {overflow > 0 && (
                        <span className="pl-1.5 text-[10px] font-medium text-gray-400">
                            +{overflow} more
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
