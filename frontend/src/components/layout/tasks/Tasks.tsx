"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
} from "@/components/ui/shadcn/dropdown-menu";
import TaskDetailsSheet from "@/components/ui/taskDetailsSheet/TaskDetailsSheet";
import CreateTaskModal from "@/components/ui/createTaskModal/CreateTaskModal";
import FilterChip from "@/components/ui/filterChip/FilterChip";
import TaskRow from "@/components/ui/taskRow/TaskRow";
import {
    FilterOptions,
    Priority,
    Project,
    SortDirection,
    Task,
    TasksFilterState,
    TasksSortField,
    User,
} from "@/types/types";
import { PRIORITY_CONFIG } from "@/constants/constants";
import { cn, isOverdue } from "@/libs/utils";
import {
    CalendarBlankIcon,
    ChartLineIcon,
    FireIcon,
    FlagIcon,
    FunnelIcon,
    HashIcon,
    LayoutIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    PulseIcon,
    SealIcon,
    TextTIcon,
    UsersIcon,
    XIcon,
} from "@phosphor-icons/react";
import { getProjectData } from "@/data/loaders";
import TasksTh from "@/components/ui/tasksTh/TasksTh";
import { deleteTaskAction } from "@/data/actions";
import { toast } from "sonner";
import { TASKS_DEFAULT_FILTER } from "@/constants/tasks";
import { applyTasksFilter, countActiveFilters, sortTasks } from "@/libs/tasks";
import { useDebounce } from "use-debounce";

interface TasksProps {
    tasksData: Task[];
    taskFilterOptionsData: FilterOptions;
    userData: User;
}

export default function Tasks({
    tasksData,
    taskFilterOptionsData,
    userData,
}: Readonly<TasksProps>) {
    const [filter, setFilter] =
        useState<TasksFilterState>(TASKS_DEFAULT_FILTER);
    const [sortField, setSortField] = useState<TasksSortField>("priority");
    const [sortDir, setSortDir] = useState<SortDirection>("asc");
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);
    const [showTaskDetailsSheet, setShowTaskDetailsSheet] =
        useState<boolean>(false);

    useEffect(() => {
        if (!selectedTask) {
            return;
        }

        (async () => {
            const project = await getProjectData(selectedTask.project.slug);

            setProjectData(project);
        })();
    }, [selectedTask]);

    const deleteTask = useCallback(
        async (id: number) => {
            const result = await deleteTaskAction(id, "/tasks");

            if (!result || !result.ok) {
                toast.error("Error", {
                    description: "Something went wrong",
                });
            }

            if (result && result.ok) {
                toast.success("Success", {
                    description: `Task has been deleted`,
                });
            }

            if (result && !result.ok) {
                toast.error("Error", {
                    description: result.message,
                });
            }

            if (selectedTask && selectedTask.id === id) {
                setSelectedTask(null);
            }
        },
        [selectedTask],
    );

    const toggleSort = (field: TasksSortField) => {
        if (sortField === field) {
            setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const setF = <K extends keyof TasksFilterState>(
        key: K,
        val: TasksFilterState[K],
    ) => setFilter((f) => ({ ...f, [key]: val }));

    const toggleStrFilter = (
        key: "columns" | "priorities" | "projects",
        val: string,
    ) => {
        const arr = filter[key] as string[];
        setF(
            key,
            (arr.includes(val)
                ? arr.filter((x) => x !== val)
                : [...arr, val]) as TasksFilterState[typeof key],
        );
    };

    const handleShowNewTaskModal = () => {
        setShowNewTaskModal(!showNewTaskModal);
    };

    const handleShowTaskDetailsSheet = () => {
        setShowTaskDetailsSheet(!showTaskDetailsSheet);
    };

    const [debouncedSearch] = useDebounce(filter.search, 1000);

    const filteredTasks = useMemo(
        () =>
            sortTasks(
                applyTasksFilter(tasksData, {
                    ...filter,
                    search: debouncedSearch,
                }),
                sortField,
                sortDir,
            ),
        [tasksData, filter, debouncedSearch, sortField, sortDir],
    );

    const activeFilterCount = useMemo(
        () => countActiveFilters(filter),
        [filter],
    );

    const clearFilters = () => setFilter(TASKS_DEFAULT_FILTER);

    const stats = useMemo(
        () => ({
            total: tasksData.length,
            inProgress: tasksData.filter(
                (task) => task.column.name === "in_progress",
            ).length,
            done: tasksData.filter((task) => task.column.name === "done")
                .length,
            overdue: tasksData.filter((task) =>
                isOverdue(task.due_date ?? undefined, task.column.name),
            ).length,
        }),
        [tasksData],
    );

    return (
        <>
            <div className="h-full overflow-y-auto rounded-xl bg-background-secondary">
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="sticky top-0 z-10">
                        <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-border bg-background-secondary px-8 py-4">
                            <h1 className="mr-12 text-xl font-semibold">
                                Tasks
                            </h1>
                            <div className="relative flex items-center">
                                <MagnifyingGlassIcon
                                    weight="duotone"
                                    className="absolute left-2.5 size-3.5 text-control-text"
                                />
                                <Input
                                    value={filter.search}
                                    onChange={(e) =>
                                        setF("search", e.target.value)
                                    }
                                    placeholder="Search tasks…"
                                    className="bg-control pl-8 pr-6 text-xs placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
                                />
                                {filter.search && (
                                    <button
                                        onClick={() => setF("search", "")}
                                        className="absolute right-2"
                                    >
                                        <XIcon
                                            weight="duotone"
                                            className="size-3 text-control-text"
                                        />
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
                                                ? "border-bright-blue bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                                                : "bg-control text-control-text hover:bg-control-active",
                                        )}
                                    >
                                        <FunnelIcon
                                            weight="duotone"
                                            className="size-3"
                                        />
                                        Status{" "}
                                        {filter.columns.length > 0 &&
                                            ` (${filter.columns.length})`}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-44 border-border bg-background-secondary">
                                    <DropdownMenuLabel className="text-xs">
                                        Filter by column
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {taskFilterOptionsData.statuses.map(
                                        (status) => (
                                            <DropdownMenuCheckboxItem
                                                key={status.id}
                                                checked={filter.columns.includes(
                                                    status.name,
                                                )}
                                                onCheckedChange={() =>
                                                    toggleStrFilter(
                                                        "columns",
                                                        status.name,
                                                    )
                                                }
                                                className="text-xs hover:!bg-control-active"
                                            >
                                                <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-1.5 py-0.5 text-xs">
                                                    {status.name}
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
                                                ? "border-bright-blue bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                                                : "bg-control text-control-text hover:bg-control-active",
                                        )}
                                    >
                                        <FlagIcon
                                            weight="duotone"
                                            className="size-3"
                                        />
                                        Priority{" "}
                                        {filter.priorities.length > 0 &&
                                            ` (${filter.priorities.length})`}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-40 border-border bg-background-secondary">
                                    <DropdownMenuLabel className="text-xs">
                                        Filter by priority
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {(
                                        Object.keys(
                                            PRIORITY_CONFIG,
                                        ) as Priority[]
                                    ).map((priority) => (
                                        <DropdownMenuCheckboxItem
                                            key={priority}
                                            checked={filter.priorities.includes(
                                                priority,
                                            )}
                                            onCheckedChange={() =>
                                                toggleStrFilter(
                                                    "priorities",
                                                    priority,
                                                )
                                            }
                                            className="gap-2 text-xs"
                                        >
                                            <span
                                                className="flex items-center gap-2 rounded-md px-2.5 py-1 text-white"
                                                style={{
                                                    backgroundColor:
                                                        PRIORITY_CONFIG[
                                                            priority
                                                        ].color,
                                                }}
                                            >
                                                {
                                                    PRIORITY_CONFIG[priority]
                                                        .label
                                                }
                                            </span>
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                {filter.projects && (
                                    <>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className={cn(
                                                    "h-9 gap-1.5 text-xs",
                                                    filter.projects.length
                                                        ? "border-bright-blue bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                                                        : "bg-control text-control-text hover:bg-control-active",
                                                )}
                                            >
                                                <LayoutIcon
                                                    weight="duotone"
                                                    className="size-3"
                                                />
                                                Project{" "}
                                                {filter.projects.length > 0 &&
                                                    ` (${filter.projects.length})`}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-48 border-border bg-background-secondary">
                                            <DropdownMenuLabel className="text-xs">
                                                Filter by project
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {taskFilterOptionsData.projects.map(
                                                (project) => (
                                                    <DropdownMenuCheckboxItem
                                                        key={project.id}
                                                        checked={filter.projects.includes(
                                                            project.name,
                                                        )}
                                                        onCheckedChange={() =>
                                                            toggleStrFilter(
                                                                "projects",
                                                                project.name,
                                                            )
                                                        }
                                                        className="gap-2 text-xs"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <span
                                                                className="size-2 rounded-full"
                                                                style={{
                                                                    background:
                                                                        project.color,
                                                                }}
                                                            />
                                                            {project.name}
                                                        </span>
                                                    </DropdownMenuCheckboxItem>
                                                ),
                                            )}
                                        </DropdownMenuContent>
                                    </>
                                )}
                            </DropdownMenu>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setF("overdue", !filter.overdue)}
                                className={cn(
                                    "h-9 gap-1.5 text-xs",
                                    filter.overdue
                                        ? "border-rose-300 bg-rose-50 text-rose-600 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-400"
                                        : "bg-control text-control-text hover:bg-control-active",
                                )}
                            >
                                <FireIcon weight="duotone" className="size-3" />{" "}
                                Overdue
                            </Button>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 text-xs font-medium text-bright-blue hover:text-blue-600"
                                >
                                    <XIcon
                                        weight="duotone"
                                        className="size-3"
                                    />{" "}
                                    Clear {activeFilterCount} filter
                                    {activeFilterCount > 1 ? "s" : ""}
                                </button>
                            )}
                            <div className="ml-auto flex items-center justify-end gap-3">
                                <div className="hidden items-center gap-1.5 md:flex">
                                    {[
                                        {
                                            label: "Total",
                                            value: stats.total,
                                            style: "text-gray-600 dark:text-gray-400",
                                        },
                                        {
                                            label: "In Progress",
                                            value: stats.inProgress,
                                            style: "text-blue-600 dark:text-blue-400",
                                        },
                                        {
                                            label: "Done",
                                            value: stats.done,
                                            style: "text-emerald-600 dark:text-emerald-400",
                                        },
                                        {
                                            label: "Overdue",
                                            value: stats.overdue,
                                            style: "text-rose-600 dark:text-rose-400",
                                        },
                                    ].map((status, i) => (
                                        <div
                                            key={status.label}
                                            className={cn(
                                                "flex items-center gap-1.5 pr-1.5",
                                                i !== 3 &&
                                                    "border-r border-border",
                                            )}
                                        >
                                            <span className="text-xs text-muted-foreground">
                                                {status.label}
                                            </span>
                                            <span
                                                className={cn(
                                                    "text-xs font-bold",
                                                    status.style,
                                                )}
                                            >
                                                {status.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    className="gap-1.5 bg-bright-blue px-3 text-xs text-white hover:bg-blue-600"
                                    onClick={handleShowNewTaskModal}
                                >
                                    <PlusIcon
                                        weight="duotone"
                                        className="size-3.5"
                                    />{" "}
                                    New Task
                                </Button>
                            </div>
                        </header>
                        {activeFilterCount > 0 && (
                            <div className="flex flex-wrap gap-1.5 border-b border-border px-8 py-2">
                                {filter.columns.map((column) => (
                                    <FilterChip
                                        key={column}
                                        label={column}
                                        onRemove={() =>
                                            toggleStrFilter("columns", column)
                                        }
                                    />
                                ))}
                                {filter.priorities.map((priority) => (
                                    <FilterChip
                                        key={priority}
                                        label={PRIORITY_CONFIG[priority].label}
                                        onRemove={() =>
                                            toggleStrFilter(
                                                "priorities",
                                                priority,
                                            )
                                        }
                                    />
                                ))}
                                {filter.projects.map((name) => (
                                    <FilterChip
                                        key={name}
                                        label={name}
                                        onRemove={() =>
                                            toggleStrFilter("projects", name)
                                        }
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
                    </div>
                    <table className="w-full min-w-[960px] bg-column">
                        <thead
                            className={cn(
                                "sticky z-10 bg-column shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[inset_0_-1px_0_0_hsl(0_0%_14.9%)]",
                                activeFilterCount > 0 ? "top-28" : "top-[69px]",
                            )}
                        >
                            <tr>
                                <th className="flex w-24 items-center gap-1 py-2.5 pl-4 pr-4 text-left text-sm font-normal tracking-wider text-muted-foreground">
                                    <HashIcon
                                        weight="duotone"
                                        className="size-4"
                                    />
                                    ID
                                </th>
                                <TasksTh
                                    label="Title"
                                    field="title"
                                    className="min-w-[240px]"
                                    sortField={sortField}
                                    sortDir={sortDir}
                                    onSort={toggleSort}
                                    Icon={TextTIcon}
                                />
                                <TasksTh
                                    label="Status"
                                    field="status"
                                    className="w-36"
                                    sortField={sortField}
                                    sortDir={sortDir}
                                    onSort={toggleSort}
                                    Icon={SealIcon}
                                />
                                <TasksTh
                                    label="Priority"
                                    field="priority"
                                    className="w-28"
                                    sortField={sortField}
                                    sortDir={sortDir}
                                    onSort={toggleSort}
                                    Icon={FlagIcon}
                                />
                                <TasksTh
                                    label="Project"
                                    field="project"
                                    className="w-40"
                                    sortField={sortField}
                                    sortDir={sortDir}
                                    onSort={toggleSort}
                                    Icon={LayoutIcon}
                                />
                                <TasksTh
                                    label="Members"
                                    field="members"
                                    className="w-28"
                                    sortField={sortField}
                                    sortDir={sortDir}
                                    onSort={toggleSort}
                                    Icon={UsersIcon}
                                />
                                <TasksTh
                                    label="Due"
                                    field="dueDate"
                                    className="w-28"
                                    sortField={sortField}
                                    sortDir={sortDir}
                                    onSort={toggleSort}
                                    Icon={CalendarBlankIcon}
                                />
                                <th className="w-24 py-2.5 pr-4 text-left text-sm font-normal tracking-wider text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <ChartLineIcon
                                            weight="duotone"
                                            className="size-4"
                                        />
                                        Progress
                                    </div>
                                </th>
                                <th className="w-24 py-2.5 pr-4 text-left text-sm font-normal tracking-wider text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <PulseIcon
                                            weight="duotone"
                                            className="size-4"
                                        />
                                        Activity
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-background-secondary">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => (
                                    <TaskRow
                                        key={task.id}
                                        task={task}
                                        userData={userData}
                                        onDelete={deleteTask}
                                        onOpenDetails={() => {
                                            setSelectedTask(task);
                                            setShowTaskDetailsSheet(true);
                                        }}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="py-16 text-center text-sm text-muted-foreground"
                                    >
                                        No tasks match the current filters
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
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
                    currentPath="/tasks"
                />
            )}
            <CreateTaskModal
                open={showNewTaskModal}
                onOpenChange={handleShowNewTaskModal}
                showProjectSelect
                currentPath="/tasks"
            />
        </>
    );
}
