"use client";

import { useState, useMemo, useEffect } from "react";
import CreateTaskModal from "@/components/ui/createTaskModal/CreateTaskModal";
import {
    cn,
    getDaysInMonth,
    getFirstDayOfMonth,
    toDateStr,
    todayStr,
} from "@/libs/utils";
import DayCell from "@/components/ui/dayCell/DayCell";
import DaySidebar from "@/components/ui/daySidebar/DaySidebar";
import { GridCell, Project, Task, User } from "@/types/types";
import { MONTHS, WEEKDAYS } from "@/constants/constants";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import TaskDetailsSheet from "@/components/ui/taskDetailsSheet/TaskDetailsSheet";
import { getProjectData } from "@/data/loaders";
import { Button } from "@/components/ui/shadcn/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/shadcn/popover";

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
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);
    const [showTaskDetailsSheet, setShowTaskDetailsSheet] =
        useState<boolean>(false);
    const [showGantt, setShowGantt] = useState<boolean>(false);
    const [showPicker, setShowPicker] = useState<boolean>(false);

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
            if (year - 1 < now.getFullYear() - 3) {
                return;
            }

            setMonth(11);
            setYear((year) => year - 1);
        } else {
            setMonth((month) => month - 1);
        }
    };

    const nextMonth = (): void => {
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

    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {};

        tasksData.forEach((task) => {
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
    }, [tasksData, showGantt]);

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month === 0 ? 11 : month - 1);

    const cells: GridCell[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
        const date = prevMonthDays - i;
        const month2 = month === 0 ? 11 : month - 1;
        const year2 = month === 0 ? year - 1 : year;

        cells.push({
            day: date,
            dateStr: toDateStr(year2, month2, date),
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
        const month2 = month === 11 ? 0 : month + 1;
        const year2 = month === 11 ? year + 1 : year;

        cells.push({
            day: d,
            dateStr: toDateStr(year2, month2, d),
            isOtherMonth: true,
        });
    }

    const taskLanes: Record<number, number> = useMemo(() => {
        const lanes: Record<number, number> = {};
        const sorted = [...tasksData]
            .filter(
                (
                    task,
                ): task is typeof task & {
                    start_date: string | Date;
                    due_date: string | Date;
                } => task.start_date !== null && task.due_date !== null,
            )
            .sort((a, b) => {
                const startDiff =
                    new Date(a.start_date).getTime() -
                    new Date(b.start_date).getTime();

                if (startDiff !== 0) {
                    return startDiff;
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

                const otherStart = new Date(other.start_date).getTime();
                const otherEnd = new Date(other.due_date).getTime();

                if (startDate <= otherEnd && dueDate >= otherStart) {
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
    }, [tasksData]);

    return (
        <>
            <div className="flex h-full w-full rounded-xl bg-background-secondary">
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
                                            "border-r border-border py-2.5 text-center text-xs font-bold uppercase tracking-wider last:border-r-0",
                                            i === 0 || i === 6
                                                ? "text-gray-300"
                                                : "text-gray-500",
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
                            userData={{ ...userData, role: "owner" }}
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
                    userData={{
                        ...userData,
                        role: selectedTask.project.members.find(
                            (member) => member.id === userData.id,
                        )?.role,
                    }}
                    currentPath="/calendar"
                />
            )}
        </>
    );
}
