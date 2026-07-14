import { MONTHS, WEEKDAYS } from "@/constants/constants";
import {
    cn,
    getDaysInMonth,
    getFirstDayOfMonth,
    toDateStr,
    todayStr,
} from "@/libs/utils";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "../shadcn/button";

interface MiniCalendarProps {
    viewYear: number;
    viewMonth: number;
    selectedDate: string;
    onSelectDate: (dateStr: string) => void;
    eventDates: Set<string>;
}

export default function MiniCalendar({
    viewYear,
    viewMonth,
    selectedDate,
    onSelectDate,
    eventDates,
}: Readonly<MiniCalendarProps>) {
    const [year, setYear] = useState<number>(viewYear);
    const [month, setMonth] = useState<number>(viewMonth);

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const today = todayStr();

    const prev = (): void => {
        if (month === 0) {
            setMonth(11);
            setYear((prevState) => prevState - 1);
        } else {
            setMonth((prevState) => prevState - 1);
        }
    };
    const next = (): void => {
        if (month === 11) {
            setMonth(0);
            setYear((prevState) => prevState + 1);
        } else {
            setMonth((prevState) => prevState + 1);
        }
    };

    const cells: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
        cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(d);
    }

    return (
        <div className="p-4">
            <div className="mb-3 flex items-center justify-between gap-0.5">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={prev}
                    className="size-6 hover:bg-control-active [&_svg]:size-4"
                >
                    <CaretLeftIcon weight="duotone" />
                </Button>
                <span className="text-xs font-semibold">
                    {MONTHS[month].slice(0, 3)} {year}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={next}
                    className="size-6 hover:bg-control-active [&_svg]:size-4"
                >
                    <CaretRightIcon weight="duotone" />
                </Button>
            </div>
            <div className="mb-1 grid grid-cols-7">
                {WEEKDAYS.map((day) => (
                    <div
                        key={day}
                        className="pb-1 text-center text-[9px] font-bold text-muted-foreground"
                    >
                        {day[0]}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((day, i) => {
                    if (day === null) {
                        return <div key={`_${i}`} />;
                    }

                    const dateStr = toDateStr(year, month, day);
                    const isToday = dateStr === today;
                    const isSelected = dateStr === selectedDate;
                    const hasEvent = eventDates.has(dateStr);

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onSelectDate(dateStr)}
                            className={cn(
                                "flex aspect-square flex-col items-center justify-center rounded-full text-[10px] transition-all",
                                isToday
                                    ? "bg-bright-blue text-white"
                                    : isSelected
                                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                                      : "text-gray-600 dark:text-gray-400",
                            )}
                        >
                            {day}
                            {hasEvent && !isToday && (
                                <span className="-mt-0.5 size-1 rounded-full bg-bright-blue" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
