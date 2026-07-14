"use client";

import { CalendarBlankIcon, CalendarIcon, XIcon } from "@phosphor-icons/react";
import FilterSection from "../filterSection/FilterSection";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import { Calendar } from "../../shadcn/calendar";
import { FilterState } from "@/types/types";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/libs/utils";

interface DueDateSectionProps {
    filters: FilterState;
    onUpdate: (patch: Partial<FilterState>) => void;
}

export default function DueDateSection({
    filters,
    onUpdate,
}: Readonly<DueDateSectionProps>) {
    const [calendarOpen, setCalendarOpen] = useState<boolean>(false);

    return (
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
                            onClick={() => onUpdate({ [key]: !filters[key] })}
                            className={cn(
                                "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                                filters[key]
                                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                                    : "border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                        >
                            {label}
                            {filters[key] && (
                                <XIcon weight="duotone" size={14} />
                            )}
                        </button>
                    ))}
                </div>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className={cn(
                                "flex w-full items-center gap-2 rounded-md border border-border bg-control px-3 py-2.5 text-sm transition-colors hover:bg-control-active",
                                filters.date_range?.from
                                    ? "border-bright-blue/60 text-bright-blue hover:bg-control-active"
                                    : "text-control-text",
                            )}
                        >
                            <CalendarIcon weight="duotone" size={16} />
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
                                        onUpdate({
                                            date_range: undefined,
                                        });
                                    }}
                                >
                                    <XIcon weight="duotone" size={16} />
                                </span>
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-fit rounded-md border border-border p-0 shadow-sm">
                        <Calendar
                            mode="range"
                            selected={filters.date_range}
                            onSelect={(r) => {
                                onUpdate({ date_range: r });
                                if (r?.from && r?.to) setCalendarOpen(false);
                            }}
                            numberOfMonths={1}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </FilterSection>
    );
}
