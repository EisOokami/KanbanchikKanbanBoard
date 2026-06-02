"use client";

import { ICard } from "@/interfaces/interfaces";
import { Circle, Flame } from "lucide-react";

const PRIORITY = {
    low: { label: "Low", color: "#10b981", icon: Circle },
    medium: { label: "Medium", color: "#f59e0b", icon: Flame },
    high: { label: "High", color: "#ef4444", icon: Flame },
};

const TAG_COLORS = {
    Research: "#8b5cf6",
    Backend: "#3b82f6",
    UX: "#ec4899",
    Design: "#6366f1",
    QA: "#f59e0b",
    Marketing: "#10b981",
    DevOps: "#64748b",
    Frontend: "#06b6d4",
};

interface OverlayCardProps {
    card: ICard;
}

export default function OverlayCard({ card }: Readonly<OverlayCardProps>) {
    const tagColor = TAG_COLORS[card.tag] || "#6366f1";
    const PriorityIcon = PRIORITY[card.priority]?.icon || Circle;
    const priorityColor = PRIORITY[card.priority]?.color || "#64748b";

    return (
        <div
            className="w-[272px] rotate-2 rounded-xl border border-gray-400 bg-white p-3.5 shadow-2xl"
            style={{ cursor: "grabbing" }}
        >
            <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                style={{ background: tagColor + "22", color: tagColor }}
            >
                {card.tag}
            </span>
            <p className="mb-3 mt-2 text-sm font-medium leading-snug">
                {card.title}
            </p>
            <div className="flex items-center justify-between">
                <div
                    className="flex items-center gap-1"
                    style={{ color: priorityColor }}
                >
                    <PriorityIcon className="size-3" />
                    <span className="text-[10px] font-medium">
                        {PRIORITY[card.priority]?.label}
                    </span>
                </div>
                <span className="text-[10px] text-gray-500">{card.date}</span>
            </div>
        </div>
    );
}
