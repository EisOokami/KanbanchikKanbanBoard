"use client";

import { useState, useMemo, useEffect } from "react";
import { Separator } from "@/components/ui/shadcn/separator";
import CreateTaskModal from "@/components/ui/createTaskModal/CreateTaskModal";
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
import { Project, Task, User } from "@/types/types";
import { MONTHS, WEEKDAYS } from "@/constants/constants";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import TaskDetailsSheet from "@/components/ui/taskDetailsSheet/TaskDetailsSheet";
import { getProjectData } from "@/data/loaders";

interface GridCell {
    day: number;
    dateStr: string;
    isOtherMonth: boolean;
}

interface CalendarProps {
    tasksData: Task[];
    userData: User;
}

export default function Calendar({
    tasksData,
    userData,
}: Readonly<CalendarProps>) {
    const now = new Date();
    const [year, setYear] = useState<number>(now.getFullYear());
    const [month, setMonth] = useState<number>(now.getMonth());
    const [selectedDate, setSelected] = useState<string>(todayStr());
    // const [filterCategoryId, setFilterCategoryId] = useState<number | null>(
    //     null,
    // );
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);
    const [showTaskDetailsSheet, setShowTaskDetailsSheet] =
        useState<boolean>(false);
    const [showGantt, setShowGantt] = useState<boolean>(false);

    useEffect(() => {
        if (!selectedTask) {
            return;
        }

        (async () => {
            const project = await getProjectData(selectedTask.project.slug);

            setProjectData(project);
        })();
    }, [selectedTask]);

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

    const handleShowNewTaskModal = () => {
        setShowNewTaskModal(!showNewTaskModal);
    };

    const handleShowTaskDetailsSheet = () => {
        setShowTaskDetailsSheet(!showTaskDetailsSheet);
    };

    // const filtered: Task[] = useMemo(
    //     () =>
    //         filterCategoryId === null
    //             ? tasksData
    //             : tasksData.filter((t) =>
    //                   t.categories.some((c) => c.id === filterCategoryId),
    //               ),
    //     [tasksData, filterCategoryId],
    // );

    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {};

        tasksData.forEach((t) => {
            if (!t.start_date || !t.due_date) return;

            if (showGantt) {
                const start = new Date(t.start_date);
                const end = new Date(t.due_date);

                for (
                    let d = new Date(start);
                    d <= end;
                    d.setDate(d.getDate() + 1)
                ) {
                    const ds = toDateStr(
                        d.getFullYear(),
                        d.getMonth(),
                        d.getDate(),
                    );

                    if (!map[ds]) map[ds] = [];

                    map[ds].push(t);
                }
            } else {
                const end = new Date(t.due_date);
                const ds = toDateStr(
                    end.getFullYear(),
                    end.getMonth(),
                    end.getDate(),
                );

                if (!map[ds]) map[ds] = [];

                map[ds].push(t);
            }
        });

        return map;
    }, [tasksData, showGantt]);

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

    const taskLanes: Record<number, number> = useMemo(() => {
        const lanes: Record<number, number> = {};
        // const sorted = [...filtered]
        const sorted = [...tasksData]
            .filter((t) => t.start_date && t.due_date)
            .sort((a, b) => {
                const startDiff =
                    new Date(a.start_date).getTime() -
                    new Date(b.start_date).getTime();

                if (startDiff !== 0) return startDiff;

                return (
                    new Date(b.due_date).getTime() -
                    new Date(b.start_date).getTime() -
                    (new Date(a.due_date).getTime() -
                        new Date(a.start_date).getTime())
                );
            });

        sorted.forEach((task) => {
            const start = new Date(task.start_date).getTime();
            const end = new Date(task.due_date).getTime();
            const occupiedLanes = new Set<number>();

            sorted.forEach((other) => {
                if (other.id === task.id || lanes[other.id] === undefined)
                    return;
                const otherStart = new Date(other.start_date).getTime();
                const otherEnd = new Date(other.due_date).getTime();

                if (start <= otherEnd && end >= otherStart) {
                    occupiedLanes.add(lanes[other.id]);
                }
            });

            let lane = 0;

            while (occupiedLanes.has(lane)) lane++;

            lanes[task.id] = lane;
        });

        return lanes;
    }, [tasksData]);

    // const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    // const monthTasks = tasksData.filter((t) => {
    //     const ds = taskDateStr(t);
    //     return ds?.startsWith(monthStr) ?? false;
    // });
    // const doneCnt = monthTasks.filter((t) => t.column === "done").length;
    // const progress = monthTasks.length
    //     ? Math.round((doneCnt / monthTasks.length) * 100)
    //     : 0;

    // const statRows = [
    //     {
    //         label: "Total tasks",
    //         value: monthTasks.length,
    //         color: "text-gray-700",
    //     },
    //     { label: "Completed", value: doneCnt, color: "text-emerald-600" },
    //     {
    //         label: "Remaining",
    //         value: monthTasks.length - doneCnt,
    //         color: "text-bright-blue",
    //     },
    // ];

    return (
        <>
            <div className="flex h-full w-full rounded-xl bg-white">
                <div className="flex w-56 flex-shrink-0 flex-col border-r">
                    <MiniCalendar
                        viewYear={year}
                        viewMonth={month}
                        selectedDate={selectedDate}
                        onSelectDate={setSelected}
                        eventDates={taskDates}
                    />
                    <Separator />
                    {/* <div className="space-y-3 px-4 py-4">
                        <p className="text-sm font-semibold">This Month</p>
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
                                    <div className="mb-1 flex justify-between text-[10px]">
                                        <span>Progress</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <Progress
                                        value={progress}
                                        className="h-1.5 [&>*]:bg-bright-blue"
                                    />
                                </div>
                            )}
                        </div>
                    </div> */}
                    {/* <Separator />
                    <div className="flex-1 px-4 py-4">
                        <p className="mb-3 text-sm font-semibold">Categories</p>
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
                                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs capitalize transition-colors",
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
                    </div> */}
                </div>
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <div className="flex flex-shrink-0 items-center gap-3 border-b px-5 py-3">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={prevMonth}
                                className="rounded-md p-1.5 transition-colors hover:bg-gray-100"
                            >
                                <CaretLeftIcon
                                    weight="duotone"
                                    className="size-4"
                                />
                            </button>
                            <h2 className="min-w-0 text-base font-bold">
                                {MONTHS[month]}{" "}
                                <span className="font-normal text-gray-500">
                                    {year}
                                </span>
                            </h2>
                            <button
                                onClick={nextMonth}
                                className="rounded-md p-1.5 transition-colors hover:bg-gray-100"
                            >
                                <CaretRightIcon
                                    weight="duotone"
                                    className="size-4"
                                />
                            </button>
                        </div>
                        <div className="space-x-1">
                            <button
                                onClick={goToday}
                                className="rounded-md border bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setShowGantt((s) => !s)}
                                className={cn(
                                    "rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
                                    showGantt
                                        ? "bg-bright-blue text-white hover:bg-blue-600"
                                        : "bg-white text-gray-600 hover:bg-gray-50",
                                )}
                            >
                                Gantt bars: {showGantt ? "ON" : "OFF"}
                            </button>
                        </div>
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
                            onOpenCreate={handleShowNewTaskModal}
                            onOpenDetails={(task: Task) => {
                                setSelectedTask(task);
                                handleShowTaskDetailsSheet();
                            }}
                        />
                    </div>
                </div>
            </div>
            <CreateTaskModal
                open={showNewTaskModal}
                onOpenChange={handleShowNewTaskModal}
                showProjectSelect
                currentPath="/calendar"
                date={selectedDate}
            />
            {selectedTask && projectData && (
                <TaskDetailsSheet
                    key={selectedTask.id}
                    open={showTaskDetailsSheet}
                    onOpenChange={handleShowTaskDetailsSheet}
                    selectedTask={selectedTask}
                    projectData={projectData}
                    userData={userData}
                    currentPath="/calendar"
                />
            )}
        </>
    );
}
