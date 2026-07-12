"use client";

import { CalendarBlankIcon, CalendarIcon, XIcon } from "@phosphor-icons/react";
import FieldRow from "../../fieldRow/FieldRow";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import { Calendar } from "../../shadcn/calendar";
import { useState } from "react";
import { dateMeta } from "@/libs/taskDetailsSheet";
import { format } from "date-fns";
import { cn } from "@/libs/utils";

interface DateSectionProps {
    isPending: boolean;
    startDate: Date | undefined;
    dueDate: Date | undefined;
    hasPermission: boolean;
    onStartDateChange: (startDate: Date | undefined) => void;
    onDueDateChange: (dueDate: Date | undefined) => void;
}

export default function DateSection({
    isPending,
    startDate,
    dueDate,
    hasPermission,
    onStartDateChange,
    onDueDateChange,
}: Readonly<DateSectionProps>) {
    const [startDateOpen, setStartDateOpen] = useState<boolean>(false);
    const [dueDateOpen, setDueDateOpen] = useState<boolean>(false);

    const dueDateMeta = dateMeta(dueDate);
    const startDateMeta = dateMeta(startDate);

    return (
        <>
            <FieldRow
                icon={<CalendarBlankIcon weight="duotone" size={16} />}
                label="Start date"
            >
                {hasPermission ? (
                    <Popover
                        open={startDateOpen}
                        onOpenChange={setStartDateOpen}
                    >
                        <PopoverTrigger asChild disabled={isPending}>
                            <button
                                type="button"
                                className="-mx-2 flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-gray-50"
                                disabled={isPending}
                            >
                                {startDateMeta ? (
                                    <span
                                        className="flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium"
                                        style={{
                                            background: startDateMeta.bg,
                                            color: startDateMeta.color,
                                            border: `1px solid ${startDateMeta.border}`,
                                        }}
                                    >
                                        <CalendarIcon
                                            weight="duotone"
                                            size={14}
                                        />
                                        {startDateMeta.text !== "Overdue" &&
                                        startDateMeta.text !== "Today" &&
                                        startDateMeta.text !== "Tomorrow"
                                            ? startDateMeta.text
                                            : `${startDateMeta.text} · ${format(startDate!, "MMM d")}`}
                                    </span>
                                ) : (
                                    <span className="text-sm text-gray-300">
                                        No start date
                                    </span>
                                )}
                                {startDate && (
                                    <XIcon
                                        weight="duotone"
                                        size={14}
                                        onClick={(e) => {
                                            if (!isPending) {
                                                e.stopPropagation();

                                                onStartDateChange(undefined);
                                            }
                                        }}
                                        className="text-gray-500 transition-colors hover:text-red-400"
                                    />
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={startDate ?? undefined}
                                onSelect={(d) => {
                                    onStartDateChange(d ?? undefined);
                                    setStartDateOpen(false);
                                }}
                                disabled={isPending}
                            />
                        </PopoverContent>
                    </Popover>
                ) : (
                    <div
                        className={cn(
                            "-mx-2 flex items-center gap-2 rounded-md px-2 py-1",
                            hasPermission &&
                                "transition-colors hover:bg-gray-50",
                        )}
                    >
                        {startDateMeta ? (
                            <span
                                className="flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium"
                                style={{
                                    background: startDateMeta.bg,
                                    color: startDateMeta.color,
                                    border: `1px solid ${startDateMeta.border}`,
                                }}
                            >
                                <CalendarIcon weight="duotone" size={14} />
                                {startDateMeta.text !== "Overdue" &&
                                startDateMeta.text !== "Today" &&
                                startDateMeta.text !== "Tomorrow"
                                    ? startDateMeta.text
                                    : `${startDateMeta.text} · ${format(startDate!, "MMM d")}`}
                            </span>
                        ) : (
                            <span className="text-sm text-gray-300">
                                No start date
                            </span>
                        )}
                    </div>
                )}
            </FieldRow>
            <FieldRow
                icon={<CalendarBlankIcon weight="duotone" size={16} />}
                label="Due date"
            >
                {hasPermission ? (
                    <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                        <PopoverTrigger asChild disabled={isPending}>
                            <button
                                type="button"
                                className="-mx-2 flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-gray-50"
                                disabled={isPending}
                            >
                                {dueDateMeta ? (
                                    <span
                                        className="flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium"
                                        style={{
                                            background: dueDateMeta.bg,
                                            color: dueDateMeta.color,
                                            border: `1px solid ${dueDateMeta.border}`,
                                        }}
                                    >
                                        <CalendarIcon
                                            weight="duotone"
                                            size={14}
                                        />
                                        {dueDateMeta.text !== "Overdue" &&
                                        dueDateMeta.text !== "Today" &&
                                        dueDateMeta.text !== "Tomorrow"
                                            ? dueDateMeta.text
                                            : `${dueDateMeta.text} · ${format(dueDate!, "MMM d")}`}
                                    </span>
                                ) : (
                                    <span className="text-sm text-gray-300">
                                        No due date
                                    </span>
                                )}
                                {dueDate && (
                                    <XIcon
                                        weight="duotone"
                                        size={14}
                                        onClick={(e) => {
                                            if (!isPending) {
                                                e.stopPropagation();

                                                onDueDateChange(undefined);
                                            }
                                        }}
                                        className="text-gray-500 transition-colors hover:text-red-400"
                                    />
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                            <Calendar
                                mode="single"
                                selected={dueDate ?? undefined}
                                onSelect={(d) => {
                                    onDueDateChange(d ?? undefined);
                                    setDueDateOpen(false);
                                }}
                                disabled={isPending}
                            />
                        </PopoverContent>
                    </Popover>
                ) : (
                    <div
                        className={cn(
                            "-mx-2 flex items-center gap-2 rounded-md px-2 py-1",
                            hasPermission &&
                                "transition-colors hover:bg-gray-50",
                        )}
                    >
                        {dueDateMeta ? (
                            <span
                                className="flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium"
                                style={{
                                    background: dueDateMeta.bg,
                                    color: dueDateMeta.color,
                                    border: `1px solid ${dueDateMeta.border}`,
                                }}
                            >
                                <CalendarIcon weight="duotone" size={14} />
                                {dueDateMeta.text !== "Overdue" &&
                                dueDateMeta.text !== "Today" &&
                                dueDateMeta.text !== "Tomorrow"
                                    ? dueDateMeta.text
                                    : `${dueDateMeta.text} · ${format(dueDate!, "MMM d")}`}
                            </span>
                        ) : (
                            <span className="text-sm text-gray-300">
                                No due date
                            </span>
                        )}
                    </div>
                )}
                <input
                    type="hidden"
                    name="start-date"
                    value={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                />
                <input
                    type="hidden"
                    name="due-date"
                    value={dueDate ? format(dueDate, "yyyy-MM-dd") : ""}
                />
            </FieldRow>
        </>
    );
}
