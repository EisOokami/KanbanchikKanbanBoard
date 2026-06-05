"use client";

import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import KanbanCard from "../kanbanCard/KanbanCard";
import { CreateTaskModal } from "../createTaskModal/CreateTaskModal";
import { Column, ColumnConfig } from "@/types/types";

interface KanbanColumnProps {
    column: ColumnConfig & Column;
    onAddCard: (id: number, title: string) => void;
    onDeleteCard: () => void;
    onOpenDetails: () => void;
}

export default function KanbanColumn({
    column,
    onDeleteCard,
    onOpenDetails,
}: Readonly<KanbanColumnProps>) {
    const [adding, setAdding] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const { setNodeRef, isOver } = useDroppable({ id: column.id });

    const startAdding = () => {
        setAdding(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const wipExceeded =
        column.wip_limit > 0 && column.tasks.length >= column.wip_limit;

    return (
        <div
            className={`flex w-[320px] flex-shrink-0 flex-col rounded-2xl transition-colors duration-150 ${
                isOver ? "bg-gray-200" : "bg-gray-100"
            }`}
        >
            <div className="flex items-center justify-between px-4 pb-2.5 pt-4">
                <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold">{column.name}</span>
                    <span
                        className="min-w-[20px] rounded-full px-1.5 text-center text-xs font-bold"
                        style={{
                            background: column.color + "22",
                            color: column.color,
                        }}
                    >
                        {column.tasks.length}
                    </span>
                    {wipExceeded && (
                        <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-500">
                            WIP
                        </span>
                    )}
                </div>
                <button
                    onClick={startAdding}
                    className="flex size-6 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
                >
                    <Plus className="size-3.5" />
                </button>
            </div>
            <div
                className="mx-4 mb-3 h-px rounded-full"
                style={{
                    background: `linear-gradient(to right, ${column.color}66, transparent)`,
                }}
            />
            <div className="flex-1 overflow-y-auto px-3 pb-3">
                <SortableContext
                    items={column.tasks.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div
                        ref={setNodeRef}
                        className="flex min-h-[40px] flex-col gap-2"
                    >
                        {column.tasks.map((task) => (
                            <KanbanCard
                                key={task.id}
                                card={task}
                                onDelete={onDeleteCard}
                                onOpenDetails={onOpenDetails}
                            />
                        ))}
                    </div>
                </SortableContext>
                <CreateTaskModal
                    open={adding}
                    onOpenChange={() => setAdding(!adding)}
                    onSubmit={(data) => console.log(data)}
                />
                {column.tasks.length === 0 && !adding && (
                    <div className="flex flex-col items-center py-8 text-gray-400">
                        <div className="mb-2 flex size-8 items-center justify-center rounded-lg border border-dashed border-gray-300">
                            <Plus className="size-4" />
                        </div>
                        <span className="text-xs">No tasks</span>
                    </div>
                )}
            </div>
        </div>
    );
}
