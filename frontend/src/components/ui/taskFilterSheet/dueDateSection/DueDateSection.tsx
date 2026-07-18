"use client";

import { CalendarBlankIcon, CalendarIcon, XIcon } from "@phosphor-icons/react";
import FilterSection from "../filterSection/FilterSection";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import { Calendar } from "../../shadcn/calendar";
import { FilterState } from "@/types/types";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/libs/utils";
import { Button } from "../../shadcn/button";

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
                        <Button
                            key={key}
                            onClick={() => onUpdate({ [key]: !filters[key] })}
                            className={cn(
                                "h-8 border px-2.5 text-xs font-medium",
                                filters[key]
                                    ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                                    : "border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                        >
                            {label}
                            {filters[key] && (
                                <XIcon weight="duotone" size={14} />
                            )}
                        </Button>
                    ))}
                </div>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            className={cn(
                                "h-10 w-full justify-start gap-2 border border-border bg-control px-3 text-sm hover:bg-control-active",
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
                        </Button>
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
