"use client";

import { CalendarBlankIcon, CalendarIcon, XIcon } from "@phosphor-icons/react";
import FilterSection from "../filterSection/FilterSection";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import { Calendar } from "../../shadcn/calendar";
import { FilterState } from "@/types/types";
import { format } from "date-fns";
import { useState } from "react";

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
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
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
                    <PopoverContent className="rounded-md border bg-white p-0 shadow-sm">
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
