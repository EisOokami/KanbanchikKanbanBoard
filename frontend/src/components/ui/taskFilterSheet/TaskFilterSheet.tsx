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
    CheckIcon,
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
import { useDebouncedCallback } from "use-debounce";
import StartDateSection from "./startDateSection/StartDateSection";

interface TaskFilterSheetProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    projectData: Project;
    filters?: FilterState;
    onFiltersChange?: (f: FilterState) => void;
}

export default function TaskFilterSheet({
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

    const debouncedSearchUpdate = useDebouncedCallback((value: string) => {
        update({ search: value });
    }, 1000);

    const activeCount = countActive(filters);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex min-w-[620px] max-w-[100vw] flex-col gap-0 overflow-hidden border-l border-border bg-background-secondary p-0 [&>button:first-of-type]:hidden"
            >
                <SheetHeader className="shrink-0 border-b border-border px-5 py-3">
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
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="size-7 text-control-text transition-colors hover:bg-control-active [&_svg]:size-4"
                        >
                            <XIcon weight="duotone" />
                        </Button>
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
                                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-control-text"
                            />
                            <Input
                                value={filters.search}
                                placeholder="Search tasks…"
                                onChange={(e) => {
                                    setFilters((prev) => ({
                                        ...prev,
                                        search: e.target.value,
                                    }));

                                    debouncedSearchUpdate(e.target.value);
                                }}
                                className="h-9 rounded-md bg-control pl-9 text-sm placeholder:text-control-text focus-visible:ring-1 focus-visible:ring-bright-blue"
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
                    <PrioritySection
                        filters={filters}
                        showPriorityEmoji={projectData.show_priority_emoji}
                        onToggle={toggle}
                    />
                    <Separator />
                    <ColumnSection
                        filters={filters}
                        projectData={projectData}
                        onToggle={toggle}
                    />
                    <Separator />
                    {projectData.members && projectData.members.length > 1 && (
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
                    <StartDateSection filters={filters} onUpdate={update} />
                    <Separator />
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
                <div className="flex shrink-0 items-center justify-between border-t border-border px-5 py-4">
                    <p className="text-xs text-muted-foreground">
                        {activeCount > 0
                            ? `${activeCount} filter${activeCount > 1 ? "s" : ""} applied`
                            : "No filters"}
                    </p>
                    <div className="flex items-center gap-2">
                        {activeCount > 0 && (
                            <Button
                                variant="outline"
                                onClick={reset}
                                className="h-9 gap-1.5 bg-control px-4 text-sm text-control-text hover:bg-control-active [&_svg]:size-4"
                            >
                                <ArrowCounterClockwiseIcon weight="duotone" />
                                Reset all
                            </Button>
                        )}
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="h-9 bg-bright-blue px-5 text-sm font-semibold text-white hover:bg-blue-600 [&_svg]:size-4"
                        >
                            <CheckIcon weight="duotone" />
                            Apply
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
