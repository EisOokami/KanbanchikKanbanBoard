"use client";

import { CalendarBlankIcon, CalendarIcon, XIcon } from "@phosphor-icons/react";
import FilterSection from "../filterSection/FilterSection";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import { Calendar } from "../../shadcn/calendar";
import { FilterState } from "@/types/types";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/libs/utils";

interface StartDateSectionProps {
    filters: FilterState;
    onUpdate: (patch: Partial<FilterState>) => void;
}

export default function StartDateSection({
    filters,
    onUpdate,
}: Readonly<StartDateSectionProps>) {
    const [calendarOpen, setCalendarOpen] = useState(false);

    return (
        <FilterSection
            title="Start Date"
            icon={<CalendarBlankIcon weight="duotone" size={16} />}
            count={filters.start_date_range?.from ? 1 : undefined}
        >
            <div className="pt-1">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                        <button
                            className={cn(
                                "flex w-full items-center gap-2 rounded-md border border-border bg-control px-3 py-2.5 text-sm transition-colors hover:bg-control-active",
                                filters.start_date_range?.from
                                    ? "border-bright-blue/60 text-bright-blue hover:bg-control-active"
                                    : "text-control-text",
                            )}
                        >
                            <CalendarIcon weight="duotone" size={16} />
                            {filters.start_date_range?.from
                                ? filters.start_date_range.to
                                    ? `${format(filters.start_date_range.from, "MMM d")} → ${format(filters.start_date_range.to, "MMM d")}`
                                    : format(
                                          filters.start_date_range.from,
                                          "MMM d, yyyy",
                                      )
                                : "Select date range"}
                            {filters.start_date_range?.from && (
                                <span
                                    className="ml-auto"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onUpdate({
                                            start_date_range: undefined,
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
                            selected={filters.start_date_range}
                            onSelect={(r) => {
                                onUpdate({ start_date_range: r });
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
