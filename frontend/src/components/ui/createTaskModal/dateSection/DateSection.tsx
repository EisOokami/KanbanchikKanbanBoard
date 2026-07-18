"use client";

import { cn } from "@/libs/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import { CalendarIcon } from "@phosphor-icons/react";
import { format } from "date-fns";
import { Calendar } from "../../shadcn/calendar";
import { ZodErrors } from "../../zodErrors/ZodErrors";
import { BaseAction } from "@/types/actions";
import { Button } from "../../shadcn/button";

interface DateSectionProps {
    formState: BaseAction | undefined;
    isPending: boolean;
    startDate: Date | undefined;
    dueDate: Date | undefined;
    startDateOpen: boolean;
    dueDateOpen: boolean;
    onOpenStartDateChange: (open: boolean) => void;
    onOpenDueDateChange: (open: boolean) => void;
    onStartDateChange: (date: Date | undefined) => void;
    onDueDateChange: (date: Date | undefined) => void;
}

export default function DateSection({
    formState,
    isPending,
    startDate,
    dueDate,
    startDateOpen,
    dueDateOpen,
    onOpenStartDateChange,
    onOpenDueDateChange,
    onStartDateChange,
    onDueDateChange,
}: Readonly<DateSectionProps>) {
    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
                <label className="block font-semibold" htmlFor="start-date">
                    Start Date
                </label>
                <Popover
                    open={startDateOpen}
                    onOpenChange={onOpenStartDateChange}
                >
                    <PopoverTrigger
                        id="start-date"
                        asChild
                        disabled={isPending}
                    >
                        <Button
                            type="button"
                            className={cn(
                                "h-9 w-full justify-start border border-input bg-control px-3 text-sm hover:bg-control-active",
                                startDate
                                    ? "text-foreground"
                                    : "text-control-text",
                                formState?.zodErrors?.startDate
                                    ? "border-red-500"
                                    : "",
                            )}
                            disabled={isPending}
                        >
                            <CalendarIcon
                                weight="duotone"
                                className="size-4 flex-shrink-0 text-control-text"
                            />
                            {startDate
                                ? format(startDate, "MMM d, yyyy")
                                : "Pick a date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-fit rounded-md border-border p-0"
                        align="start"
                    >
                        <Calendar
                            mode="single"
                            selected={startDate}
                            onSelect={(date) => {
                                if (!isPending) {
                                    onStartDateChange(date);
                                    onOpenStartDateChange(false);
                                }
                            }}
                            className="rounded-md"
                        />
                    </PopoverContent>
                </Popover>
                <div>
                    <ZodErrors error={formState?.zodErrors?.startDate} />
                </div>
            </div>
            <div className="space-y-1">
                <label className="block font-semibold" htmlFor="due-date">
                    Due Date
                </label>
                <Popover open={dueDateOpen} onOpenChange={onOpenDueDateChange}>
                    <PopoverTrigger id="due-date" asChild disabled={isPending}>
                        <Button
                            type="button"
                            className={cn(
                                "h-9 w-full justify-start border border-input bg-control px-3 text-sm hover:bg-control-active",
                                dueDate
                                    ? "text-foreground"
                                    : "text-control-text",
                                formState?.zodErrors?.dueDate
                                    ? "border-red-500"
                                    : "",
                            )}
                            disabled={isPending}
                        >
                            <CalendarIcon
                                weight="duotone"
                                className="size-4 flex-shrink-0 text-muted-foreground"
                            />
                            {dueDate
                                ? format(dueDate, "MMM d, yyyy")
                                : "Pick a date"}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-fit rounded-md border-border p-0"
                        align="start"
                    >
                        <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={(date) => {
                                if (!isPending) {
                                    onDueDateChange(date);
                                    onOpenDueDateChange(false);
                                }
                            }}
                            className="rounded-md"
                        />
                    </PopoverContent>
                </Popover>
                <div>
                    <ZodErrors error={formState?.zodErrors?.dueDate} />
                </div>
            </div>
        </div>
    );
}
