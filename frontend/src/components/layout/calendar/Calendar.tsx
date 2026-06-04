"use client";

import { useState, useMemo } from "react";
import { Separator } from "@/components/ui/shadcn/separator";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CreateTaskModal } from "@/components/ui/createTaskModal/CreateTaskModal";
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
import { Task } from "@/types/types";
import {
    INITIAL_TASKS,
    MOCK_CATEGORIES,
    MONTHS,
    WEEKDAYS,
} from "@/constants/constants";
import { taskDateStr } from "@/libs/calendar";

interface GridCell {
    day: number;
    dateStr: string;
    isOtherMonth: boolean;
}

interface CalendarProps {
    initialTasks?: Task[];
}

export default function Calendar({
    initialTasks = INITIAL_TASKS,
}: CalendarProps) {
    const now = new Date();
    const [year, setYear] = useState<number>(now.getFullYear());
    const [month, setMonth] = useState<number>(now.getMonth());
    const [selectedDate, setSelected] = useState<string>(todayStr());
    const [filterCategoryId, setFilterCategoryId] = useState<number | null>(
        null,
    );
    const [addOpen, setAddOpen] = useState<boolean>(false);

    const prevMonth = (): void => {
        if (month === 0) {
            setMonth(11);
            setYear((y) => y - 1);
        } else setMonth((m) => m - 1);
    };
    const nextMonth = (): void => {
        if (month === 11) {
            setMonth(0);
            setYear((y) => y + 1);
        } else setMonth((m) => m + 1);
    };
    const goToday = (): void => {
        setYear(now.getFullYear());
        setMonth(now.getMonth());
        setSelected(todayStr());
    };

    const filtered: Task[] = useMemo(
        () =>
            filterCategoryId === null
                ? initialTasks
                : initialTasks.filter((t) =>
                      t.categories.some((c) => c.id === filterCategoryId),
                  ),
        [initialTasks, filterCategoryId],
    );

    const tasksByDate: Record<string, Task[]> = useMemo(() => {
        const map: Record<string, Task[]> = {};
        filtered.forEach((t) => {
            const ds = taskDateStr(t);
            if (!ds) return;
            if (!map[ds]) map[ds] = [];
            map[ds].push(t);
        });
        return map;
    }, [filtered]);

    const taskDates: Set<string> = useMemo(
        () => new Set(Object.keys(tasksByDate)),
        [tasksByDate],
    );

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month === 0 ? 11 : month - 1);

    const cells: GridCell[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
        const d = prevMonthDays - i;
        const m2 = month === 0 ? 11 : month - 1;
        const y2 = month === 0 ? year - 1 : year;
        cells.push({
            day: d,
            dateStr: toDateStr(y2, m2, d),
            isOtherMonth: true,
        });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({
            day: d,
            dateStr: toDateStr(year, month, d),
            isOtherMonth: false,
        });
    }
    for (let d = 1; cells.length < 42; d++) {
        const m2 = month === 11 ? 0 : month + 1;
        const y2 = month === 11 ? year + 1 : year;
        cells.push({
            day: d,
            dateStr: toDateStr(y2, m2, d),
            isOtherMonth: true,
        });
    }

    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthTasks = initialTasks.filter((t) => {
        const ds = taskDateStr(t);
        return ds?.startsWith(monthStr) ?? false;
    });
    const doneCnt = monthTasks.filter((t) => t.column === "done").length;
    const progress = monthTasks.length
        ? Math.round((doneCnt / monthTasks.length) * 100)
        : 0;

    const statRows = [
        {
            label: "Total tasks",
            value: monthTasks.length,
            color: "text-gray-700",
        },
        { label: "Completed", value: doneCnt, color: "text-emerald-600" },
        {
            label: "Remaining",
            value: monthTasks.length - doneCnt,
            color: "text-bright-blue",
        },
    ];

    return (
        <>
            <div className="flex h-screen overflow-hidden">
                <div className="flex w-56 flex-shrink-0 flex-col overflow-y-auto border-r bg-white">
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
                    <Separator />
                    <div className="flex-1 px-4 py-4">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Categories
                        </p>
                        <div className="space-y-0.5">
                            <button
                                onClick={() => setFilterCategoryId(null)}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                                    filterCategoryId === null
                                        ? "bg-gray-100 font-semibold text-gray-700"
                                        : "text-gray-500 hover:bg-gray-50",
                                )}
                            >
                                <span className="size-2 rounded-full bg-gray-300" />
                                All categories
                            </button>
                            {Object.values(MOCK_CATEGORIES).map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() =>
                                        setFilterCategoryId(
                                            filterCategoryId === cat.id
                                                ? null
                                                : cat.id,
                                        )
                                    }
                                    className={cn(
                                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                                        filterCategoryId === cat.id
                                            ? "bg-gray-100 font-semibold text-gray-700"
                                            : "text-gray-500 hover:bg-gray-50",
                                    )}
                                >
                                    <span
                                        className="size-2 flex-shrink-0 rounded-full"
                                        style={{ background: cat.color }}
                                    />
                                    <span className="truncate">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <div className="flex flex-shrink-0 items-center gap-3 border-b bg-white px-5 py-3">
                        <div className="flex items-center gap-0.5">
                            <button
                                onClick={prevMonth}
                                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                            >
                                <ChevronLeft className="size-4" />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
                            >
                                <ChevronRight className="size-4" />
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
                        {/* <div className="ml-auto">
                            <Button
                                onClick={() => setAddOpen(true)}
                                size="sm"
                                className="h-8 gap-1.5 bg-bright-blue px-3 text-xs hover:bg-blue-600"
                            >
                                <Plus className="size-3.5" /> Add Task
                            </Button>
                        </div> */}
                    </div>
                    <div className="flex min-h-0 flex-1 overflow-hidden">
                        <div className="flex flex-1 flex-col overflow-hidden">
                            <div className="grid flex-shrink-0 grid-cols-7 border-b bg-white">
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
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DaySidebar
                            dateStr={selectedDate}
                            tasks={tasksByDate[selectedDate] ?? []}
                        />
                    </div>
                </div>
            </div>
            <CreateTaskModal
                open={addOpen}
                onOpenChange={() => setAddOpen(!addOpen)}
                onSubmit={(data) => console.log(data)}
            />
        </>
    );
}
