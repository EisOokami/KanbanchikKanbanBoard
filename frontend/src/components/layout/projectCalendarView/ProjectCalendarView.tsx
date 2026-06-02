"use client";

import { useState, useMemo, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { Button } from "@/components/ui/shadcn/button";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/shadcn/tooltip";
import {
    AlertCircle,
    CalendarCheck,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Circle,
    Clock,
    Loader2,
    LucideProps,
    Plus,
} from "lucide-react";
import { addDays, format } from "date-fns";
import { cn } from "@/libs/utils";
import { CreateTaskModal } from "@/components/ui/createTaskModal/CreateTaskModal";

type Priority = "critical" | "high" | "medium" | "low";
type Status = "todo" | "in_progress" | "in_review" | "done";

interface Member {
    id: string;
    name: string;
    initials: string;
    color: string;
}

interface Task {
    id: string;
    title: string;
    status: Status;
    priority: Priority;
    assignees: string[];
    dueDate: Date;
    category?: string;
    completed: boolean;
    columnId: string;
}

interface PriorityConfig {
    label: string;
    dot: string;
    text: string;
    color: string;
    bg: string;
    border: string;
}

interface StatusConfig {
    label: string;
    icon: React.FC<LucideProps>;
    color: string;
    dot: string;
    pill: string;
}

interface CategoryConfig {
    color: string;
    emoji: string;
}

const PRIORITY_CONFIG: Record<Priority, PriorityConfig> = {
    critical: {
        label: "Critical",
        dot: "bg-rose-500",
        text: "text-rose-600",
        color: "#D93025",
        bg: "#FEF0EF",
        border: "#FACACB",
    },
    high: {
        label: "High",
        dot: "bg-orange-400",
        text: "text-orange-600",
        color: "#C9620A",
        bg: "#FEF4EC",
        border: "#FCD9B5",
    },
    medium: {
        label: "Medium",
        dot: "bg-blue-400",
        text: "text-blue-600",
        color: "#1A6BBF",
        bg: "#EEF4FD",
        border: "#BDD5F5",
    },
    low: {
        label: "Low",
        dot: "bg-gray-300",
        text: "text-gray-500",
        color: "#6B7280",
        bg: "#F9FAFB",
        border: "#E5E7EB",
    },
};

const STATUS_CONFIG: Record<Status, StatusConfig> = {
    todo: {
        label: "To Do",
        icon: Circle,
        color: "text-gray-400",
        dot: "#D1D5DB",
        pill: "bg-gray-100 text-gray-600 border-gray-200",
    },
    in_progress: {
        label: "In Progress",
        icon: Loader2,
        color: "text-blue-500",
        dot: "#3B82F6",
        pill: "bg-blue-100 text-blue-700 border-blue-200",
    },
    in_review: {
        label: "In Review",
        icon: AlertCircle,
        color: "text-amber-500",
        dot: "#F59E0B",
        pill: "bg-amber-100 text-amber-700 border-amber-200",
    },
    done: {
        label: "Done",
        icon: CheckCircle2,
        color: "text-emerald-500",
        dot: "#10B981",
        pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
};

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
    Design: { color: "#6366f1", emoji: "🎨" },
    Engineering: { color: "#10b981", emoji: "⚙️" },
    Research: { color: "#8b5cf6", emoji: "🔬" },
    DevOps: { color: "#0ea5e9", emoji: "🚀" },
    QA: { color: "#f59e0b", emoji: "✅" },
    Marketing: { color: "#ec4899", emoji: "📣" },
    Product: { color: "#f97316", emoji: "📦" },
};

const MEMBERS: Member[] = [
    { id: "m1", name: "Sofia Marchetti", initials: "SM", color: "#7C5CBF" },
    { id: "m2", name: "Luca Ferrara", initials: "LF", color: "#2A9D8F" },
    { id: "m3", name: "Anna Kowalski", initials: "AK", color: "#E76F51" },
    { id: "m4", name: "James Okafor", initials: "JO", color: "#264653" },
    { id: "m5", name: "Mei Lin", initials: "ML", color: "#C09A3A" },
];

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function buildSeeds(): Task[] {
    const now = new Date();
    const d = (offset: number) => addDays(now, offset);
    return [
        {
            id: "t1",
            title: "Redesign onboarding flow",
            status: "in_progress",
            priority: "high",
            assignees: ["m1", "m2"],
            dueDate: d(2),
            category: "Design",
            completed: false,
            columnId: "col2",
        },
        {
            id: "t2",
            title: "Fix Safari auth bug",
            status: "todo",
            priority: "critical",
            assignees: ["m3"],
            dueDate: d(-1),
            category: "Engineering",
            completed: false,
            columnId: "col1",
        },
        {
            id: "t3",
            title: "Write API docs",
            status: "todo",
            priority: "medium",
            assignees: ["m2"],
            dueDate: d(7),
            category: "Engineering",
            completed: false,
            columnId: "col1",
        },
        {
            id: "t4",
            title: "User interviews Q3",
            status: "in_review",
            priority: "high",
            assignees: ["m1", "m4"],
            dueDate: d(1),
            category: "Research",
            completed: false,
            columnId: "col3",
        },
        {
            id: "t5",
            title: "Design token update",
            status: "done",
            priority: "low",
            assignees: ["m1"],
            dueDate: d(-3),
            category: "Design",
            completed: true,
            columnId: "col4",
        },
        {
            id: "t6",
            title: "Set up CI/CD pipeline",
            status: "in_progress",
            priority: "medium",
            assignees: ["m3", "m5"],
            dueDate: d(4),
            category: "DevOps",
            completed: false,
            columnId: "col2",
        },
        {
            id: "t7",
            title: "Accessibility audit",
            status: "todo",
            priority: "high",
            assignees: ["m2", "m4"],
            dueDate: d(10),
            category: "QA",
            completed: false,
            columnId: "col1",
        },
        {
            id: "t8",
            title: "Performance regression",
            status: "in_review",
            priority: "critical",
            assignees: ["m5"],
            dueDate: d(0),
            category: "Engineering",
            completed: false,
            columnId: "col3",
        },
        {
            id: "t9",
            title: "Launch email campaign",
            status: "todo",
            priority: "low",
            assignees: ["m4"],
            dueDate: d(14),
            category: "Marketing",
            completed: false,
            columnId: "col1",
        },
        {
            id: "t10",
            title: "Postgres 16 migration",
            status: "done",
            priority: "medium",
            assignees: ["m3"],
            dueDate: d(-5),
            category: "DevOps",
            completed: true,
            columnId: "col4",
        },
        {
            id: "t11",
            title: "Mobile nav prototype",
            status: "in_progress",
            priority: "medium",
            assignees: ["m1"],
            dueDate: d(3),
            category: "Design",
            completed: false,
            columnId: "col2",
        },
        {
            id: "t12",
            title: "Quarterly board presentation",
            status: "todo",
            priority: "high",
            assignees: ["m1", "m2", "m4"],
            dueDate: d(5),
            category: "Research",
            completed: false,
            columnId: "col1",
        },
        {
            id: "t13",
            title: "Component library refactor",
            status: "in_progress",
            priority: "medium",
            assignees: ["m2"],
            dueDate: d(-2),
            category: "Engineering",
            completed: false,
            columnId: "col2",
        },
        {
            id: "t14",
            title: "Hotjar heatmap review",
            status: "todo",
            priority: "low",
            assignees: ["m4", "m5"],
            dueDate: d(8),
            category: "Research",
            completed: false,
            columnId: "col1",
        },
        {
            id: "t15",
            title: "Sprint retrospective prep",
            status: "in_review",
            priority: "medium",
            assignees: ["m1"],
            dueDate: d(6),
            category: "Product",
            completed: false,
            columnId: "col3",
        },
        {
            id: "t16",
            title: "Storybook documentation",
            status: "todo",
            priority: "low",
            assignees: ["m2", "m3"],
            dueDate: d(12),
            category: "Design",
            completed: false,
            columnId: "col1",
        },
        {
            id: "t17",
            title: "Error monitoring setup",
            status: "in_progress",
            priority: "high",
            assignees: ["m5"],
            dueDate: d(9),
            category: "DevOps",
            completed: false,
            columnId: "col2",
        },
        {
            id: "t18",
            title: "UX writing review",
            status: "done",
            priority: "low",
            assignees: ["m1", "m4"],
            dueDate: d(-4),
            category: "Design",
            completed: true,
            columnId: "col4",
        },
    ];
}

const SEED_TASKS = buildSeeds();

function toDateStr(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function todayStr(): string {
    const d = new Date();
    return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
}

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG);

function EventChip({ task, onClick }: { task: Task; onClick: () => void }) {
    const cat = CATEGORY_CONFIG[task.category ?? ""] ?? {
        color: "#94a3b8",
        emoji: "📌",
    };
    const isDone = task.completed;

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className="flex w-full items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-semibold transition-all hover:brightness-95"
            style={{
                background: `${cat.color}18`,
                color: isDone ? "#94a3b8" : cat.color,
                textDecoration: isDone ? "line-through" : "none",
                opacity: isDone ? 0.65 : 1,
            }}
            title={task.title}
        >
            <span className="shrink-0 opacity-70">{cat.emoji}</span>
            <span className="truncate">{task.title}</span>
        </button>
    );
}

interface MiniCalendarProps {
    viewYear: number;
    viewMonth: number;
    selectedDate: string;
    onSelectDate: (ds: string) => void;
    taskDates: Set<string>;
}

function MiniCalendar({
    viewYear,
    viewMonth,
    selectedDate,
    onSelectDate,
    taskDates,
}: MiniCalendarProps) {
    const [mYear, setMYear] = useState(viewYear);
    const [mMonth, setMMonth] = useState(viewMonth);
    const daysInMonth = getDaysInMonth(mYear, mMonth);
    const firstDay = getFirstDayOfMonth(mYear, mMonth);
    const today = todayStr();

    const prev = () => {
        if (mMonth === 0) {
            setMMonth(11);
            setMYear((y) => y - 1);
        } else setMMonth((m) => m - 1);
    };
    const next = () => {
        if (mMonth === 11) {
            setMMonth(0);
            setMYear((y) => y + 1);
        } else setMMonth((m) => m + 1);
    };

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">
                    {MONTHS[mMonth].slice(0, 3)} {mYear}
                </span>
                <div className="flex gap-0.5">
                    <button
                        onClick={prev}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100"
                    >
                        <ChevronLeft className="size-3" />
                    </button>
                    <button
                        onClick={next}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100"
                    >
                        <ChevronRight className="size-3" />
                    </button>
                </div>
            </div>
            <div className="mb-1 grid grid-cols-7">
                {WEEKDAYS.map((d) => (
                    <div
                        key={d}
                        className="pb-1 text-center text-[9px] font-bold text-gray-400"
                    >
                        {d[0]}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((day, i) => {
                    if (day === null) return <div key={`_${i}`} />;
                    const ds = toDateStr(mYear, mMonth, day);
                    const isT = ds === today;
                    const isSel = ds === selectedDate;
                    const hasTask = taskDates.has(ds);
                    return (
                        <button
                            key={ds}
                            onClick={() => onSelectDate(ds)}
                            className={cn(
                                "flex aspect-square flex-col items-center justify-center rounded-full text-[10px] font-semibold transition-all",
                                isT
                                    ? "bg-bright-blue text-white"
                                    : isSel
                                      ? "bg-blue-100 text-blue-600"
                                      : "text-gray-600 hover:bg-gray-100",
                            )}
                        >
                            {day}
                            {hasTask && !isT && (
                                <span className="-mt-0.5 h-1 w-1 rounded-full bg-blue-400" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function SidebarTaskCard({
    task,
}: {
    task: Task;
    onToggleComplete: (id: string) => void;
}) {
    const pri = PRIORITY_CONFIG[task.priority];
    const StatusIcon = STATUS_CONFIG[task.status].icon;
    const statusColor = STATUS_CONFIG[task.status].color;
    const cat = CATEGORY_CONFIG[task.category ?? ""] ?? {
        color: "#94a3b8",
        emoji: "📌",
    };
    const isDone = task.completed;

    return (
        <div
            className={cn(
                "w-full rounded-md border p-3 text-left transition-all",
                isDone
                    ? "bg-gray-50/60 opacity-60"
                    : "bg-white hover:border-blue-200 hover:shadow-sm",
            )}
        >
            <div className="flex items-start gap-2">
                <div
                    className={cn(
                        "mt-0.5 flex-shrink-0 transition-transform hover:scale-110",
                        statusColor,
                    )}
                >
                    <StatusIcon className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p
                        className={cn(
                            "text-xs font-semibold leading-tight",
                            isDone
                                ? "text-gray-400 line-through"
                                : "text-gray-800",
                        )}
                    >
                        {task.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {task.category && (
                            <span
                                className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                                style={{
                                    background: `${cat.color}15`,
                                    color: cat.color,
                                }}
                            >
                                {cat.emoji} {task.category}
                            </span>
                        )}
                        <span
                            className={cn(
                                "flex items-center gap-1 text-[10px] font-semibold",
                                pri.text,
                            )}
                        >
                            <span
                                className={cn("size-1.5 rounded-full", pri.dot)}
                            />
                            {pri.label}
                        </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <Clock className="size-3" />
                            {format(task.dueDate, "MMM d")}
                        </div>
                        <div className="flex -space-x-1.5">
                            {MEMBERS.filter((m) =>
                                task.assignees.includes(m.id),
                            )
                                .slice(0, 3)
                                .map((m) => (
                                    <Tooltip key={m.id}>
                                        <TooltipTrigger asChild>
                                            <Avatar className="size-5 ring-1 ring-white">
                                                <AvatarFallback
                                                    className="text-[8px] font-bold text-white"
                                                    style={{
                                                        background: m.color,
                                                    }}
                                                >
                                                    {m.initials}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {m.name}
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DaySidebar({
    dateStr,
    tasks,
    onToggleComplete,
    handleShowNewTaskModal,
}: {
    dateStr: string;
    tasks: Task[];
    onToggleComplete: (id: string) => void;
    handleShowNewTaskModal: () => void;
}) {
    // const [addOpen, setAddOpen] = useState(false);
    const date = new Date(dateStr + "T00:00:00");
    const isTodayDay = dateStr === todayStr();

    const grouped: Record<Status, Task[]> = {
        in_progress: tasks.filter((t) => t.status === "in_progress"),
        in_review: tasks.filter((t) => t.status === "in_review"),
        todo: tasks.filter((t) => t.status === "todo"),
        done: tasks.filter((t) => t.status === "done"),
    };

    return (
        <div className="flex w-72 flex-shrink-0 flex-col border-l">
            {/* Header */}
            <div className="border-b px-4 py-4">
                <div className="mb-0.5 flex items-center gap-2">
                    <span
                        className={cn(
                            "text-3xl font-black leading-none",
                            isTodayDay ? "text-bright-blue" : "text-gray-800",
                        )}
                    >
                        {date.getDate()}
                    </span>
                    {isTodayDay && (
                        <span className="rounded-full border border-blue-200 bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                            Today
                        </span>
                    )}
                </div>
                <p className="text-xs font-medium text-gray-400">
                    {date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        year: "numeric",
                    })}
                </p>
            </div>
            <div className="border-b px-4 py-3">
                <Button
                    size="sm"
                    className="h-8 w-full gap-1.5 bg-bright-blue text-xs hover:bg-blue-600"
                    onClick={handleShowNewTaskModal}
                >
                    <Plus className="size-3.5" /> Add Task
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="space-y-5 px-4 py-3">
                    {tasks.length === 0 ? (
                        <div className="py-10 text-center text-gray-400">
                            <CalendarCheck className="mx-auto mb-2 size-8 opacity-25" />
                            <p className="text-xs font-medium">
                                No tasks scheduled
                            </p>
                            <p className="mt-0.5 text-xs text-gray-300">
                                Press &quot;Add Task&quot; to get started
                            </p>
                        </div>
                    ) : (
                        (Object.entries(grouped) as [Status, Task[]][]).map(
                            ([status, evts]) => {
                                if (!evts.length) return null;
                                const cfg = STATUS_CONFIG[status];
                                const Icon = cfg.icon;
                                return (
                                    <div key={status}>
                                        <div
                                            className={cn(
                                                "mb-2 flex items-center gap-1.5",
                                                cfg.color,
                                            )}
                                        >
                                            <Icon className="size-3.5" />
                                            <span className="text-xs font-bold uppercase tracking-wider">
                                                {cfg.label}
                                            </span>
                                            <span className="ml-1 text-[10px] text-gray-300">
                                                ({evts.length})
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            {evts.map((task) => (
                                                <SidebarTaskCard
                                                    key={task.id}
                                                    task={task}
                                                    onToggleComplete={
                                                        onToggleComplete
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            },
                        )
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

interface ProjectCalendarViewProps {
    initialTasks?: Task[];
}

export function ProjectCalendarView({
    initialTasks = SEED_TASKS,
}: ProjectCalendarViewProps) {
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [selectedDate, setSelected] = useState(todayStr());
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);

    const prevMonth = () => {
        if (month === 0) {
            setMonth(11);
            setYear((y) => y - 1);
        } else setMonth((m) => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) {
            setMonth(0);
            setYear((y) => y + 1);
        } else setMonth((m) => m + 1);
    };
    const goToday = () => {
        setYear(now.getFullYear());
        setMonth(now.getMonth());
        setSelected(todayStr());
    };

    const toggleComplete = (id: string) =>
        setTasks((t) =>
            t.map((x) => (x.id === id ? { ...x, completed: !x.completed } : x)),
        );

    const handleShowNewTaskModal = useCallback(() => {
        setShowNewTaskModal(!showNewTaskModal);
    }, [showNewTaskModal]);

    const filtered = useMemo(
        () =>
            tasks.filter(
                (t) =>
                    filterCategory === "all" || t.category === filterCategory,
            ),
        [tasks, filterCategory],
    );

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month === 0 ? 11 : month - 1);

    interface GridCell {
        day: number;
        dateStr: string;
        isOtherMonth: boolean;
    }
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

    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {};
        filtered.forEach((t) => {
            const ds = toDateStr(
                t.dueDate.getFullYear(),
                t.dueDate.getMonth(),
                t.dueDate.getDate(),
            );
            if (!map[ds]) map[ds] = [];
            map[ds].push(t);
        });
        return map;
    }, [filtered]);

    const taskDates = useMemo(
        () => new Set(Object.keys(tasksByDate)),
        [tasksByDate],
    );

    const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const monthTasks = tasks.filter((t) =>
        toDateStr(
            t.dueDate.getFullYear(),
            t.dueDate.getMonth(),
            t.dueDate.getDate(),
        ).startsWith(monthStr),
    );
    const doneCnt = monthTasks.filter((t) => t.status === "done").length;
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

    const sidebarTasks = tasksByDate[selectedDate] ?? [];

    return (
        <>
            <div className="flex h-screen overflow-hidden">
                <div className="flex w-56 flex-shrink-0 flex-col overflow-y-auto border-r bg-white">
                    <MiniCalendar
                        viewYear={year}
                        viewMonth={month}
                        selectedDate={selectedDate}
                        onSelectDate={setSelected}
                        taskDates={taskDates}
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
                                onClick={() => setFilterCategory("all")}
                                className={cn(
                                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                                    filterCategory === "all"
                                        ? "bg-gray-100 font-semibold text-gray-700"
                                        : "text-gray-500 hover:bg-gray-50",
                                )}
                            >
                                <span className="size-2 rounded-full bg-gray-300" />
                                All categories
                            </button>
                            {ALL_CATEGORIES.map((cat) => {
                                const cfg = CATEGORY_CONFIG[cat];
                                return (
                                    <button
                                        key={cat}
                                        onClick={() =>
                                            setFilterCategory(
                                                filterCategory === cat
                                                    ? "all"
                                                    : cat,
                                            )
                                        }
                                        className={cn(
                                            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
                                            filterCategory === cat
                                                ? "bg-gray-100 font-semibold text-gray-700"
                                                : "text-gray-500 hover:bg-gray-50",
                                        )}
                                    >
                                        <span
                                            className="size-2 flex-shrink-0 rounded-full"
                                            style={{ background: cfg.color }}
                                        />
                                        <span className="truncate">{cat}</span>
                                    </button>
                                );
                            })}
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
                        <div className="ml-auto">
                            <Button
                                size="sm"
                                className="h-8 gap-1.5 bg-bright-blue px-3 text-xs hover:bg-blue-600"
                                onClick={handleShowNewTaskModal}
                            >
                                <Plus className="size-3.5" /> Add Task
                            </Button>
                        </div>
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
                                    {cells.map((cell) => {
                                        const cellTasks =
                                            tasksByDate[cell.dateStr] ?? [];
                                        const isT = cell.dateStr === todayStr();
                                        const isSel =
                                            cell.dateStr === selectedDate;
                                        const visible = cellTasks.slice(0, 3);
                                        const overflow = cellTasks.length - 3;

                                        return (
                                            <div
                                                key={cell.dateStr}
                                                onClick={() =>
                                                    setSelected(cell.dateStr)
                                                }
                                                className={cn(
                                                    "flex min-h-[110px] cursor-pointer flex-col gap-1 border-b border-r p-2 transition-colors",
                                                    cell.isOtherMonth
                                                        ? "bg-gray-50/50"
                                                        : "bg-white hover:bg-blue-50/25",
                                                    isSel
                                                        ? "bg-blue-50/50 ring-1 ring-inset ring-blue-300"
                                                        : "",
                                                )}
                                            >
                                                <div className="mb-0.5 flex items-center justify-between">
                                                    <span
                                                        className={cn(
                                                            "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors",
                                                            isT
                                                                ? "bg-bright-blue text-white"
                                                                : cell.isOtherMonth
                                                                  ? "text-gray-300"
                                                                  : "text-gray-600",
                                                        )}
                                                    >
                                                        {cell.day}
                                                    </span>
                                                    {cellTasks.length > 0 && (
                                                        <span className="text-[9px] font-bold text-gray-400">
                                                            {cellTasks.length}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-1 flex-col gap-0.5">
                                                    {visible.map((task) => (
                                                        <EventChip
                                                            key={task.id}
                                                            task={task}
                                                            onClick={() =>
                                                                setSelected(
                                                                    cell.dateStr,
                                                                )
                                                            }
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
                                    })}
                                </div>
                            </div>
                        </div>
                        <DaySidebar
                            dateStr={selectedDate}
                            tasks={sidebarTasks}
                            onToggleComplete={toggleComplete}
                            handleShowNewTaskModal={handleShowNewTaskModal}
                        />
                    </div>
                </div>
            </div>
            <CreateTaskModal
                open={showNewTaskModal}
                onOpenChange={handleShowNewTaskModal}
            />
        </>
    );
}
