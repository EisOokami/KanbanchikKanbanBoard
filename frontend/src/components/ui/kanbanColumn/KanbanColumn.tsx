"use client";

import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useRef } from "react";
import KanbanTask from "../kanbanTask/KanbanTask";
import { Column, Task } from "@/types/types";
import { PlusIcon } from "@phosphor-icons/react";

interface KanbanColumnProps {
    column: Column;
    onDeleteTask: () => void;
    onOpenDetails: (task: Task) => void;
    showCreateTask: boolean;
    onOpenCreateTask: (columnId?: number) => void;
}

export default function KanbanColumn({
    column,
    onDeleteTask,
    onOpenDetails,
    showCreateTask,
    onOpenCreateTask,
}: Readonly<KanbanColumnProps>) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const { setNodeRef, isOver } = useDroppable({ id: column.id });

    const startAdding = () => {
        onOpenCreateTask(column.id);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const wipExceeded =
        column.wip_limit > 0 && column.tasks.length >= column.wip_limit;

    return (
        <div
            className={`flex w-[320px] flex-shrink-0 flex-col rounded-xl p-2 transition-colors duration-150 ${
                isOver ? "bg-gray-200" : "bg-gray-100"
            }`}
        >
            <div className="relative mb-3 flex items-center justify-between rounded-md border bg-white px-3 py-2">
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{column.name}</span>
                    <span className="text-center text-xs">
                        ({column.tasks.length})
                    </span>
                    {wipExceeded && (
                        <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-500">
                            WIP
                        </span>
                    )}
                </div>
                <button
                    onClick={startAdding}
                    className="absolute right-3 flex size-5 items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
                >
                    <PlusIcon weight="duotone" className="size-3.5" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                <SortableContext
                    items={column.tasks.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div
                        ref={setNodeRef}
                        className="flex min-h-[40px] flex-col gap-2"
                    >
                        {column.tasks.map((task) => (
                            <KanbanTask
                                key={task.id}
                                task={task}
                                onDelete={onDeleteTask}
                                onOpenDetails={onOpenDetails}
                            />
                        ))}
                    </div>
                </SortableContext>
                {column.tasks.length === 0 && !showCreateTask && (
                    <div className="flex flex-col items-center py-8 text-gray-400">
                        <div className="mb-2 flex size-8 items-center justify-center rounded-lg border border-dashed border-gray-300">
                            <PlusIcon weight="duotone" className="size-4" />
                        </div>
                        <span className="text-xs">No tasks</span>
                    </div>
                )}
            </div>
        </div>
    );
}
