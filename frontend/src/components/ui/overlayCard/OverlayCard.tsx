"use client";

import { PRIORITY_CONFIG } from "@/constants/constants";
import { Task } from "@/types/types";

interface OverlayCardProps {
    card: Task;
}

function formatDate(date: string | Date): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function OverlayCard({ card }: Readonly<OverlayCardProps>) {
    const priorityDot = PRIORITY_CONFIG[card.priority]?.dot ?? "bg-gray-300";
    const category = card.categories[0];

    return (
        <div className="w-[272px] rotate-2 cursor-grabbing rounded-xl border border-gray-300 bg-white p-3.5 shadow-2xl">
            <div className="mb-2.5 flex items-center justify-between">
                {category && (
                    <span
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize leading-none"
                        style={{
                            background: category.color + "22",
                            color: category.color,
                        }}
                    >
                        {category.name}
                    </span>
                )}
            </div>
            <p className="mb-3 text-sm font-medium leading-snug">
                {card.title}
            </p>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <span className={`size-1.5 rounded-full ${priorityDot}`} />
                    <span className="text-[10px] text-gray-500">
                        {PRIORITY_CONFIG[card.priority]?.label}
                    </span>
                </div>
                <span className="text-[10px] text-gray-400">
                    {formatDate(card.due_date)}
                </span>
            </div>
        </div>
    );
}
