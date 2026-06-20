"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";
import SortIcon from "@/components/ui/sortIcon/SortIcon";
import { Column, SortDir, SortField, Task } from "@/types/types";
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
}: Readonly<{
    label: string;
    field: SortField;
    className?: string;
    sortField: SortField;
    sortDir: SortDir;
    onSort: (f: SortField) => void;
    Icon?: Icon;
}>) {
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
    columns: Column[];
    setColumns: Dispatch<SetStateAction<Column[]>>;
    onOpenDetails: (task: Task) => void;
}

export function ProjectListView({
    columns,
    setColumns,
    onOpenDetails,
}: Readonly<ProjectListViewProps>) {
    const [sortField, setSortField] = useState<SortField>("priority");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
        new Set(),
    );

    const deleteTask = useCallback(
        (taskId: number) => {
            setColumns((prev) =>
                prev.map((col) => ({
                    ...col,
                    tasks: col.tasks.filter((t) => t.id !== taskId),
                })),
            );
            if (selectedTaskId === taskId) setSelectedTaskId(null);
        },
        [selectedTaskId, setColumns],
    );

    const toggleSort = (field: SortField) => {
        if (sortField === field)
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    return (
        <>
            <div className="flex h-full min-h-0 flex-1 flex-col">
                <div className="mx-8 mb-3 flex-1 space-y-5 overflow-auto bg-white">
                    {columns.map((column) => {
                        if (column.tasks.length === 0) return null;
                        const collapsed = collapsedGroups.has(column.name);

                        return (
                            <div key={column.id}>
                                <div
                                    className="mt-3 cursor-pointer rounded-md bg-gray-50 transition-colors hover:bg-gray-100"
                                    onClick={() =>
                                        setCollapsedGroups((prev) => {
                                            const next = new Set(prev);

                                            if (next.has(column.name)) {
                                                next.delete(column.name);
                                            } else {
                                                next.add(column.name);
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
                                                {column.name}
                                            </span>
                                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-[11px] font-bold text-gray-600">
                                                {column.tasks.length}
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
                                                    label="Members"
                                                    field="members"
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
                                            {column.tasks.map((task) => (
                                                <ProjectTaskRow
                                                    key={task.id}
                                                    task={task}
                                                    column={column}
                                                    onDelete={deleteTask}
                                                    onOpenDetails={
                                                        onOpenDetails
                                                    }
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="sticky bottom-0 flex shrink-0 items-center justify-between border-t bg-gray-50 px-8 py-2">
                    <div className="flex items-center gap-1">
                        {columns.map((col) => {
                            if (col.tasks.length === 0) return null;

                            return (
                                <span
                                    key={col.id}
                                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-gray-500"
                                >
                                    {/* {COLUMNS_CONFIG[col.name].label} */}
                                    <span className="font-semibold text-black">
                                        {col.tasks.length}
                                    </span>
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
