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
import { Separator } from "@/components/ui/shadcn/separator";
import { countActive } from "@/libs/taskFilterSheet";
import { FilterState, Project } from "@/types/types";
import {
    ArrowCounterClockwiseIcon,
    MagnifyingGlassIcon,
    XIcon,
} from "@phosphor-icons/react";
import { DEFAULT_FILTER } from "@/constants/taskFilterSheet";
import SortBySection from "./sortBySection/SortBySection";
import PrioritySection from "./prioritySection/PrioritySection";
import ColumnSection from "./columnSection/ColumnSection";
import MembersSection from "./membersSection/MembersSection";
import CategoriesSection from "./categoriesSection/CategoriesSection";
import DueDateSection from "./dueDateSection/DueDateSection";
import ProgressSection from "./progressSection/ProgressSection";
import HasSection from "./hasSection/HasSection";

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

    const reset = () => {
        setFilters(DEFAULT_FILTER);
        onFiltersChange?.(DEFAULT_FILTER);
    };

    const activeCount = countActive(filters);

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
                    <SortBySection filters={filters} onUpdate={update} />
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
                    <PrioritySection filters={filters} onToggle={toggle} />
                    <Separator />
                    <ColumnSection
                        filters={filters}
                        projectData={projectData}
                        onToggle={toggle}
                    />
                    <Separator />
                    {filters.members && filters.members.length > 1 && (
                        <>
                            <MembersSection
                                filters={filters}
                                projectData={projectData}
                                onToggle={toggle}
                            />
                            <Separator />
                        </>
                    )}
                    {filters.categories && (
                        <>
                            <CategoriesSection
                                filters={filters}
                                projectData={projectData}
                                onToggle={toggle}
                            />
                            <Separator />
                        </>
                    )}
                    <DueDateSection filters={filters} onUpdate={update} />
                    <Separator />
                    {filters.progress && (
                        <>
                            <ProgressSection
                                filters={filters}
                                onUpdate={update}
                            />
                            <Separator />
                        </>
                    )}
                    <HasSection filters={filters} onUpdate={update} />
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
