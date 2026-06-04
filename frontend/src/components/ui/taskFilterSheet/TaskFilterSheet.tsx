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
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { Separator } from "@/components/ui/shadcn/separator";
import { Slider } from "@/components/ui/shadcn/slider";
import { Calendar } from "@/components/ui/shadcn/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/shadcn/popover";
import {
    CalendarDays,
    Filter,
    Flame,
    LayoutGrid,
    RotateCcw,
    Search,
    SlidersHorizontal,
    Tag,
    X,
} from "lucide-react";
import { format } from "date-fns";
import { countActive } from "@/libs/taskFilterSheet";
import FilterSection from "./filterSection/FilterSection";
import Chip from "./chip/Chip";
import { Columns, FilterState, Priority } from "@/types/types";
import {
    COLUMNS_CONFIG,
    DEFAULT_FILTER,
    MOCK_CATEGORIES,
    MOCK_MEMBERS,
    PRIORITY_CONFIG,
} from "@/constants/constants";
import { cn, getInitials } from "@/libs/utils";

interface TaskFilterSheetProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    filters?: FilterState;
    onFiltersChange?: (f: FilterState) => void;
}

export function TaskFilterSheet({
    open,
    onOpenChange,
    filters: externalFilters,
    onFiltersChange,
}: TaskFilterSheetProps) {
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
        K extends "priorities" | "columns" | "assignees" | "categories",
    >(
        key: K,
        value: string,
    ) => {
        const arr = filters[key] as string[];
        update({
            [key]: arr.includes(value)
                ? arr.filter((x) => x !== value)
                : [...arr, value],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
    };

    const reset = () => {
        setFilters(DEFAULT_FILTER);
        onFiltersChange?.(DEFAULT_FILTER);
    };

    const activeCount = countActive(filters);
    const filteredMembers = Object.values(MOCK_MEMBERS).filter((m) =>
        m.name.toLowerCase().includes(memberSearch.toLowerCase()),
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
                        <div className="flex items-center gap-1.5">
                            {activeCount > 0 && (
                                <Button
                                    variant="outline"
                                    onClick={reset}
                                    className="flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors hover:bg-gray-100 [&_svg]:size-3"
                                >
                                    <RotateCcw />
                                    Reset
                                </Button>
                            )}
                            <button
                                onClick={() => onOpenChange(false)}
                                className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>
                </SheetHeader>
                <div className="grid flex-1 gap-2 overflow-y-auto px-5 py-2">
                    <div className="py-3">
                        <div className="relative">
                            <Search
                                size={14}
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
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                    </div>
                    <Separator />
                    <FilterSection
                        title="Priority"
                        icon={<Flame size={13} />}
                        count={filters.priorities.length || undefined}
                    >
                        <div className="flex flex-wrap gap-2 pt-1">
                            {Object.values(PRIORITY_CONFIG).map((priority) => {
                                const Icon = priority.icon;

                                return (
                                    <Chip
                                        key={priority.label}
                                        active={filters.priorities.includes(
                                            priority.label.toLowerCase() as Priority,
                                        )}
                                        pill={priority.pill}
                                        onClick={() =>
                                            toggle("priorities", priority.label)
                                        }
                                    >
                                        {Icon && <Icon />}
                                        {priority.label}
                                    </Chip>
                                );
                            })}
                        </div>
                    </FilterSection>
                    <Separator />
                    <FilterSection
                        title="Column"
                        icon={<LayoutGrid size={13} />}
                        count={filters.columns.length || undefined}
                    >
                        <div className="space-y-1.5 pt-1">
                            {Object.values(COLUMNS_CONFIG).map((column) => {
                                const active = filters.columns.includes(
                                    column.label.toLowerCase() as Columns,
                                );

                                return (
                                    <label
                                        key={column.label}
                                        className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-gray-50 ${active ? "border-bright-blue" : "border-transparent"}`}
                                    >
                                        <Checkbox
                                            checked={active}
                                            onCheckedChange={() =>
                                                toggle("columns", column.label)
                                            }
                                            className="rounded data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                                        />
                                        <div className="flex flex-1 items-center gap-2">
                                            <span
                                                className="size-2 rounded-full"
                                                style={{
                                                    background: column.dot,
                                                }}
                                            />
                                            <span
                                                className={cn(
                                                    "text-sm",
                                                    active
                                                        ? column.label
                                                              .split(" ")
                                                              .filter((label) =>
                                                                  label.includes(
                                                                      "text-",
                                                                  ),
                                                              )[0]
                                                        : "text-gray-500",
                                                )}
                                            >
                                                {column.label}
                                            </span>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </FilterSection>
                    <Separator />
                    {filters.assignees && (
                        <>
                            <FilterSection
                                title="Assignees"
                                icon={<Filter size={13} />}
                                count={filters.assignees.length || undefined}
                            >
                                <div className="space-y-1 pt-1">
                                    <div className="relative mb-2">
                                        <Search
                                            size={12}
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
                                    {filteredMembers.map((m) => {
                                        const active = filters.assignees?.some(
                                            (assignee) =>
                                                assignee.name === m.name,
                                        );

                                        return (
                                            <label
                                                key={m.id}
                                                className={`flex cursor-pointer items-center gap-3 rounded-md border px-2 py-1.5 transition-colors hover:bg-gray-50 ${active ? "border-bright-blue" : "border-transparent"}`}
                                            >
                                                <Checkbox
                                                    checked={active}
                                                    onCheckedChange={() =>
                                                        toggle(
                                                            "assignees",
                                                            m.id.toString(),
                                                        )
                                                    }
                                                    className="rounded data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                                                />
                                                <Avatar className="size-6">
                                                    <AvatarFallback
                                                        className="text-[10px] font-bold text-white"
                                                        style={{
                                                            background: m.color,
                                                        }}
                                                    >
                                                        {getInitials(
                                                            m.name,
                                                            m.surname,
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
                                                    {m.name}
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
                                icon={<Tag size={13} />}
                                count={filters.categories.length || undefined}
                            >
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {Object.values(MOCK_CATEGORIES).map(
                                        (mockCategory) => (
                                            <Chip
                                                key={mockCategory.id}
                                                pill={mockCategory.pill}
                                                active={
                                                    filters.categories?.some(
                                                        (category) =>
                                                            category.name ===
                                                            mockCategory.name,
                                                    ) ?? false
                                                }
                                                onClick={() =>
                                                    toggle(
                                                        "categories",
                                                        mockCategory.name,
                                                    )
                                                }
                                            >
                                                {mockCategory.name}
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
                        icon={<CalendarDays size={13} />}
                        count={filters.dateRange?.from ? 1 : undefined}
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
                                        key: "dueSoon" as const,
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
                                        {filters[key] && <X size={10} />}
                                    </button>
                                ))}
                            </div>
                            <Popover open={calOpen} onOpenChange={setCalOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        className="flex w-full items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors hover:bg-gray-50"
                                        style={{
                                            background: filters.dateRange?.from
                                                ? "#EDE9FD"
                                                : "#F9FAFB",
                                            border: filters.dateRange?.from
                                                ? "1px solid #D3CBF8"
                                                : "1px solid #E5E7EB",
                                            color: filters.dateRange?.from
                                                ? "#0096FF"
                                                : "#6b7280",
                                        }}
                                    >
                                        <CalendarDays
                                            size={13}
                                            style={{
                                                color: filters.dateRange?.from
                                                    ? "#0096FF"
                                                    : "#6b7280",
                                            }}
                                        />
                                        {filters.dateRange?.from
                                            ? filters.dateRange.to
                                                ? `${format(filters.dateRange.from, "MMM d")} → ${format(filters.dateRange.to, "MMM d")}`
                                                : format(
                                                      filters.dateRange.from,
                                                      "MMM d, yyyy",
                                                  )
                                            : "Select date range"}
                                        {filters.dateRange?.from && (
                                            <span
                                                className="ml-auto"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    update({
                                                        dateRange: undefined,
                                                    });
                                                }}
                                            >
                                                <X size={12} />
                                            </span>
                                        )}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="rounded-md border bg-white p-0 shadow-sm">
                                    <Calendar
                                        mode="range"
                                        selected={filters.dateRange}
                                        onSelect={(r) => {
                                            update({ dateRange: r });
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
                                icon={<SlidersHorizontal size={13} />}
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
                                key: "hasAttachment" as const,
                                label: "Attachment",
                            },
                            {
                                key: "hasChecklist" as const,
                                label: "Checklist",
                            },
                        ].map(({ key, label }) => (
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
                                    className="text-sm"
                                    style={{
                                        color: filters[key]
                                            ? "#0096FF"
                                            : "#374151",
                                    }}
                                >
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
                <div className="flex shrink-0 items-center justify-between border-t bg-gray-100 px-5 py-4">
                    <p className="text-xs text-gray-500">
                        {activeCount > 0
                            ? `${activeCount} filter${activeCount > 1 ? "s" : ""} applied`
                            : "No filters"}
                    </p>
                    <div className="flex items-center gap-2">
                        {activeCount > 0 && (
                            <Button
                                variant="ghost"
                                onClick={reset}
                                className="h-9 gap-1.5 px-4 text-sm text-gray-500 hover:bg-gray-200"
                            >
                                <RotateCcw size={13} />
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
