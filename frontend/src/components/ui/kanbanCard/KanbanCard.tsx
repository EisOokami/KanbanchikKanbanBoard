"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Circle,
    Flame,
    GripVertical,
    MoreHorizontal,
    Trash2,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../shadcn/dropdown-menu";
import { ICard } from "@/interfaces/interfaces";

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

interface KanbanCardProps {
    card: ICard;
    onDelete: (id: string) => void;
    onOpenDetails: () => void;
}

export default function KanbanCard({
    card,
    onDelete,
    onOpenDetails,
}: Readonly<KanbanCardProps>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    const PriorityIcon = PRIORITY[card.priority]?.icon || Circle;
    const priorityColor = PRIORITY[card.priority]?.color || "#64748b";
    const tagColor = TAG_COLORS[card.tag] || "#6366f1";

    return (
        <div
            ref={setNodeRef}
            style={{ ...style }}
            onClick={onOpenDetails}
            className="group relative cursor-default select-none rounded-xl border bg-white p-3.5 text-left transition-all duration-150 hover:border-gray-300 hover:shadow-lg"
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 cursor-grab p-1 opacity-30 transition-opacity hover:!opacity-80 active:cursor-grabbing group-hover:opacity-40"
            >
                <GripVertical className="size-3.5" />
            </div>
            <div className="flex items-center justify-between gap-2 pl-4">
                <span
                    className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                    style={{ background: tagColor + "22", color: tagColor }}
                >
                    {card.tag}
                </span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex-shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-gray-100 hover:!opacity-100 group-hover:opacity-60">
                            <MoreHorizontal className="size-3.5 text-gray-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36 border">
                        <DropdownMenuItem
                            className="cursor-pointer gap-2 text-xs text-red-400 focus:bg-red-500/10 focus:text-red-400"
                            onClick={() => onDelete(card.id)}
                        >
                            <Trash2 className="size-3" /> Delete card
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <p className="mb-3 mt-2 pl-4 text-sm font-medium">{card.title}</p>
            <div className="flex items-center justify-between pl-4">
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
