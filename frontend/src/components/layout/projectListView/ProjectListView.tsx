"use client";

import { useState, useMemo, useCallback, Fragment } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
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
    CheckCheck,
    ChevronRight,
    ChevronDown,
    Filter,
    Flame,
    Plus,
    Search,
    SlidersHorizontal,
    Trash2,
    X,
} from "lucide-react";
import { cn, isOverdue } from "@/libs/utils";
import { CreateTaskModal } from "@/components/ui/createTaskModal/CreateTaskModal";
import SortIcon from "@/components/ui/sortIcon/SortIcon";
import {
    Columns,
    FilterState,
    Priority,
    SortDir,
    SortField,
    Task,
} from "@/types/types";
import {
    COLUMNS_CONFIG,
    DEFAULT_FILTER,
    INITIAL_TASKS,
    MOCK_CATEGORIES,
    PRIORITY_CONFIG,
} from "@/constants/constants";
import ProjectTaskRow from "@/components/ui/projectTaskRow/ProjectTaskRow";

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

interface ProjectListViewProps {
    initialTasks?: Task[];
}

export function ProjectListView({
    initialTasks = INITIAL_TASKS,
}: ProjectListViewProps) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
    const [sortField, setSortField] = useState<SortField>("priority");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [checked, setChecked] = useState<Set<number>>(new Set());
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
        new Set(),
    );
    const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);

    // const filtered = useMemo(() => {
    //     let list = [...tasks];

    //     if (filter.search) {
    //         const q = filter.search.toLowerCase();
    //         list = list.filter(
    //             (t) =>
    //                 t.title.toLowerCase().includes(q) ||
    //                 t.id.toString().includes(q) ||
    //                 t.categories.some((category) => category.name === q) ||
    //                 t.labels.some((l) => l.toLowerCase().includes(q)),
    //         );
    //     }
    //     if (filter.status.length)
    //         list = list.filter((t) => filter.status.includes(t.status));
    //     if (filter.priority.length)
    //         list = list.filter((t) => filter.priority.includes(t.priority));
    //     // if (filter.category && filter.category.length)
    //     //     list = list.filter(
    //     //         (t) => t.categories && t.categories.some(cat => filter.category!.includes(cat.name)),
    //     //     );
    //     if (filter.overdue)
    //         list = list.filter((t) => isOverdue(t.due_date, t.status));

    //     list.sort((a, b) => {
    //         if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

    //         let av: number | string = 0;
    //         let bv: number | string = 0;

    //         switch (sortField) {
    //             case "priority":
    //                 av = PRIORITY_CONFIG[a.priority].order;
    //                 bv = PRIORITY_CONFIG[b.priority].order;
    //                 break;
    //             case "status":
    //                 av = STATUS_CONFIG[a.status].order;
    //                 bv = STATUS_CONFIG[b.status].order;
    //                 break;
    //             case "dueDate":
    //                 av = a.due_date.getTime() ?? 0;
    //                 bv = b.due_date.getTime() ?? 0;
    //                 break;
    //             case "progress":
    //                 av = a.progress;
    //                 bv = b.progress;
    //                 break;
    //             case "assignees":
    //                 av = a.assignees.length;
    //                 bv = b.assignees.length;
    //                 break;
    //             case "category":
    //                 av = a.category ?? "";
    //                 bv = b.category ?? "";
    //                 break;
    //             default:
    //                 av = a.title;
    //                 bv = b.title;
    //         }

    //         if (av < bv) return sortDir === "asc" ? -1 : 1;
    //         if (av > bv) return sortDir === "asc" ? 1 : -1;
    //         return 0;
    //     });

    //     return list;
    // }, [tasks, filter, sortField, sortDir]);

    // const updateTask = useCallback((id: number, patch: Partial<Task>) => {
    //     setTasks((prev) =>
    //         prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    //     );
    // }, []);

    const deleteTask = useCallback(
        (id: number) => {
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

    // const allChecked =
    //     filtered.length > 0 && filtered.every((t) => checked.has(t.id));
    // const someChecked = !allChecked && filtered.some((t) => checked.has(t.id));

    // const toggleAll = () => {
    //     if (allChecked) setChecked(new Set());
    //     else setChecked(new Set(filtered.map((t) => t.id)));
    // };

    // const toggleCheck = (id: number, v: boolean) => {
    //     setChecked((prev) => {
    //         const s = new Set(prev);

    //         if (v) {
    //             s.add(id);
    //         } else {
    //             s.delete(id);
    //         }

    //         return s;
    //     });
    // };

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
                          status: "done",
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
                    ? { ...t, status: "todo", completed: false }
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

    // const toggleArrFilter = <T extends string>(
    //     key: "status" | "priority" | "category",
    //     val: T,
    // ) => {
    //     const arr = filter[key] as T[];
    //     setF(
    //         key,
    //         arr.includes(val)
    //             ? arr.filter((x) => x !== val)
    //             : ([...arr, val] as FilterState[typeof key]),
    //     );
    // };

    const handleShowNewTaskModal = () => {
        setShowNewTaskModal(!showNewTaskModal);
    };

    // const activeFilterCount =
    //     filter.status.length +
    //     filter.priority.length +
    //     filter.category.length +
    //     (filter.overdue ? 1 : 0);

    // const clearFilters = () => setFilter(DEFAULT_FILTER);

    const stats = useMemo(
        () => ({
            total: tasks.length,
            inProgress: tasks.filter((t) => t.column === "in_progress").length,
            done: tasks.filter((t) => t.column === "done").length,
            overdue: tasks.filter((t) => isOverdue(t.due_date, t.column))
                .length,
        }),
        [tasks],
    );

    return (
        <>
            <div className="flex h-full min-h-0 flex-1 flex-col">
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
                                    filter.columns.length
                                        ? "border-bright-blue bg-blue-50 text-blue-600"
                                        : "text-gray-500",
                                )}
                            >
                                <Filter className="size-3" />
                                Status{" "}
                                {filter.columns.length > 0 &&
                                    `(${filter.columns.length})`}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-44">
                            <DropdownMenuLabel className="text-xs">
                                Filter by status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {(Object.keys(COLUMNS_CONFIG) as Columns[]).map(
                                (s) => (
                                    <DropdownMenuCheckboxItem
                                        key={s}
                                        checked={filter.columns.includes(s)}
                                        // onCheckedChange={() =>
                                        //     toggleArrFilter("status", s)
                                        // }
                                        className="text-xs"
                                    >
                                        <span
                                            className={cn(
                                                "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs font-semibold",
                                                COLUMNS_CONFIG[s].pill,
                                            )}
                                        >
                                            {COLUMNS_CONFIG[s].label}
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
                                    filter.priorities.length
                                        ? "border-bright-blue bg-blue-50 text-blue-600"
                                        : "text-gray-500",
                                )}
                            >
                                <SlidersHorizontal className="size-3" />
                                Priority{" "}
                                {filter.priorities.length > 0 &&
                                    `(${filter.priorities.length})`}
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
                                        checked={filter.priorities.includes(p)}
                                        // onCheckedChange={() =>
                                        //     toggleArrFilter("priority", p)
                                        // }
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
                                    "h-9 gap-1.5 text-xs text-gray-500",
                                    // filter.category.length
                                    //     ? "border-bright-blue bg-blue-50 text-blue-600"
                                    //     : "text-gray-500",
                                )}
                            >
                                <Filter className="size-3" />
                                Category{" "}
                                {/* {filter.category.length > 0 &&
                                    `(${filter.category.length})`} */}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48">
                            <DropdownMenuLabel className="text-xs">
                                Filter by category
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {Object.keys(MOCK_CATEGORIES).map((cat) => (
                                <DropdownMenuCheckboxItem
                                    key={cat}
                                    // checked={filter.category.includes(cat)}
                                    // onCheckedChange={() =>
                                    //     toggleArrFilter("category", cat)
                                    // }
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
                    {/* {activeFilterCount > 0 && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 text-xs font-medium text-bright-blue hover:text-blue-600"
                        >
                            <X className="size-3" /> Clear {activeFilterCount}{" "}
                            filter{activeFilterCount > 1 ? "s" : ""}
                        </button>
                    )} */}
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
                {/* {activeFilterCount > 0 && (
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
                )} */}
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
                                {/* <th className="w-10 py-2.5 pl-8 pr-2">
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
                                </th> */}
                                <th className="w-24 py-2.5 pl-8 pr-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
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
                            {/* {filtered.length === 0 ? (
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
                            )} */}
                            {(Object.keys(COLUMNS_CONFIG) as Columns[]).map(
                                (column) => {
                                    // const groupTasks = filtered.filter(
                                    //     (t) => t.column === column,
                                    // );
                                    const groupTasks = tasks.filter(
                                        (t) => t.column === column,
                                    );
                                    if (groupTasks.length === 0) return null;
                                    const cfg = COLUMNS_CONFIG[column];
                                    const collapsed =
                                        collapsedGroups.has(column);

                                    return (
                                        <Fragment key={column}>
                                            <tr
                                                className="cursor-pointer border-b border-t bg-gray-50/80 hover:bg-gray-100/60"
                                                onClick={() =>
                                                    setCollapsedGroups(
                                                        (prev) => {
                                                            const next =
                                                                new Set(prev);

                                                            if (
                                                                next.has(column)
                                                            ) {
                                                                next.delete(
                                                                    column,
                                                                );
                                                            } else {
                                                                next.add(
                                                                    column,
                                                                );
                                                            }

                                                            return next;
                                                        },
                                                    )
                                                }
                                            >
                                                <td
                                                    colSpan={11}
                                                    className="py-2 pl-8 pr-8"
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
                                                            {groupTasks.length}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                            {!collapsed &&
                                                groupTasks.map((task) => (
                                                    <ProjectTaskRow
                                                        key={task.id}
                                                        task={task}
                                                        onDelete={deleteTask}
                                                    />
                                                ))}
                                        </Fragment>
                                    );
                                },
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex shrink-0 items-center justify-between border-t bg-gray-50 px-8 py-2">
                    <div className="flex items-center gap-4">
                        {(Object.keys(COLUMNS_CONFIG) as Columns[]).map((s) => {
                            const count = tasks.filter(
                                (t) => t.column === s,
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
                                            COLUMNS_CONFIG[s].dot,
                                        )}
                                    />
                                    {COLUMNS_CONFIG[s].label}
                                    <span className="font-semibold text-gray-700">
                                        {count}
                                    </span>
                                </span>
                            );
                        })}
                    </div>
                    {/* <span className="text-xs text-gray-500">
                        {tasks.filter((t) => t.completed).length}/{tasks.length}{" "}
                        completed
                    </span> */}
                </div>
            </div>
            <CreateTaskModal
                open={showNewTaskModal}
                onOpenChange={handleShowNewTaskModal}
            />
        </>
    );
}
