"use client";

import { useState, useCallback } from "react";
import { CreateTaskModal } from "@/components/ui/createTaskModal/CreateTaskModal";
import SortIcon from "@/components/ui/sortIcon/SortIcon";
import { Columns, SortDir, SortField, Task } from "@/types/types";
import { COLUMNS_CONFIG, INITIAL_TASKS } from "@/constants/constants";
import ProjectTaskRow from "@/components/ui/projectTaskRow/ProjectTaskRow";
import {
    CalendarBlankIcon,
    CaretDownIcon,
    CaretRightIcon,
    ChartLineIcon,
    FlagIcon,
    HashIcon,
    Icon,
    PulseIcon,
    SealIcon,
    TagIcon,
    TextTIcon,
    UsersIcon,
} from "@phosphor-icons/react";

function TH({
    label,
    field,
    className = "",
    sortField,
    sortDir,
    onSort,
    Icon,
}: {
    label: string;
    field: SortField;
    className?: string;
    sortField: SortField;
    sortDir: SortDir;
    onSort: (f: SortField) => void;
    Icon?: Icon;
}) {
    return (
        <th
            className={`cursor-pointer select-none whitespace-nowrap py-2.5 pr-4 text-left text-sm font-normal tracking-wider text-gray-400 ${className}`}
            onClick={() => onSort(field)}
        >
            <span className="flex items-center gap-1 transition-colors hover:text-gray-600">
                {Icon && <Icon weight="duotone" className="size-4" />}
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
    const [sortField, setSortField] = useState<SortField>("priority");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
        new Set(),
    );
    const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);

    const deleteTask = useCallback(
        (id: number) => {
            setTasks((prev) => prev.filter((t) => t.id !== id));
            if (selectedTaskId === id) setSelectedTaskId(null);
        },
        [selectedTaskId],
    );

    const toggleSort = (field: SortField) => {
        if (sortField === field)
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const handleShowNewTaskModal = () => {
        setShowNewTaskModal(!showNewTaskModal);
    };

    return (
        <>
            <div className="flex h-full min-h-0 flex-1 flex-col">
                <div className="mx-8 mb-3 flex-1 space-y-5 overflow-auto bg-white">
                    {(Object.keys(COLUMNS_CONFIG) as Columns[]).map(
                        (column) => {
                            const groupTasks = tasks.filter(
                                (t) => t.column === column,
                            );
                            if (groupTasks.length === 0) return null;
                            const cfg = COLUMNS_CONFIG[column];
                            const collapsed = collapsedGroups.has(column);

                            return (
                                <div key={column}>
                                    <div
                                        className="mt-3 cursor-pointer rounded-md bg-gray-50 transition-colors hover:bg-gray-100"
                                        onClick={() =>
                                            setCollapsedGroups((prev) => {
                                                const next = new Set(prev);

                                                if (next.has(column)) {
                                                    next.delete(column);
                                                } else {
                                                    next.add(column);
                                                }

                                                return next;
                                            })
                                        }
                                    >
                                        <div className="px-4 py-2">
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-gray-400 transition-transform">
                                                    {collapsed ? (
                                                        <CaretRightIcon
                                                            weight="duotone"
                                                            className="size-3.5"
                                                        />
                                                    ) : (
                                                        <CaretDownIcon
                                                            weight="duotone"
                                                            className="size-3.5"
                                                        />
                                                    )}
                                                </span>
                                                <span className="text-xs font-semibold text-gray-600">
                                                    {cfg.label}
                                                </span>
                                                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-[11px] font-bold text-gray-600">
                                                    {groupTasks.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {!collapsed && (
                                        <table className="w-full min-w-[960px]">
                                            <thead className="shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.1)]">
                                                <tr>
                                                    <th className="flex w-24 items-center gap-1 py-2.5 pl-4 pr-4 text-left text-sm font-normal tracking-wider text-gray-400">
                                                        <HashIcon
                                                            weight="duotone"
                                                            className="size-4"
                                                        />
                                                        ID
                                                    </th>
                                                    <TH
                                                        label="Title"
                                                        field="title"
                                                        className="min-w-[240px]"
                                                        sortField={sortField}
                                                        sortDir={sortDir}
                                                        onSort={toggleSort}
                                                        Icon={TextTIcon}
                                                    />
                                                    <TH
                                                        label="Category"
                                                        field="category"
                                                        className="w-36"
                                                        sortField={sortField}
                                                        sortDir={sortDir}
                                                        onSort={toggleSort}
                                                        Icon={TagIcon}
                                                    />
                                                    <TH
                                                        label="Status"
                                                        field="status"
                                                        className="w-36"
                                                        sortField={sortField}
                                                        sortDir={sortDir}
                                                        onSort={toggleSort}
                                                        Icon={SealIcon}
                                                    />
                                                    <TH
                                                        label="Priority"
                                                        field="priority"
                                                        className="w-28"
                                                        sortField={sortField}
                                                        sortDir={sortDir}
                                                        onSort={toggleSort}
                                                        Icon={FlagIcon}
                                                    />
                                                    <TH
                                                        label="Due"
                                                        field="dueDate"
                                                        className="w-28"
                                                        sortField={sortField}
                                                        sortDir={sortDir}
                                                        onSort={toggleSort}
                                                        Icon={CalendarBlankIcon}
                                                    />
                                                    <TH
                                                        label="Progress"
                                                        field="progress"
                                                        className="w-24"
                                                        sortField={sortField}
                                                        sortDir={sortDir}
                                                        onSort={toggleSort}
                                                        Icon={ChartLineIcon}
                                                    />
                                                    <TH
                                                        label="Assignees"
                                                        field="assignees"
                                                        className="w-28"
                                                        sortField={sortField}
                                                        sortDir={sortDir}
                                                        onSort={toggleSort}
                                                        Icon={UsersIcon}
                                                    />
                                                    <th className="flex w-24 items-center gap-1 py-2.5 pr-4 text-left text-sm font-medium tracking-wider text-gray-400">
                                                        <PulseIcon
                                                            weight="duotone"
                                                            className="size-4"
                                                        />
                                                        Activity
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {groupTasks.map((task) => (
                                                    <ProjectTaskRow
                                                        key={task.id}
                                                        task={task}
                                                        onDelete={deleteTask}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            );
                        },
                    )}
                </div>
                <div className="sticky bottom-0 flex shrink-0 items-center justify-between border-t bg-gray-50 px-8 py-2">
                    <div className="flex items-center gap-1">
                        {(Object.keys(COLUMNS_CONFIG) as Columns[]).map((s) => {
                            const count = tasks.filter(
                                (t) => t.column === s,
                            ).length;
                            if (!count) return null;

                            return (
                                <span
                                    key={s}
                                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-gray-500"
                                >
                                    {COLUMNS_CONFIG[s].label}
                                    <span className="font-semibold text-black">
                                        {count}
                                    </span>
                                </span>
                            );
                        })}
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
