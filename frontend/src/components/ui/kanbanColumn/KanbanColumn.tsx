"use client";

import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useRef } from "react";
import KanbanTask from "../kanbanTask/KanbanTask";
import { Column, Task, User } from "@/types/types";
import { DotsSixVerticalIcon, PlusIcon } from "@phosphor-icons/react";
import { cn } from "@/libs/utils";
import { Button } from "../shadcn/button";
import { CSS } from "@dnd-kit/utilities";

interface KanbanColumnProps {
    column: Column;
    showCreateTask: boolean;
    showPriorityEmoji: boolean;
    userData: User;
    onDeleteTask: (id: number) => void;
    onOpenDetails: (task: Task) => void;
    onOpenCreateTask: (columnId?: number) => void;
}

export default function KanbanColumn({
    column,
    showCreateTask,
    showPriorityEmoji,
    userData,
    onDeleteTask,
    onOpenDetails,
    onOpenCreateTask,
}: Readonly<KanbanColumnProps>) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const { setNodeRef, isOver } = useDroppable({ id: column.id });

    const {
        attributes,
        listeners,
        setNodeRef: setSortableRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `column-${column.id}`,
        data: { type: "column", column },
        disabled: !(userData.role === "admin" || userData.role === "owner"),
    });

    const startAdding = () => {
        onOpenCreateTask(column.id);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const wipExceeded =
        column.wip_limit &&
        column.wip_limit > 0 &&
        column.tasks.length >= column.wip_limit;

    return (
        <div
            ref={setSortableRef}
            style={{ transform: CSS.Translate.toString(transform), transition }}
            className={cn(
                "flex w-[320px] flex-shrink-0 flex-col rounded-xl p-2 transition-colors duration-150",
                isOver ? "bg-column-is-over" : "bg-column",
                isDragging && "opacity-40",
            )}
        >
            <div className="relative mb-3 flex items-center justify-between rounded-md border border-border bg-background-secondary px-3 py-2">
                <div className="flex items-center gap-1.5">
                    {userData.role === "admin" ||
                        (userData.role === "owner" && (
                            <button
                                ref={setActivatorNodeRef}
                                {...attributes}
                                {...listeners}
                                type="button"
                                className="-ml-1 cursor-grab touch-none text-control-text active:cursor-grabbing"
                            >
                                <DotsSixVerticalIcon
                                    weight="bold"
                                    className="size-4"
                                />
                            </button>
                        ))}
                    <span className="text-sm font-medium">{column.name}</span>
                    <span className="text-center text-xs">
                        ({column.tasks.length})
                    </span>
                    {wipExceeded && (
                        <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-500 dark:bg-rose-900">
                            WIP
                        </span>
                    )}
                </div>
                {!wipExceeded &&
                    (userData.role === "admin" ||
                        userData.role === "owner" ||
                        userData.role === "member") && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={startAdding}
                            className="absolute right-3 size-5 text-control-text hover:bg-control-active"
                        >
                            <PlusIcon weight="duotone" className="size-3.5" />
                        </Button>
                    )}
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
                                userData={userData}
                                showPriorityEmoji={showPriorityEmoji}
                                onDelete={onDeleteTask}
                                onOpenDetails={onOpenDetails}
                            />
                        ))}
                    </div>
                </SortableContext>
                {column.tasks.length === 0 && !showCreateTask && (
                    <div className="flex flex-col items-center py-8 text-gray-400">
                        <div className="mb-2 flex size-8 items-center justify-center rounded-lg border border-dashed border-border">
                            <PlusIcon weight="duotone" className="size-4" />
                        </div>
                        <span className="text-xs">No tasks</span>
                    </div>
                )}
            </div>
        </div>
    );
}
