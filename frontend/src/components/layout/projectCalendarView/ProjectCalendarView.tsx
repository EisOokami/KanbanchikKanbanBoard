"use client";

import { useState, useMemo } from "react";
import { Separator } from "@/components/ui/shadcn/separator";
import {
    cn,
    getDaysInMonth,
    getFirstDayOfMonth,
    toDateStr,
    todayStr,
} from "@/libs/utils";
import MiniCalendar from "@/components/ui/miniCalendar/MiniCalendar";
import DayCell from "@/components/ui/dayCell/DayCell";
import DaySidebar from "@/components/ui/daySidebar/DaySidebar";
import { Column, GridCell, Task, User } from "@/types/types";
import { MONTHS, WEEKDAYS } from "@/constants/constants";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

interface ProjectCalendarViewProps {
    columns: Column[];
    showPriorityEmoji: boolean;
    userData: User;
    onOpenDetails: (task: Task) => void;
    onOpenCreateTask: (columnId?: number) => void;
    onSelectedDateChange: (date: string) => void;
}

export default function ProjectCalendarView({
    columns,
    showPriorityEmoji,
    userData,
    onOpenDetails,
    onOpenCreateTask,
    onSelectedDateChange,
}: Readonly<ProjectCalendarViewProps>) {
    const now = new Date();
    const [year, setYear] = useState<number>(now.getFullYear());
    const [month, setMonth] = useState<number>(now.getMonth());
    const [selectedDate, setSelected] = useState<string>(todayStr());
    const [showGantt, setShowGantt] = useState<boolean>(true);

    const prevMonth = () => {
        if (month === 0) {
            setMonth(11);
            setYear((year) => year - 1);
        } else {
            setMonth((month) => month - 1);
        }
    };

    const nextMonth = () => {
        if (month === 11) {
            setMonth(0);
            setYear((year) => year + 1);
        } else {
            setMonth((month) => month + 1);
        }
    };

    const goToday = () => {
        setYear(now.getFullYear());
        setMonth(now.getMonth());
        setSelected(todayStr());
    };

    const allTasks = useMemo(
        () => columns.flatMap((col) => col.tasks),
        [columns],
    );

    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {};
        allTasks.forEach((task) => {
            if (!task.start_date || !task.due_date) {
                return;
            }

            if (showGantt) {
                const startDate = new Date(task.start_date);
                const dueDate = new Date(task.due_date);

                for (
                    let date = new Date(startDate);
                    date <= dueDate;
                    date.setDate(date.getDate() + 1)
                ) {
                    const dateStr = toDateStr(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                    );

                    if (!map[dateStr]) {
                        map[dateStr] = [];
                    }

                    map[dateStr].push(task);
                }
            } else {
                const dueDate = new Date(task.due_date);
                const dateStr = toDateStr(
                    dueDate.getFullYear(),
                    dueDate.getMonth(),
                    dueDate.getDate(),
                );

                if (!map[dateStr]) {
                    map[dateStr] = [];
                }

                map[dateStr].push(task);
            }
        });

        return map;
    }, [allTasks, showGantt]);

    const taskDates = useMemo(
        () => new Set(Object.keys(tasksByDate)),
        [tasksByDate],
    );

    const taskLanes = useMemo(() => {
        const lanes: Record<number, number> = {};

        const sorted = [...allTasks]
            .filter(
                (
                    task,
                ): task is typeof task & {
                    start_date: string | Date;
                    due_date: string | Date;
                } => task.start_date !== null && task.due_date !== null,
            )
            .sort((a, b) => {
                const diff =
                    new Date(a.start_date).getTime() -
                    new Date(b.start_date).getTime();

                if (diff !== 0) {
                    return diff;
                }

                return (
                    new Date(b.due_date).getTime() -
                    new Date(b.start_date).getTime() -
                    (new Date(a.due_date).getTime() -
                        new Date(a.start_date).getTime())
                );
            });

        sorted.forEach((task) => {
            const startDate = new Date(task.start_date).getTime();
            const dueDate = new Date(task.due_date).getTime();
            const occupiedLanes = new Set<number>();

            sorted.forEach((other) => {
                if (other.id === task.id || lanes[other.id] === undefined) {
                    return;
                }

                const otherStartDate = new Date(other.start_date).getTime();
                const otherDueDate = new Date(other.due_date).getTime();

                if (startDate <= otherDueDate && dueDate >= otherStartDate) {
                    occupiedLanes.add(lanes[other.id]);
                }
            });

            let lane = 0;

            while (occupiedLanes.has(lane)) {
                lane++;
            }

            lanes[task.id] = lane;
        });

        return lanes;
    }, [allTasks]);

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month === 0 ? 11 : month - 1);

    const cells = useMemo<GridCell[]>(() => {
        const result: GridCell[] = [];

        for (let i = firstDay - 1; i >= 0; i--) {
            const d = prevMonthDays - i;
            const m2 = month === 0 ? 11 : month - 1;
            const y2 = month === 0 ? year - 1 : year;

            result.push({
                day: d,
                dateStr: toDateStr(y2, m2, d),
                isOtherMonth: true,
            });
        }

        for (let d = 1; d <= daysInMonth; d++) {
            result.push({
                day: d,
                dateStr: toDateStr(year, month, d),
                isOtherMonth: false,
            });
        }

        for (let d = 1; result.length < 42; d++) {
            const month2 = month === 11 ? 0 : month + 1;
            const year2 = month === 11 ? year + 1 : year;

            result.push({
                day: d,
                dateStr: toDateStr(year2, month2, d),
                isOtherMonth: true,
            });
        }

        return result;
    }, [year, month, firstDay, daysInMonth, prevMonthDays]);

    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthTasks = useMemo(
        () =>
            allTasks.filter((task) => {
                if (!task.due_date) {
                    return false;
                }

                const date = new Date(task.due_date);

                return toDateStr(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                ).startsWith(monthStr);
            }),
        [allTasks, monthStr],
    );

    const doneColumn = columns.find((column) => column.name === "done");
    const doneColumnTaskLength = monthTasks.filter((task) =>
        doneColumn
            ? doneColumn.tasks.some(
                  (doneColumnTask) => doneColumnTask.id === task.id,
              )
            : false,
    ).length;

    const progress = monthTasks.length
        ? Math.round((doneColumnTaskLength / monthTasks.length) * 100)
        : 0;

    const statRows = [
        {
            label: "Total tasks",
            value: monthTasks.length,
            color: "text-gray-700",
        },
        {
            label: "Completed",
            value: doneColumnTaskLength,
            color: "text-emerald-600",
        },
        {
            label: "Remaining",
            value: monthTasks.length - doneColumnTaskLength,
            color: "text-bright-blue",
        },
    ];

    return (
        <>
            <div className="flex h-full w-full overflow-hidden rounded-xl bg-white">
                <div className="flex w-56 flex-shrink-0 flex-col border-r">
                    <MiniCalendar
                        viewYear={year}
                        viewMonth={month}
                        selectedDate={selectedDate}
                        onSelectDate={setSelected}
                        eventDates={taskDates}
                    />
                    <Separator />
                    <div className="space-y-3 px-4 py-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            This Month
                        </p>
                        <div className="space-y-2">
                            {statRows.map(({ label, value, color }) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between"
                                >
                                    <span className="text-xs text-gray-500">
                                        {label}
                                    </span>
                                    <span
                                        className={cn(
                                            "text-xs font-bold",
                                            color,
                                        )}
                                    >
                                        {value}
                                    </span>
                                </div>
                            ))}
                            {monthTasks.length > 0 && (
                                <div className="pt-0.5">
                                    <div className="mb-1 flex justify-between text-[10px] text-gray-400">
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className="h-full rounded-full bg-blue-500 transition-all duration-500"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <div className="flex flex-shrink-0 items-center gap-3 border-b px-5 py-3">
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={prevMonth}
                                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                            >
                                <CaretLeftIcon
                                    weight="duotone"
                                    className="size-4"
                                />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                            >
                                <CaretRightIcon
                                    weight="duotone"
                                    className="size-4"
                                />
                            </button>
                        </div>
                        <h2 className="min-w-0 text-base font-black tracking-tight text-gray-800">
                            {MONTHS[month]}{" "}
                            <span className="font-normal text-gray-400">
                                {year}
                            </span>
                        </h2>
                        <button
                            onClick={goToday}
                            className="rounded-md border bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setShowGantt((s) => !s)}
                            className={cn(
                                "ml-2 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
                                showGantt
                                    ? "bg-bright-blue text-white hover:bg-blue-600"
                                    : "bg-white text-gray-600 hover:bg-gray-50",
                            )}
                        >
                            Gantt bars: {showGantt ? "ON" : "OFF"}
                        </button>
                    </div>
                    <div className="flex min-h-0 flex-1 overflow-hidden">
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <div className="grid flex-shrink-0 grid-cols-7 border-b">
                                {WEEKDAYS.map((d, i) => (
                                    <div
                                        key={d}
                                        className={cn(
                                            "border-r py-2.5 text-center text-xs font-bold uppercase tracking-wider last:border-r-0",
                                            i === 0 || i === 6
                                                ? "text-gray-300"
                                                : "text-gray-500",
                                        )}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <div className="grid grid-cols-7">
                                    {cells.map((cell) => (
                                        <DayCell
                                            key={cell.dateStr}
                                            day={cell.day}
                                            dateStr={cell.dateStr}
                                            tasks={
                                                tasksByDate[cell.dateStr] ?? []
                                            }
                                            isToday={
                                                cell.dateStr === todayStr()
                                            }
                                            isSelected={
                                                cell.dateStr === selectedDate
                                            }
                                            isOtherMonth={cell.isOtherMonth}
                                            onClick={setSelected}
                                            onTaskClick={() =>
                                                setSelected(cell.dateStr)
                                            }
                                            showGantt={showGantt}
                                            taskLanes={taskLanes}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DaySidebar
                            dateStr={selectedDate}
                            tasks={tasksByDate[selectedDate] ?? []}
                            columns={columns}
                            showPriorityEmoji={showPriorityEmoji}
                            userData={userData}
                            onOpenDetails={onOpenDetails}
                            onOpenCreate={() => {
                                onOpenCreateTask();
                                onSelectedDateChange(selectedDate);
                            }}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
