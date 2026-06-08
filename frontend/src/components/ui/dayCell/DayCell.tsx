import EventChip from "../eventChip/EventChip";
import GanttBar from "../ganttBar/GanttBar";
import { Task } from "@/types/types";

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
    onTaskClick: (task: Task) => void;
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
}: DayCellProps) {
    const visible = tasks.slice(0, 3);
    const overflow = tasks.length - 3;
    const dateObj = new Date(dateStr);

    const ganttCellHeight =
        DATE_HEADER_HEIGHT + maxLanes * (LANE_HEIGHT + LANE_GAP) + 8;

    return (
        <div
            onClick={() => onClick(dateStr)}
            style={showGantt ? { height: ganttCellHeight } : undefined}
            className={[
                "cursor-pointer border-b border-r transition-colors",
                showGantt
                    ? "relative overflow-visible" // overflow-visible — ключово для з'єднання барів!
                    : "flex min-h-[110px] flex-col gap-1 p-2",
                isOtherMonth ? "bg-gray-50/50" : "bg-white hover:bg-blue-50/25",
                isSelected
                    ? "bg-blue-50/50 ring-1 ring-inset ring-blue-300"
                    : "",
            ].join(" ")}
        >
            <div
                className="flex items-center justify-between px-2 pt-2"
                style={showGantt ? { height: DATE_HEADER_HEIGHT } : undefined}
            >
                <span
                    className={[
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
                        isToday
                            ? "bg-bright-blue text-white"
                            : isOtherMonth
                              ? "text-gray-300"
                              : "text-gray-600",
                    ].join(" ")}
                >
                    {day}
                </span>
                {tasks.length > 0 && (
                    <span className="text-[9px] font-bold text-gray-400">
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
                        if (!task.start_date || !task.due_date) return null;
                        const taskStart = new Date(task.start_date);
                        const taskEnd = new Date(task.due_date);
                        if (dateObj < taskStart || dateObj > taskEnd)
                            return null;

                        const lane = taskLanes[task.id] ?? 0;
                        if (lane >= maxLanes) return null;

                        const isStartDay =
                            dateStr === task.start_date.toString();
                        const isEndDay = dateStr === task.due_date.toString();

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
                <div className="flex flex-1 flex-col gap-0.5">
                    {visible.map((task) => (
                        <EventChip
                            key={task.id}
                            task={task}
                            onClick={() => onClick(dateStr)}
                        />
                    ))}
                    {overflow > 0 && (
                        <span className="pl-1.5 text-[10px] font-semibold text-gray-400">
                            +{overflow} more
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
