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
import { Button } from "@/components/ui/shadcn/button";
import { Progress } from "@/components/ui/shadcn/progress";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/shadcn/popover";

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
    const [showPicker, setShowPicker] = useState<boolean>(false);

    const prevMonth = () => {
        if (month === 0) {
            if (year - 1 < now.getFullYear() - 3) {
                return;
            }

            setMonth(11);
            setYear((year) => year - 1);
        } else {
            setMonth((month) => month - 1);
        }
    };

    const nextMonth = () => {
        if (month === 11) {
            if (year + 1 > now.getFullYear() + 3) {
                return;
            }

            setMonth(0);
            setYear((year) => year + 1);
        } else {
            setMonth((month) => month + 1);
        }
    };

    const selectMonth = (month: number): void => {
        setMonth(month);
    };

    const shiftPickerYear = (delta: number): void => {
        setYear((prevState) => {
            const next = prevState + delta;

            if (next < now.getFullYear() - 3 || next > now.getFullYear() + 3) {
                return prevState;
            }

            return next;
        });
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
            <div className="flex h-full w-full overflow-hidden">
                <div className="hidden w-56 flex-shrink-0 flex-col border-r border-border xl:flex">
                    <MiniCalendar
                        viewYear={year}
                        viewMonth={month}
                        selectedDate={selectedDate}
                        onSelectDate={setSelected}
                        eventDates={taskDates}
                    />
                    <Separator />
                    <div className="space-y-3 px-4 py-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wider">
                            This Month
                        </p>
                        <div className="space-y-2">
                            {statRows.map(({ label, value, color }) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between"
                                >
                                    <span className="text-xs text-muted-foreground">
                                        {label}
                                    </span>
                                    <span
                                        className={cn(
                                            "text-xs font-semibold",
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
                                    <Progress
                                        value={progress}
                                        className="h-1.5 w-full [&>*]:bg-bright-blue"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <div className="flex flex-shrink-0 items-center gap-3 border-b border-border px-5 py-3">
                        <div className="flex items-center gap-0.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={prevMonth}
                                className="size-6 [&_svg]:size-4"
                                disabled={year <= now.getFullYear() - 3}
                            >
                                <CaretLeftIcon weight="duotone" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={nextMonth}
                                className="size-6 [&_svg]:size-4"
                                disabled={year >= now.getFullYear() + 3}
                            >
                                <CaretRightIcon weight="duotone" />
                            </Button>
                        </div>
                        <Popover open={showPicker} onOpenChange={setShowPicker}>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    className="min-w-0 rounded-md px-1.5 py-0.5 text-base font-medium tracking-tight transition-colors hover:bg-control-active"
                                >
                                    {MONTHS[month]}{" "}
                                    <span className="font-light text-muted-foreground">
                                        {year}
                                    </span>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-64 border-border p-3"
                                align="start"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-6 [&_svg]:size-4"
                                        onClick={() => shiftPickerYear(-1)}
                                        disabled={year <= now.getFullYear() - 3}
                                    >
                                        <CaretLeftIcon weight="duotone" />
                                    </Button>
                                    <span className="text-sm font-medium">
                                        {year}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-6 [&_svg]:size-4"
                                        onClick={() => shiftPickerYear(1)}
                                        disabled={year >= now.getFullYear() + 3}
                                    >
                                        <CaretRightIcon weight="duotone" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-3 gap-1">
                                    {MONTHS.map((monthValue, index) => (
                                        <Button
                                            key={monthValue}
                                            variant={
                                                index === month
                                                    ? "default"
                                                    : "ghost"
                                            }
                                            size="sm"
                                            className="h-8 text-xs"
                                            onClick={() => selectMonth(index)}
                                        >
                                            {monthValue.slice(0, 3)}
                                        </Button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                        <div className="ml-2">
                            <Button
                                onClick={goToday}
                                className="h-7 border border-border bg-control text-xs font-semibold text-control-text transition-colors hover:bg-control-active"
                            >
                                Today
                            </Button>
                            <Button
                                onClick={() => setShowGantt((s) => !s)}
                                className={cn(
                                    "ml-2 h-7 rounded-md border border-border px-2.5 py-1 text-xs font-semibold transition-colors",
                                    showGantt
                                        ? "bg-bright-blue text-white hover:bg-blue-600"
                                        : "bg-control text-control-text hover:bg-control-active",
                                )}
                            >
                                Gantt bars: {showGantt ? "ON" : "OFF"}
                            </Button>
                        </div>
                    </div>
                    <div className="flex min-h-0 flex-1 overflow-hidden">
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <div className="grid flex-shrink-0 grid-cols-7 border-b border-border">
                                {WEEKDAYS.map((day, i) => (
                                    <div
                                        key={day}
                                        className={cn(
                                            "border-r border-border py-2.5 text-center text-xs font-medium uppercase tracking-wider last:border-r-0",
                                            i === 0 || i === 6
                                                ? ""
                                                : "text-muted-foreground",
                                        )}
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <div className="grid h-full grid-cols-7">
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
