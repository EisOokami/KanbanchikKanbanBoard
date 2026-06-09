"use client";

import { useState } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { cn, todayStr } from "@/libs/utils";
import { CreateTaskModal } from "@/components/ui/createTaskModal/CreateTaskModal";
import { TaskDetailsSheet } from "@/components/ui/taskDetailsSheet/TaskDetailsSheet";
import SidebarEventCard from "@/components/ui/sidebarEventCard/SidebarEventCard";
import { Task } from "@/types/types";
import { COLUMNS_CONFIG } from "@/constants/constants";
import { CalendarCheckIcon, PlusIcon } from "@phosphor-icons/react";

interface DaySidebarProps {
    dateStr: string;
    tasks: Task[];
}

export default function DaySidebar({ dateStr, tasks }: DaySidebarProps) {
    const [addOpen, setAddOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const date = new Date(dateStr + "T00:00:00");
    const isToday = dateStr === todayStr();

    const grouped = (
        Object.keys(COLUMNS_CONFIG) as (keyof typeof COLUMNS_CONFIG)[]
    )
        .map((key) => ({
            key,
            cfg: COLUMNS_CONFIG[key],
            tasks: tasks.filter((t) => t.column === key),
        }))
        .filter((g) => g.tasks.length > 0);

    return (
        <>
            <div className="flex w-72 flex-shrink-0 flex-col border-l">
                <div className="border-b p-4">
                    <div className="mb-0.5 flex items-center gap-2">
                        <span
                            className={cn(
                                "text-3xl font-bold",
                                isToday ? "text-bright-blue" : "text-gray-800",
                            )}
                        >
                            {date.getDate()}
                        </span>
                        {isToday && (
                            <span className="rounded-full border border-blue-200 bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                                Today
                            </span>
                        )}
                    </div>
                    <p className="text-xs font-medium text-gray-500">
                        {date.toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            year: "numeric",
                        })}
                    </p>
                </div>
                <div className="border-b px-4 py-3">
                    <Button
                        onClick={() => setAddOpen(true)}
                        size="sm"
                        className="h-8 w-full gap-1.5 bg-bright-blue text-xs hover:bg-blue-600"
                    >
                        <PlusIcon weight="duotone" className="size-3.5" /> Add
                        Task
                    </Button>
                </div>
                <ScrollArea className="flex-1">
                    <div className="space-y-5 px-4 py-3">
                        {tasks.length === 0 ? (
                            <div className="py-10 text-center text-gray-400">
                                <CalendarCheckIcon
                                    weight="duotone"
                                    className="mx-auto mb-2 size-8 opacity-25"
                                />
                                <p className="text-xs font-medium">
                                    No tasks scheduled
                                </p>
                                <p className="mt-0.5 text-xs text-gray-300">
                                    Press &quot;Add Task&quot; to get started
                                </p>
                            </div>
                        ) : (
                            grouped.map(({ key, cfg, tasks: group }) => (
                                <div key={key}>
                                    <div
                                        className="mb-2 flex items-center gap-1.5 rounded-md px-1.5 py-0.5"
                                        style={{
                                            color: cfg.color,
                                        }}
                                    >
                                        <span className="text-xs font-bold uppercase tracking-wider">
                                            {cfg.label}
                                        </span>
                                        <span className="ml-1 text-[10px] opacity-60">
                                            ({group.length})
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {group.map((task) => (
                                            <SidebarEventCard
                                                key={task.id}
                                                task={task}
                                                onOpen={() =>
                                                    setSelectedTask(task)
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
            <CreateTaskModal
                open={addOpen}
                onOpenChange={() => setAddOpen((v) => !v)}
                onSubmit={(data) => console.log(data)}
            />
            <TaskDetailsSheet
                open={selectedTask !== null}
                onOpenChange={(v) => {
                    if (!v) setSelectedTask(null);
                }}
                task={selectedTask ?? undefined}
                onSave={(updated) => console.log(updated)}
            />
        </>
    );
}
