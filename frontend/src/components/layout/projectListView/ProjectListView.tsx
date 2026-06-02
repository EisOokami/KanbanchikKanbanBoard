"use client";

import * as React from "react";
import { useState, useMemo, useCallback } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { Button } from "@/components/ui/shadcn/button";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Input } from "@/components/ui/shadcn/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/shadcn/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/shadcn/alert-dialog";
import {
    ArrowDown,
    ArrowUp,
    Calendar,
    CheckCheck,
    ChevronRight,
    ChevronsUpDown,
    ChevronDown,
    ChevronUp,
    Filter,
    Flame,
    LayoutList,
    MessageSquare,
    Minus,
    MoreHorizontal,
    Paperclip,
    Pencil,
    Pin,
    PinOff,
    Plus,
    Search,
    SlidersHorizontal,
    Trash2,
    X,
} from "lucide-react";
import { format, isPast, isToday, isTomorrow } from "date-fns";
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
    dueDate?: Date;
    category?: string;
    labels: string[];
    progress: number;
    attachments: number;
    checklistTotal: number;
    checklistDone: number;
    completed: boolean;
    columnId: string;
    pinned: boolean;
    comments: number;
}

type SortField =
    | "title"
    | "status"
    | "priority"
    | "dueDate"
    | "progress"
    | "assignees"
    | "category";
type SortDir = "asc" | "desc";

interface FilterState {
    search: string;
    status: Status[];
    priority: Priority[];
    category: string[];
    overdue: boolean;
}

const PRIORITY_CONFIG: Record<
    Priority,
    {
        label: string;
        dot: string;
        pill: string;
        icon: React.ReactNode;
        order: number;
    }
> = {
    critical: {
        label: "Critical",
        dot: "bg-rose-500",
        pill: "bg-rose-50 text-rose-600 border-rose-200",
        icon: <Flame size={10} />,
        order: 0,
    },
    high: {
        label: "High",
        dot: "bg-orange-400",
        pill: "bg-orange-50 text-orange-600 border-orange-200",
        icon: <ArrowUp size={10} />,
        order: 1,
    },
    medium: {
        label: "Medium",
        dot: "bg-blue-400",
        pill: "bg-blue-50 text-blue-600 border-blue-200",
        icon: <Minus size={10} />,
        order: 2,
    },
    low: {
        label: "Low",
        dot: "bg-gray-300",
        pill: "bg-gray-50 text-gray-500 border-gray-200",
        icon: <ArrowDown size={10} />,
        order: 3,
    },
};

const STATUS_CONFIG: Record<
    Status,
    { label: string; pill: string; dot: string; order: number }
> = {
    todo: {
        label: "To Do",
        pill: "bg-gray-100 text-gray-600 border-gray-200",
        dot: "bg-gray-400",
        order: 0,
    },
    in_progress: {
        label: "In Progress",
        pill: "bg-blue-100 text-blue-700 border-blue-200",
        dot: "bg-blue-500",
        order: 1,
    },
    in_review: {
        label: "In Review",
        pill: "bg-amber-100 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
        order: 2,
    },
    done: {
        label: "Done",
        pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        order: 3,
    },
};

const MEMBERS: Member[] = [
    { id: "m1", name: "Sofia Marchetti", initials: "SM", color: "#7C5CBF" },
    { id: "m2", name: "Luca Ferrara", initials: "LF", color: "#2A9D8F" },
    { id: "m3", name: "Anna Kowalski", initials: "AK", color: "#E76F51" },
    { id: "m4", name: "James Okafor", initials: "JO", color: "#264653" },
    { id: "m5", name: "Mei Lin", initials: "ML", color: "#C09A3A" },
];

const SEED_TASKS: Task[] = [
    {
        id: "TSK-001",
        title: "Redesign onboarding flow",
        status: "in_progress",
        priority: "high",
        assignees: ["m1", "m2"],
        dueDate: new Date(Date.now() + 2 * 86400000),
        category: "Design",
        labels: ["Feature"],
        progress: 60,
        attachments: 3,
        checklistTotal: 5,
        checklistDone: 3,
        completed: false,
        columnId: "col2",
        pinned: true,
        comments: 7,
    },
    {
        id: "TSK-002",
        title: "Fix authentication bug on Safari",
        status: "todo",
        priority: "critical",
        assignees: ["m3"],
        dueDate: new Date(Date.now() - 1 * 86400000),
        category: "Engineering",
        labels: ["Bug"],
        progress: 0,
        attachments: 1,
        checklistTotal: 3,
        checklistDone: 0,
        completed: false,
        columnId: "col1",
        pinned: true,
        comments: 12,
    },
    {
        id: "TSK-003",
        title: "Write API documentation",
        status: "todo",
        priority: "medium",
        assignees: ["m2"],
        dueDate: new Date(Date.now() + 7 * 86400000),
        category: "Engineering",
        labels: [],
        progress: 20,
        attachments: 0,
        checklistTotal: 4,
        checklistDone: 1,
        completed: false,
        columnId: "col1",
        pinned: false,
        comments: 2,
    },
    {
        id: "TSK-004",
        title: "User interviews — Q3 cohort",
        status: "in_review",
        priority: "high",
        assignees: ["m1", "m4"],
        dueDate: new Date(Date.now() + 1 * 86400000),
        category: "Research",
        labels: ["Feature"],
        progress: 80,
        attachments: 5,
        checklistTotal: 6,
        checklistDone: 5,
        completed: false,
        columnId: "col3",
        pinned: false,
        comments: 9,
    },
    {
        id: "TSK-005",
        title: "Design system token update",
        status: "done",
        priority: "low",
        assignees: ["m1"],
        dueDate: new Date(Date.now() - 3 * 86400000),
        category: "Design",
        labels: [],
        progress: 100,
        attachments: 2,
        checklistTotal: 3,
        checklistDone: 3,
        completed: true,
        columnId: "col4",
        pinned: false,
        comments: 4,
    },
    {
        id: "TSK-006",
        title: "Set up CI/CD pipeline",
        status: "in_progress",
        priority: "medium",
        assignees: ["m3", "m5"],
        dueDate: new Date(Date.now() + 4 * 86400000),
        category: "DevOps",
        labels: ["Feature"],
        progress: 45,
        attachments: 0,
        checklistTotal: 7,
        checklistDone: 3,
        completed: false,
        columnId: "col2",
        pinned: false,
        comments: 0,
    },
    {
        id: "TSK-007",
        title: "Accessibility audit",
        status: "todo",
        priority: "high",
        assignees: ["m2", "m4"],
        dueDate: new Date(Date.now() + 10 * 86400000),
        category: "QA",
        labels: [],
        progress: 0,
        attachments: 0,
        checklistTotal: 5,
        checklistDone: 0,
        completed: false,
        columnId: "col1",
        pinned: false,
        comments: 1,
    },
    {
        id: "TSK-008",
        title: "Performance regression analysis",
        status: "in_review",
        priority: "critical",
        assignees: ["m5"],
        dueDate: new Date(),
        category: "Engineering",
        labels: ["Bug", "Urgent"],
        progress: 70,
        attachments: 4,
        checklistTotal: 4,
        checklistDone: 3,
        completed: false,
        columnId: "col3",
        pinned: false,
        comments: 5,
    },
    {
        id: "TSK-009",
        title: "Launch email campaign draft",
        status: "todo",
        priority: "low",
        assignees: ["m4"],
        dueDate: new Date(Date.now() + 14 * 86400000),
        category: "Marketing",
        labels: [],
        progress: 5,
        attachments: 1,
        checklistTotal: 2,
        checklistDone: 0,
        completed: false,
        columnId: "col1",
        pinned: false,
        comments: 3,
    },
    {
        id: "TSK-010",
        title: "Migrate database to Postgres 16",
        status: "done",
        priority: "medium",
        assignees: ["m3"],
        dueDate: new Date(Date.now() - 5 * 86400000),
        category: "DevOps",
        labels: [],
        progress: 100,
        attachments: 0,
        checklistTotal: 8,
        checklistDone: 8,
        completed: true,
        columnId: "col4",
        pinned: false,
        comments: 6,
    },
    {
        id: "TSK-011",
        title: "Prototype mobile nav pattern",
        status: "in_progress",
        priority: "medium",
        assignees: ["m1"],
        dueDate: new Date(Date.now() + 3 * 86400000),
        category: "Design",
        labels: ["Feature"],
        progress: 35,
        attachments: 2,
        checklistTotal: 3,
        checklistDone: 1,
        completed: false,
        columnId: "col2",
        pinned: false,
        comments: 2,
    },
    {
        id: "TSK-012",
        title: "Quarterly board presentation",
        status: "todo",
        priority: "high",
        assignees: ["m1", "m2", "m4"],
        dueDate: new Date(Date.now() + 5 * 86400000),
        category: "Research",
        labels: [],
        progress: 10,
        attachments: 3,
        checklistTotal: 5,
        checklistDone: 1,
        completed: false,
        columnId: "col1",
        pinned: false,
        comments: 0,
    },
];

function isOverdue(dueDate: Date | undefined, status: Status): boolean {
    if (!dueDate || status === "done") return false;
    return isPast(dueDate) && !isToday(dueDate);
}

function formatDate(date: Date): string {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
}

const ALL_CATEGORIES = Array.from(
    new Set(SEED_TASKS.map((t) => t.category).filter(Boolean) as string[]),
);

const DEFAULT_FILTER: FilterState = {
    search: "",
    status: [],
    priority: [],
    category: [],
    overdue: false,
};

function SortIcon({
    field,
    sortField,
    sortDir,
}: {
    field: SortField;
    sortField: SortField;
    sortDir: SortDir;
}) {
    if (field !== sortField)
        return <ChevronsUpDown className="size-3 text-gray-300" />;
    return sortDir === "asc" ? (
        <ChevronUp className="size-3 text-blue-500" />
    ) : (
        <ChevronDown className="size-3 text-blue-500" />
    );
}

function TH({
    label,
    field,
    className = "",
    sortField,
    sortDir,
    onSort,
}: {
    label: string;
    field: SortField;
    className?: string;
    sortField: SortField;
    sortDir: SortDir;
    onSort: (f: SortField) => void;
}) {
    return (
        <th
            className={`cursor-pointer select-none whitespace-nowrap py-2.5 pr-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400 ${className}`}
            onClick={() => onSort(field)}
        >
            <span className="flex items-center gap-1 transition-colors hover:text-gray-600">
                {label}
                <SortIcon
                    field={field}
                    sortField={sortField}
                    sortDir={sortDir}
                />
            </span>
        </th>
    );
}

function FilterChip({
    label,
    onRemove,
}: {
    label: string;
    onRemove: () => void;
}) {
    return (
        <span className="inline-flex items-center gap-1 rounded-md border border-bright-blue px-2 py-1 text-xs font-semibold text-bright-blue">
            {label}
            <button onClick={onRemove} className="ml-0.5">
                <X className="size-3" />
            </button>
        </span>
    );
}

function TaskRow({
    task,
    selected,
    checked,
    onCheck,
    onUpdate,
    onDelete,
    allMembers,
}: {
    task: Task;
    selected: boolean;
    checked: boolean;
    onCheck: (id: string, v: boolean) => void;
    onUpdate: (id: string, patch: Partial<Task>) => void;
    onDelete: (id: string) => void;
    allMembers: Member[];
}) {
    const pri = PRIORITY_CONFIG[task.priority];
    const st = STATUS_CONFIG[task.status];
    const overdue = isOverdue(task.dueDate, task.status);
    const assignedMembers = allMembers.filter((m) =>
        task.assignees.includes(m.id),
    );
    const doneSubs = task.checklistDone;
    const totalSubs = task.checklistTotal;

    return (
        <tr
            className={cn(
                "group cursor-pointer border-b transition-colors duration-100",
                selected ? "bg-blue-50/70" : "hover:bg-gray-50/70",
                task.completed ? "opacity-60" : "",
            )}
        >
            <td
                className="w-10 py-3 pl-8 pr-2"
                onClick={(e) => e.stopPropagation()}
            >
                <Checkbox
                    checked={checked}
                    onCheckedChange={(v) => onCheck(task.id, !!v)}
                    className="data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                />
            </td>
            <td className="w-24 py-3 pr-4">
                <span className="font-mono text-xs font-medium text-gray-400">
                    {task.id}
                </span>
            </td>
            <td className="min-w-[240px] py-3 pr-4">
                <div className="flex items-center gap-2">
                    {task.pinned && (
                        <Pin className="size-3 flex-shrink-0 fill-amber-400 text-amber-400" />
                    )}
                    <span
                        className={cn(
                            "text-sm font-semibold leading-snug text-gray-800",
                            task.completed && "text-gray-400 line-through",
                        )}
                    >
                        {task.title}
                    </span>
                </div>
                {task.labels.length > 0 && (
                    <div className="mt-1 flex gap-1">
                        {task.labels.slice(0, 2).map((l) => (
                            <span
                                key={l}
                                className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500"
                            >
                                {l}
                            </span>
                        ))}
                        {task.labels.length > 2 && (
                            <span className="text-[10px] text-gray-400">
                                +{task.labels.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </td>
            <td className="w-36 py-3 pr-4">
                {task.category && (
                    <span className="text-xs font-medium text-gray-500">
                        {task.category}
                    </span>
                )}
            </td>
            <td className="w-36 py-3 pr-4">
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold",
                        st.pill,
                    )}
                >
                    <span className={cn("size-1.5 rounded-full", st.dot)} />
                    {st.label}
                </span>
            </td>
            <td className="w-28 py-3 pr-4">
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold",
                        pri.pill,
                    )}
                >
                    <span className={cn("size-1.5 rounded-full", pri.dot)} />
                    {pri.label}
                </span>
            </td>
            <td className="w-28 py-3 pr-4">
                {task.dueDate && (
                    <div
                        className={cn(
                            "flex items-center gap-1 text-xs font-semibold",
                            overdue ? "text-rose-500" : "text-gray-500",
                        )}
                    >
                        {overdue ? (
                            <Flame className="size-3" />
                        ) : (
                            <Calendar className="size-3" />
                        )}
                        {formatDate(task.dueDate)}
                    </div>
                )}
            </td>
            <td className="w-24 py-3 pr-4">
                {totalSubs > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-12 overflow-hidden rounded-full bg-gray-200">
                            <div
                                className="h-full rounded-full bg-blue-400"
                                style={{
                                    width: `${(doneSubs / totalSubs) * 100}%`,
                                    background:
                                        doneSubs === totalSubs
                                            ? "#10b981"
                                            : "#60a5fa",
                                }}
                            />
                        </div>
                        <span className="text-[10px] text-gray-400">
                            {doneSubs}/{totalSubs}
                        </span>
                    </div>
                )}
            </td>
            <td className="w-28 py-3 pr-4">
                <div className="flex -space-x-1.5">
                    {assignedMembers.slice(0, 3).map((m) => (
                        <Tooltip key={m.id}>
                            <TooltipTrigger asChild>
                                <Avatar className="size-6 ring-2 ring-white">
                                    <AvatarFallback
                                        className="text-[9px] font-bold text-white"
                                        style={{ background: m.color }}
                                    >
                                        {m.initials}
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>{m.name}</TooltipContent>
                        </Tooltip>
                    ))}
                    {assignedMembers.length > 3 && (
                        <div className="z-10 flex size-6 items-center justify-center rounded-full bg-gray-200 text-[9px] font-bold text-gray-500 ring-2 ring-white">
                            +{assignedMembers.length - 3}
                        </div>
                    )}
                </div>
            </td>
            <td className="w-24 py-3 pr-4">
                <div className="flex items-center gap-2.5 text-gray-400">
                    {task.comments > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px]">
                            <MessageSquare className="size-3" /> {task.comments}
                        </span>
                    )}
                    {task.attachments > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px]">
                            <Paperclip className="size-3" /> {task.attachments}
                        </span>
                    )}
                </div>
            </td>
            <td className="w-10 py-3 pr-3" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <MoreHorizontal className="size-3.5 text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem className="cursor-pointer gap-2 text-xs">
                            <Pencil className="size-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer gap-2 text-xs"
                            onClick={() =>
                                onUpdate(task.id, { pinned: !task.pinned })
                            }
                        >
                            {task.pinned ? (
                                <PinOff className="size-3.5" />
                            ) : (
                                <Pin className="size-3.5" />
                            )}
                            {task.pinned ? "Unpin" : "Pin task"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    className="cursor-pointer gap-2 text-xs text-rose-500 focus:text-rose-500"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <Trash2 className="size-3.5" /> Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Delete task?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        &quot;{task.title}&quot; will be
                                        permanently deleted. This cannot be
                                        undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => onDelete(task.id)}
                                        className="bg-rose-600 hover:bg-rose-700"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
}

interface ProjectListViewProps {
    initialTasks?: Task[];
}

export function ProjectListView({
    initialTasks = SEED_TASKS,
}: ProjectListViewProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
    const [sortField, setSortField] = useState<SortField>("priority");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [checked, setChecked] = useState<Set<string>>(new Set());
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
        new Set(),
    );
    const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);

    const filtered = useMemo(() => {
        let list = [...tasks];

        if (filter.search) {
            const q = filter.search.toLowerCase();
            list = list.filter(
                (t) =>
                    t.title.toLowerCase().includes(q) ||
                    t.id.toLowerCase().includes(q) ||
                    t.category?.toLowerCase().includes(q) ||
                    t.labels.some((l) => l.toLowerCase().includes(q)),
            );
        }
        if (filter.status.length)
            list = list.filter((t) => filter.status.includes(t.status));
        if (filter.priority.length)
            list = list.filter((t) => filter.priority.includes(t.priority));
        if (filter.category.length)
            list = list.filter(
                (t) => t.category && filter.category.includes(t.category),
            );
        if (filter.overdue)
            list = list.filter((t) => isOverdue(t.dueDate, t.status));

        list.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

            let av: number | string = 0;
            let bv: number | string = 0;

            switch (sortField) {
                case "priority":
                    av = PRIORITY_CONFIG[a.priority].order;
                    bv = PRIORITY_CONFIG[b.priority].order;
                    break;
                case "status":
                    av = STATUS_CONFIG[a.status].order;
                    bv = STATUS_CONFIG[b.status].order;
                    break;
                case "dueDate":
                    av = a.dueDate?.getTime() ?? 0;
                    bv = b.dueDate?.getTime() ?? 0;
                    break;
                case "progress":
                    av = a.progress;
                    bv = b.progress;
                    break;
                case "assignees":
                    av = a.assignees.length;
                    bv = b.assignees.length;
                    break;
                case "category":
                    av = a.category ?? "";
                    bv = b.category ?? "";
                    break;
                default:
                    av = a.title;
                    bv = b.title;
            }

            if (av < bv) return sortDir === "asc" ? -1 : 1;
            if (av > bv) return sortDir === "asc" ? 1 : -1;
            return 0;
        });

        return list;
    }, [tasks, filter, sortField, sortDir]);

    const updateTask = useCallback((id: string, patch: Partial<Task>) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        );
    }, []);

    const deleteTask = useCallback(
        (id: string) => {
            setTasks((prev) => prev.filter((t) => t.id !== id));
            if (selectedTaskId === id) setSelectedTaskId(null);
            setChecked((prev) => {
                const s = new Set(prev);
                s.delete(id);
                return s;
            });
        },
        [selectedTaskId],
    );

    const allChecked =
        filtered.length > 0 && filtered.every((t) => checked.has(t.id));
    const someChecked = !allChecked && filtered.some((t) => checked.has(t.id));

    const toggleAll = () => {
        if (allChecked) setChecked(new Set());
        else setChecked(new Set(filtered.map((t) => t.id)));
    };

    const toggleCheck = (id: string, v: boolean) => {
        setChecked((prev) => {
            const s = new Set(prev);

            if (v) {
                s.add(id);
            } else {
                s.delete(id);
            }

            return s;
        });
    };

    const bulkDelete = () => {
        setTasks((prev) => prev.filter((t) => !checked.has(t.id)));
        if (selectedTaskId && checked.has(selectedTaskId))
            setSelectedTaskId(null);
        setChecked(new Set());
    };

    const bulkMarkDone = () => {
        setTasks((prev) =>
            prev.map((t) =>
                checked.has(t.id)
                    ? {
                          ...t,
                          status: "done" as Status,
                          completed: true,
                          progress: 100,
                      }
                    : t,
            ),
        );
        setChecked(new Set());
    };

    const bulkMarkUndone = () => {
        setTasks((prev) =>
            prev.map((t) =>
                checked.has(t.id)
                    ? { ...t, status: "todo" as Status, completed: false }
                    : t,
            ),
        );
        setChecked(new Set());
    };

    const toggleSort = (field: SortField) => {
        if (sortField === field)
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const setF = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
        setFilter((f) => ({ ...f, [key]: val }));

    const toggleArrFilter = <T extends string>(
        key: "status" | "priority" | "category",
        val: T,
    ) => {
        const arr = filter[key] as T[];
        setF(
            key,
            arr.includes(val)
                ? arr.filter((x) => x !== val)
                : ([...arr, val] as unknown as FilterState[typeof key]),
        );
    };

    const handleShowNewTaskModal = () => {
        setShowNewTaskModal(!showNewTaskModal);
    };

    const activeFilterCount =
        filter.status.length +
        filter.priority.length +
        filter.category.length +
        (filter.overdue ? 1 : 0);

    const clearFilters = () => setFilter(DEFAULT_FILTER);

    const stats = useMemo(
        () => ({
            total: tasks.length,
            inProgress: tasks.filter((t) => t.status === "in_progress").length,
            done: tasks.filter((t) => t.status === "done").length,
            overdue: tasks.filter((t) => isOverdue(t.dueDate, t.status)).length,
        }),
        [tasks],
    );

    return (
        <>
            <div className="flex min-h-0 flex-1 flex-col">
                <header className="flex flex-wrap items-center gap-3 border-b bg-white px-8 py-4">
                    <div className="relative flex items-center">
                        <Search className="absolute left-2.5 size-3.5 text-gray-400" />
                        <Input
                            value={filter.search}
                            onChange={(e) => setF("search", e.target.value)}
                            placeholder="Search tasks…"
                            className="pl-8 pr-6 text-xs placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                        />
                        {filter.search && (
                            <button
                                onClick={() => setF("search", "")}
                                className="absolute right-2"
                            >
                                <X className="size-3 text-gray-400" />
                            </button>
                        )}
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    "h-9 gap-1.5 text-xs",
                                    filter.status.length
                                        ? "border-bright-blue bg-blue-50 text-blue-600"
                                        : "text-gray-500",
                                )}
                            >
                                <Filter className="size-3" />
                                Status{" "}
                                {filter.status.length > 0 &&
                                    `(${filter.status.length})`}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-44">
                            <DropdownMenuLabel className="text-xs">
                                Filter by status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {(Object.keys(STATUS_CONFIG) as Status[]).map(
                                (s) => (
                                    <DropdownMenuCheckboxItem
                                        key={s}
                                        checked={filter.status.includes(s)}
                                        onCheckedChange={() =>
                                            toggleArrFilter("status", s)
                                        }
                                        className="text-xs"
                                    >
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs font-semibold",
                                                STATUS_CONFIG[s].pill,
                                            )}
                                        >
                                            {STATUS_CONFIG[s].label}
                                        </span>
                                    </DropdownMenuCheckboxItem>
                                ),
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    "h-9 gap-1.5 text-xs",
                                    filter.priority.length
                                        ? "border-bright-blue bg-blue-50 text-blue-600"
                                        : "text-gray-500",
                                )}
                            >
                                <SlidersHorizontal className="size-3" />
                                Priority{" "}
                                {filter.priority.length > 0 &&
                                    `(${filter.priority.length})`}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-40">
                            <DropdownMenuLabel className="text-xs">
                                Filter by priority
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(
                                (p) => (
                                    <DropdownMenuCheckboxItem
                                        key={p}
                                        checked={filter.priority.includes(p)}
                                        onCheckedChange={() =>
                                            toggleArrFilter("priority", p)
                                        }
                                        className="gap-2 text-xs"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    "size-2 rounded-full",
                                                    PRIORITY_CONFIG[p].dot,
                                                )}
                                            />
                                            {PRIORITY_CONFIG[p].label}
                                        </span>
                                    </DropdownMenuCheckboxItem>
                                ),
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    "h-9 gap-1.5 text-xs",
                                    filter.category.length
                                        ? "border-bright-blue bg-blue-50 text-blue-600"
                                        : "text-gray-500",
                                )}
                            >
                                <Filter className="size-3" />
                                Category{" "}
                                {filter.category.length > 0 &&
                                    `(${filter.category.length})`}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48">
                            <DropdownMenuLabel className="text-xs">
                                Filter by category
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {ALL_CATEGORIES.map((cat) => (
                                <DropdownMenuCheckboxItem
                                    key={cat}
                                    checked={filter.category.includes(cat)}
                                    onCheckedChange={() =>
                                        toggleArrFilter("category", cat)
                                    }
                                    className="text-xs"
                                >
                                    {cat}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setF("overdue", !filter.overdue)}
                        className={cn(
                            "h-9 gap-1.5 text-xs",
                            filter.overdue
                                ? "border-rose-300 bg-rose-50 text-rose-600"
                                : "text-gray-500",
                        )}
                    >
                        <Flame className="size-3" /> Overdue
                    </Button>
                    {activeFilterCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 text-xs font-medium text-bright-blue hover:text-blue-600"
                        >
                            <X className="size-3" /> Clear {activeFilterCount}{" "}
                            filter{activeFilterCount > 1 ? "s" : ""}
                        </button>
                    )}
                    <div className="ml-auto flex items-center justify-end gap-3">
                        <div className="hidden items-center gap-1 md:flex">
                            {[
                                {
                                    label: "Total",
                                    val: stats.total,
                                    col: "text-gray-600",
                                },
                                {
                                    label: "In Progress",
                                    val: stats.inProgress,
                                    col: "text-blue-600",
                                },
                                {
                                    label: "Done",
                                    val: stats.done,
                                    col: "text-emerald-600",
                                },
                                {
                                    label: "Overdue",
                                    val: stats.overdue,
                                    col: "text-rose-600",
                                },
                            ].map((s, i) => (
                                <div
                                    key={s.label}
                                    className="flex items-center gap-2"
                                >
                                    {i > 0 && (
                                        <div className="h-3 w-px bg-gray-200" />
                                    )}
                                    <span className="text-xs text-gray-400">
                                        {s.label}
                                    </span>
                                    <span
                                        className={cn(
                                            "text-xs font-bold",
                                            s.col,
                                        )}
                                    >
                                        {s.val}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <Button
                            className="gap-1.5 bg-bright-blue px-3 text-xs hover:bg-blue-600"
                            onClick={handleShowNewTaskModal}
                        >
                            <Plus className="size-3.5" /> New Task
                        </Button>
                    </div>
                </header>
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-1.5 border-b bg-white px-8 py-2">
                        {filter.status.map((s) => (
                            <FilterChip
                                key={s}
                                label={STATUS_CONFIG[s].label}
                                onRemove={() => toggleArrFilter("status", s)}
                            />
                        ))}
                        {filter.priority.map((p) => (
                            <FilterChip
                                key={p}
                                label={PRIORITY_CONFIG[p].label}
                                onRemove={() => toggleArrFilter("priority", p)}
                            />
                        ))}
                        {filter.category.map((c) => (
                            <FilterChip
                                key={c}
                                label={c}
                                onRemove={() => toggleArrFilter("category", c)}
                            />
                        ))}
                        {filter.overdue && (
                            <FilterChip
                                label="Overdue"
                                onRemove={() => setF("overdue", false)}
                            />
                        )}
                    </div>
                )}
                {checked.size > 0 && (
                    <div className="flex items-center gap-4 bg-bright-blue px-8 py-2 text-white">
                        <span className="text-sm font-semibold">
                            {checked.size} selected
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={bulkMarkDone}
                            className="h-9 gap-1.5 text-xs text-white hover:bg-white/20 hover:text-white"
                        >
                            <CheckCheck className="size-3.5" /> Mark done
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={bulkMarkUndone}
                            className="h-9 gap-1.5 text-xs text-white hover:bg-white/20 hover:text-white"
                        >
                            <X className="size-3.5" /> Mark undone
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-9 gap-1.5 text-xs text-white hover:bg-white/20 hover:text-white"
                                >
                                    <Trash2 className="size-3.5" /> Delete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Delete {checked.size} tasks?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete{" "}
                                        {checked.size} selected tasks.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={bulkDelete}
                                        className="bg-rose-600 hover:bg-rose-700"
                                    >
                                        Delete all
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <button
                            onClick={() => setChecked(new Set())}
                            className="ml-auto transition-opacity hover:opacity-70"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                )}
                <div className="flex-1 overflow-auto bg-white">
                    <table className="w-full min-w-[960px]">
                        <thead className="sticky top-0 z-10 border-b bg-gray-50">
                            <tr>
                                <th className="w-10 py-2.5 pl-8 pr-2">
                                    <Checkbox
                                        checked={allChecked}
                                        ref={(el) => {
                                            if (el)
                                                el.dataset.indeterminate =
                                                    someChecked
                                                        ? "true"
                                                        : "false";
                                        }}
                                        onCheckedChange={toggleAll}
                                        className="data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                                    />
                                </th>
                                <th className="w-24 py-2.5 pr-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                                    ID
                                </th>
                                <TH
                                    label="Title"
                                    field="title"
                                    className="min-w-[240px]"
                                    sortField={sortField}
                                    sortDir={sortDir}
                                    onSort={toggleSort}
                                />
                                <TH
                                    label="Category"
                                    field="category"
                                    className="w-36"
                                    sortField={sortField}
                                    sortDir={sortDir}
                                    onSort={toggleSort}
                                />
                                <TH
                                    label="Status"
                                    field="status"
                                    className="w-36"
                                    sortField={sortField}
                                    sortDir={sortDir}
                                    onSort={toggleSort}
                                />
                                <TH
                                    label="Priority"
                                    field="priority"
                                    className="w-28"
                                    sortField={sortField}
                                    sortDir={sortDir}
                                    onSort={toggleSort}
                                />
                                <TH
                                    label="Due"
                                    field="dueDate"
                                    className="w-28"
                                    sortField={sortField}
                                    sortDir={sortDir}
                                    onSort={toggleSort}
                                />
                                <TH
                                    label="Progress"
                                    field="progress"
                                    className="w-24"
                                    sortField={sortField}
                                    sortDir={sortDir}
                                    onSort={toggleSort}
                                />
                                <TH
                                    label="Assignees"
                                    field="assignees"
                                    className="w-28"
                                    sortField={sortField}
                                    sortDir={sortDir}
                                    onSort={toggleSort}
                                />
                                <th className="w-24 py-2.5 pr-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                                    Activity
                                </th>
                                <th className="w-10 py-2.5 pr-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={11}
                                        className="py-20 text-center text-gray-400"
                                    >
                                        <LayoutList className="mx-auto mb-3 size-10 opacity-30" />
                                        <p className="text-sm font-semibold">
                                            No tasks found
                                        </p>
                                        <p className="mt-1 text-xs">
                                            Try adjusting your filters
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                (Object.keys(STATUS_CONFIG) as Status[]).map(
                                    (status) => {
                                        const groupTasks = filtered.filter(
                                            (t) => t.status === status,
                                        );
                                        if (groupTasks.length === 0)
                                            return null;
                                        const cfg = STATUS_CONFIG[status];
                                        const collapsed =
                                            collapsedGroups.has(status);
                                        return (
                                            <React.Fragment key={status}>
                                                <tr
                                                    className="cursor-pointer border-b border-t bg-gray-50/80 hover:bg-gray-100/60"
                                                    onClick={() =>
                                                        setCollapsedGroups(
                                                            (prev) => {
                                                                const next =
                                                                    new Set(
                                                                        prev,
                                                                    );

                                                                if (
                                                                    next.has(
                                                                        status,
                                                                    )
                                                                ) {
                                                                    next.delete(
                                                                        status,
                                                                    );
                                                                } else {
                                                                    next.add(
                                                                        status,
                                                                    );
                                                                }

                                                                return next;
                                                            },
                                                        )
                                                    }
                                                >
                                                    <td
                                                        colSpan={11}
                                                        className="py-2 pl-5 pr-8"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="text-gray-400 transition-transform">
                                                                {collapsed ? (
                                                                    <ChevronRight className="size-3.5" />
                                                                ) : (
                                                                    <ChevronDown className="size-3.5" />
                                                                )}
                                                            </span>
                                                            <span
                                                                className={cn(
                                                                    "size-2 rounded-full",
                                                                    cfg.dot,
                                                                )}
                                                            />
                                                            <span className="text-xs font-semibold text-gray-600">
                                                                {cfg.label}
                                                            </span>
                                                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-[11px] font-bold text-gray-600">
                                                                {
                                                                    groupTasks.length
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {!collapsed &&
                                                    groupTasks.map((task) => (
                                                        <TaskRow
                                                            key={task.id}
                                                            task={task}
                                                            selected={
                                                                selectedTaskId ===
                                                                task.id
                                                            }
                                                            checked={checked.has(
                                                                task.id,
                                                            )}
                                                            onCheck={
                                                                toggleCheck
                                                            }
                                                            onUpdate={
                                                                updateTask
                                                            }
                                                            onDelete={
                                                                deleteTask
                                                            }
                                                            allMembers={MEMBERS}
                                                        />
                                                    ))}
                                            </React.Fragment>
                                        );
                                    },
                                )
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex shrink-0 items-center justify-between border-t bg-gray-50 px-5 py-2">
                    <div className="flex items-center gap-4">
                        {(Object.keys(STATUS_CONFIG) as Status[]).map((s) => {
                            const count = tasks.filter(
                                (t) => t.status === s,
                            ).length;
                            if (!count) return null;
                            return (
                                <span
                                    key={s}
                                    className="flex items-center gap-1.5 text-xs text-gray-500"
                                >
                                    <span
                                        className={cn(
                                            "size-1.5 rounded-full",
                                            STATUS_CONFIG[s].dot,
                                        )}
                                    />
                                    {STATUS_CONFIG[s].label}
                                    <span className="font-semibold text-gray-700">
                                        {count}
                                    </span>
                                </span>
                            );
                        })}
                    </div>
                    <span className="text-xs text-gray-500">
                        {tasks.filter((t) => t.completed).length}/{tasks.length}{" "}
                        completed
                    </span>
                </div>
            </div>
            <CreateTaskModal
                open={showNewTaskModal}
                onOpenChange={handleShowNewTaskModal}
            />
        </>
    );
}
