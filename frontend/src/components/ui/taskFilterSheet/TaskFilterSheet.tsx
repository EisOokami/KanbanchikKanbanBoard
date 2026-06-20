"use client";

import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/shadcn/sheet";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/shadcn/avatar";
import { Separator } from "@/components/ui/shadcn/separator";
import { Slider } from "@/components/ui/shadcn/slider";
import { Calendar } from "@/components/ui/shadcn/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/shadcn/popover";
import { format } from "date-fns";
import { countActive } from "@/libs/taskFilterSheet";
import FilterSection from "./filterSection/FilterSection";
import Chip from "./chip/Chip";
import { FilterState, Priority, Project, TaskSortField } from "@/types/types";
import { PRIORITY_CONFIG } from "@/constants/constants";
import { cn, getInitials } from "@/libs/utils";
import {
    ArrowCounterClockwiseIcon,
    ArrowDownIcon,
    ArrowsDownUpIcon,
    ArrowUpIcon,
    CalendarBlankIcon,
    CalendarIcon,
    ChartLineIcon,
    CheckSquareIcon,
    ColumnsIcon,
    MagnifyingGlassIcon,
    PaperclipIcon,
    TagIcon,
    UploadSimpleIcon,
    UsersIcon,
    XIcon,
} from "@phosphor-icons/react";
import { DEFAULT_FILTER, SORT_FIELDS } from "@/constants/taskFilterSheet";

interface TaskFilterSheetProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    projectData: Project;
    filters?: FilterState;
    onFiltersChange?: (f: FilterState) => void;
}

export function TaskFilterSheet({
    open,
    onOpenChange,
    projectData,
    filters: externalFilters,
    onFiltersChange,
}: Readonly<TaskFilterSheetProps>) {
    const [filters, setFilters] = useState<FilterState>(
        externalFilters ?? DEFAULT_FILTER,
    );
    const [memberSearch, setMemberSearch] = useState("");
    const [calOpen, setCalOpen] = useState(false);

    const update = (patch: Partial<FilterState>) => {
        const next = { ...filters, ...patch };
        setFilters(next);
        onFiltersChange?.(next);
    };

    const toggle = <
        T,
        K extends "priorities" | "columns" | "members" | "categories",
    >(
        key: K,
        value: T,
    ) => {
        const arr = filters[key] as T[];

        update({
            [key]: arr.includes(value)
                ? arr.filter((x) => x !== value)
                : [...arr, value],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
    };

    const handleSortField = (field: TaskSortField) => {
        if (filters.sortField !== field) {
            update({
                sortField: field,
                sortDirection: "asc",
            });

            return;
        }

        if (filters.sortDirection === "asc") {
            update({
                sortField: field,
                sortDirection: "desc",
            });

            return;
        }

        update({
            sortField: undefined,
            sortDirection: undefined,
        });
    };

    const reset = () => {
        setFilters(DEFAULT_FILTER);
        onFiltersChange?.(DEFAULT_FILTER);
    };

    const activeCount = countActive(filters);
    const filteredMembers = projectData.members.filter((member) =>
        member.name.toLowerCase().includes(memberSearch.toLowerCase()),
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex min-w-[620px] max-w-[100vw] flex-col gap-0 overflow-hidden border-l p-0 [&>button:first-of-type]:hidden"
            >
                <SheetHeader className="shrink-0 border-b px-5 py-3">
                    <div className="flex items-center justify-between">
                        <div className="grid">
                            <SheetTitle className="font-semibold">
                                Filter Tasks
                            </SheetTitle>
                            <p className="text-xs text-gray-500">
                                {activeCount > 0
                                    ? `${activeCount} filter${activeCount > 1 ? "s" : ""} active`
                                    : "No filters applied"}
                            </p>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
                        >
                            <XIcon weight="duotone" size={18} />
                        </button>
                    </div>
                </SheetHeader>
                <div className="grid flex-1 gap-2 overflow-y-auto px-5 py-2">
                    <div className="py-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Sort by
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {SORT_FIELDS.map(({ value, label }) => {
                                const active = filters.sortField === value;
                                return (
                                    <button
                                        key={value}
                                        onClick={() => handleSortField(value)}
                                        className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all ${
                                            active
                                                ? "border-bright-blue bg-bright-blue/10 text-bright-blue"
                                                : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300 hover:bg-gray-100"
                                        }`}
                                    >
                                        {active ? (
                                            filters.sortDirection === "asc" ? (
                                                <ArrowUpIcon
                                                    weight="bold"
                                                    size={11}
                                                />
                                            ) : (
                                                <ArrowDownIcon
                                                    weight="bold"
                                                    size={11}
                                                />
                                            )
                                        ) : (
                                            <ArrowsDownUpIcon
                                                weight="duotone"
                                                size={11}
                                            />
                                        )}
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <Separator />
                    <div className="py-3">
                        <div className="relative">
                            <MagnifyingGlassIcon
                                weight="duotone"
                                size={16}
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <Input
                                placeholder="Search tasks…"
                                value={filters.search}
                                onChange={(e) =>
                                    update({ search: e.target.value })
                                }
                                className="h-9 rounded-md pl-9 text-sm placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                            />
                            {filters.search && (
                                <button
                                    onClick={() => update({ search: "" })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    <XIcon weight="duotone" size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                    <Separator />
                    <FilterSection
                        title="Priority"
                        icon={<UploadSimpleIcon weight="duotone" size={16} />}
                        count={filters.priorities.length || undefined}
                    >
                        <div className="flex flex-wrap gap-2 pt-1">
                            {Object.values(PRIORITY_CONFIG).map((priority) => (
                                <Chip
                                    key={priority.label}
                                    active={filters.priorities.includes(
                                        priority.label.toLowerCase() as Priority,
                                    )}
                                    bgColor={priority.color ?? ""}
                                    textColor="#fff"
                                    onClick={() =>
                                        toggle("priorities", priority.label)
                                    }
                                >
                                    {priority.label}
                                </Chip>
                            ))}
                        </div>
                    </FilterSection>
                    <Separator />
                    <FilterSection
                        title="Column"
                        icon={<ColumnsIcon weight="duotone" size={16} />}
                        count={filters.columns.length || undefined}
                    >
                        <div className="space-y-1.5 pt-1">
                            {projectData.columns.map((column) => {
                                const active = filters.columns.includes(
                                    column.name,
                                );

                                return (
                                    <label
                                        key={column.id}
                                        className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-gray-50 ${active ? "border-bright-blue" : "border-transparent"}`}
                                    >
                                        <Checkbox
                                            checked={active}
                                            onCheckedChange={() =>
                                                toggle("columns", column.name)
                                            }
                                            className="rounded data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                                        />
                                        <div className="flex flex-1 items-center gap-2">
                                            <span
                                                className={cn(
                                                    "text-sm",
                                                    active
                                                        ? "text-bright-blue"
                                                        : "text-gray-500",
                                                )}
                                            >
                                                {column.name}
                                            </span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </FilterSection>
                    <Separator />
                    {filters.members && (
                        <>
                            <FilterSection
                                title="Members"
                                icon={<UsersIcon weight="duotone" size={16} />}
                                count={filters.members.length || undefined}
                            >
                                <div className="space-y-1 pt-1">
                                    <div className="relative mb-2">
                                        <MagnifyingGlassIcon
                                            weight="duotone"
                                            size={16}
                                            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                                        />
                                        <Input
                                            placeholder="Search…"
                                            value={memberSearch}
                                            onChange={(e) =>
                                                setMemberSearch(e.target.value)
                                            }
                                            className="h-8 rounded-md pl-8 text-xs placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                        />
                                    </div>
                                    {filteredMembers.map((member) => {
                                        const active = filters.members?.some(
                                            (filterMember) =>
                                                filterMember.id === member.id,
                                        );

                                        return (
                                            <label
                                                key={member.id}
                                                className={`flex cursor-pointer items-center gap-3 rounded-md border px-2 py-1.5 transition-colors hover:bg-gray-50 ${active ? "border-bright-blue" : "border-transparent"}`}
                                            >
                                                <Checkbox
                                                    checked={active}
                                                    onCheckedChange={() =>
                                                        toggle(
                                                            "members",
                                                            member,
                                                        )
                                                    }
                                                    className="rounded data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                                                />
                                                <Avatar className="size-6">
                                                    <AvatarImage
                                                        src={member.avatar_url}
                                                        alt={member.name}
                                                    />
                                                    <AvatarFallback
                                                        className="text-[10px] font-bold text-white"
                                                        style={{
                                                            background:
                                                                member.color,
                                                        }}
                                                    >
                                                        {getInitials(
                                                            member.name,
                                                            member.surname,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span
                                                    className="text-sm"
                                                    style={{
                                                        color: active
                                                            ? ""
                                                            : "#374151",
                                                    }}
                                                >
                                                    {member.name}{" "}
                                                    {member.surname}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </FilterSection>
                            <Separator />
                        </>
                    )}
                    {filters.categories && (
                        <>
                            <FilterSection
                                title="Categories"
                                icon={<TagIcon weight="duotone" size={16} />}
                                count={filters.categories.length || undefined}
                            >
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {projectData.categories.map(
                                        (projectCategory) => (
                                            <Chip
                                                key={projectCategory.id}
                                                bgColor={projectCategory.color}
                                                textColor="#fff"
                                                active={
                                                    filters.categories
                                                        ? filters.categories.some(
                                                              (category) =>
                                                                  category ===
                                                                  projectCategory.name,
                                                          )
                                                        : false
                                                }
                                                onClick={() =>
                                                    toggle(
                                                        "categories",
                                                        projectCategory.name,
                                                    )
                                                }
                                            >
                                                {projectCategory.name}
                                            </Chip>
                                        ),
                                    )}
                                </div>
                            </FilterSection>
                            <Separator />
                        </>
                    )}
                    <FilterSection
                        title="Due Date"
                        icon={<CalendarBlankIcon weight="duotone" size={16} />}
                        count={filters.date_range?.from ? 1 : undefined}
                    >
                        <div className="space-y-2 pt-1">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    {
                                        label: "Overdue",
                                        key: "overdue" as const,
                                    },
                                    {
                                        label: "Due soon",
                                        key: "due_soon" as const,
                                    },
                                ].map(({ label, key }) => (
                                    <button
                                        key={key}
                                        onClick={() =>
                                            update({ [key]: !filters[key] })
                                        }
                                        className="flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all"
                                        style={
                                            filters[key]
                                                ? {
                                                      background: "#FEF0EF",
                                                      color: "#D93025",
                                                      border: "1px solid #FACACB",
                                                  }
                                                : {
                                                      background: "#F9FAFB",
                                                      color: "#6B7280",
                                                      border: "1px solid #E5E7EB",
                                                  }
                                        }
                                    >
                                        {label}
                                        {filters[key] && (
                                            <XIcon weight="duotone" size={14} />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <Popover open={calOpen} onOpenChange={setCalOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        className="flex w-full items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors hover:bg-gray-50"
                                        style={{
                                            background: filters.date_range?.from
                                                ? "#EDE9FD"
                                                : "#F9FAFB",
                                            border: filters.date_range?.from
                                                ? "1px solid #D3CBF8"
                                                : "1px solid #E5E7EB",
                                            color: filters.date_range?.from
                                                ? "#0096FF"
                                                : "#6b7280",
                                        }}
                                    >
                                        <CalendarIcon
                                            weight="duotone"
                                            size={16}
                                            style={{
                                                color: filters.date_range?.from
                                                    ? "#0096FF"
                                                    : "#6b7280",
                                            }}
                                        />
                                        {filters.date_range?.from
                                            ? filters.date_range.to
                                                ? `${format(filters.date_range.from, "MMM d")} → ${format(filters.date_range.to, "MMM d")}`
                                                : format(
                                                      filters.date_range.from,
                                                      "MMM d, yyyy",
                                                  )
                                            : "Select date range"}
                                        {filters.date_range?.from && (
                                            <span
                                                className="ml-auto"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    update({
                                                        date_range: undefined,
                                                    });
                                                }}
                                            >
                                                <XIcon
                                                    weight="duotone"
                                                    size={16}
                                                />
                                            </span>
                                        )}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="rounded-md border bg-white p-0 shadow-sm">
                                    <Calendar
                                        mode="range"
                                        selected={filters.date_range}
                                        onSelect={(r) => {
                                            update({ date_range: r });
                                            if (r?.from && r?.to)
                                                setCalOpen(false);
                                        }}
                                        numberOfMonths={1}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </FilterSection>
                    <Separator />
                    {filters.progress && (
                        <>
                            <FilterSection
                                title="Progress"
                                icon={
                                    <ChartLineIcon weight="duotone" size={16} />
                                }
                                count={
                                    filters.progress[0] > 0 ||
                                    filters.progress[1] < 100
                                        ? 1
                                        : undefined
                                }
                            >
                                <div className="px-1 pb-1 pt-2">
                                    <div className="mb-4 flex items-center justify-between">
                                        <span className="text-xs font-medium">
                                            Completion range
                                        </span>
                                        <span className="rounded-md px-2 py-0.5 text-xs font-semibold">
                                            {filters.progress[0]}% -{" "}
                                            {filters.progress[1]}%
                                        </span>
                                    </div>
                                    <Slider
                                        min={0}
                                        max={100}
                                        step={5}
                                        value={filters.progress}
                                        onValueChange={(v) =>
                                            update({
                                                progress: v as [number, number],
                                            })
                                        }
                                        className="[&_.bg-primary]:bg-bright-blue [&_[role=slider]]:border-bright-blue [&_[role=slider]]:bg-white"
                                    />
                                    <div className="mt-2 flex justify-between">
                                        <span className="text-[10px]">0%</span>
                                        <span className="text-[10px]">
                                            100%
                                        </span>
                                    </div>
                                </div>
                            </FilterSection>
                            <Separator />
                        </>
                    )}
                    <div className="space-y-2 py-3">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest">
                            Has
                        </p>
                        {[
                            {
                                key: "has_attachment" as const,
                                label: "Attachment",
                                Icon: PaperclipIcon,
                            },
                            {
                                key: "has_subtasks" as const,
                                label: "Subtasks",
                                Icon: CheckSquareIcon,
                            },
                        ].map(({ key, label, Icon }) => (
                            <label
                                key={key}
                                className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
                                style={
                                    filters[key]
                                        ? {
                                              background: "#EDE9FD",
                                              border: "1px solid #D3CBF8",
                                          }
                                        : { border: "1px solid #E5E7EB" }
                                }
                            >
                                <span
                                    className="flex items-center gap-1.5 text-sm"
                                    style={{
                                        color: filters[key]
                                            ? "#0096FF"
                                            : "#374151",
                                    }}
                                >
                                    <Icon weight="duotone" size={16} />
                                    {label}
                                </span>
                                <Checkbox
                                    checked={filters[key]}
                                    onCheckedChange={() =>
                                        update({ [key]: !filters[key] })
                                    }
                                    className="rounded data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                                />
                            </label>
                        ))}
                    </div>
                    <div className="h-4" />
                </div>
                <div className="flex shrink-0 items-center justify-between border-t px-5 py-4">
                    <p className="text-xs text-gray-500">
                        {activeCount > 0
                            ? `${activeCount} filter${activeCount > 1 ? "s" : ""} applied`
                            : "No filters"}
                    </p>
                    <div className="flex items-center gap-2">
                        {activeCount > 0 && (
                            <Button
                                variant="outline"
                                onClick={reset}
                                className="h-9 gap-1.5 px-4 text-sm text-gray-500 hover:bg-gray-200 [&_svg]:size-4"
                            >
                                <ArrowCounterClockwiseIcon
                                    weight="duotone"
                                    size={16}
                                />
                                Reset all
                            </Button>
                        )}
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="h-9 bg-bright-blue px-5 text-sm font-semibold text-white hover:bg-blue-600"
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
