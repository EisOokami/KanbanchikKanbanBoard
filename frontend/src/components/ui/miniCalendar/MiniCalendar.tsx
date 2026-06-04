import { MONTHS, WEEKDAYS } from "@/constants/constants";
import {
    cn,
    getDaysInMonth,
    getFirstDayOfMonth,
    toDateStr,
    todayStr,
} from "@/libs/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

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
}: MiniCalendarProps) {
    const [mYear, setMYear] = useState<number>(viewYear);
    const [mMonth, setMMonth] = useState<number>(viewMonth);

    const daysInMonth = getDaysInMonth(mYear, mMonth);
    const firstDay = getFirstDayOfMonth(mYear, mMonth);
    const today = todayStr();

    const prev = (): void => {
        if (mMonth === 0) {
            setMMonth(11);
            setMYear((y) => y - 1);
        } else setMMonth((m) => m - 1);
    };
    const next = (): void => {
        if (mMonth === 11) {
            setMMonth(0);
            setMYear((y) => y + 1);
        } else setMMonth((m) => m + 1);
    };

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
        <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">
                    {MONTHS[mMonth].slice(0, 3)} {mYear}
                </span>
                <div className="flex gap-0.5">
                    <button
                        onClick={prev}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100"
                    >
                        <ChevronLeft className="size-3" />
                    </button>
                    <button
                        onClick={next}
                        className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100"
                    >
                        <ChevronRight className="size-3" />
                    </button>
                </div>
            </div>
            <div className="mb-1 grid grid-cols-7">
                {WEEKDAYS.map((d) => (
                    <div
                        key={d}
                        className="pb-1 text-center text-[9px] font-bold text-gray-400"
                    >
                        {d[0]}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
                {cells.map((day, i) => {
                    if (day === null) return <div key={`_${i}`} />;

                    const ds = toDateStr(mYear, mMonth, day);
                    const isT = ds === today;
                    const isSel = ds === selectedDate;
                    const hasEv = eventDates.has(ds);

                    return (
                        <button
                            key={ds}
                            onClick={() => onSelectDate(ds)}
                            className={cn(
                                "flex aspect-square flex-col items-center justify-center rounded-full text-[10px] font-semibold transition-all",
                                isT
                                    ? "bg-bright-blue text-white"
                                    : isSel
                                      ? "bg-blue-100 text-blue-600"
                                      : "text-gray-600 hover:bg-gray-100",
                            )}
                        >
                            {day}
                            {hasEv && !isT && (
                                <span className="-mt-0.5 h-1 w-1 rounded-full bg-blue-400" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
