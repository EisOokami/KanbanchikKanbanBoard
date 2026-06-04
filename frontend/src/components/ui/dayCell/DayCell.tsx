import EventChip from "../eventChip/EventChip";
import { Task } from "@/types/types";

interface DayCellProps {
    day: number;
    dateStr: string;
    tasks: Task[];
    isToday: boolean;
    isSelected: boolean;
    isOtherMonth: boolean;
    onClick: (dateStr: string) => void;
}

export default function DayCell({
    day,
    dateStr,
    tasks,
    isToday,
    isSelected,
    isOtherMonth,
    onClick,
}: DayCellProps) {
    const visible = tasks.slice(0, 3);
    const overflow = tasks.length - 3;

    return (
        <div
            onClick={() => onClick(dateStr)}
            className={[
                "flex min-h-[110px] cursor-pointer flex-col gap-1 border-b border-r p-2 transition-colors",
                isOtherMonth ? "bg-gray-50/50" : "bg-white hover:bg-blue-50/25",
                isSelected
                    ? "bg-blue-50/50 ring-1 ring-inset ring-blue-300"
                    : "",
            ].join(" ")}
        >
            <div className="mb-0.5 flex items-center justify-between">
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
        </div>
    );
}
