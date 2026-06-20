"use client";

import { Button } from "@/components/ui/shadcn/button";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { cn, todayStr } from "@/libs/utils";
import SidebarEventCard from "@/components/ui/sidebarEventCard/SidebarEventCard";
import { Column, Project, Task } from "@/types/types";
import { CalendarCheckIcon, PlusIcon } from "@phosphor-icons/react";

interface DaySidebarProps {
    dateStr: string;
    tasks: Task[];
    columns?: Column[];
    onOpenCreate: () => void;
    onOpenDetails: (task: Task) => void;
}

export default function DaySidebar({
    dateStr,
    tasks,
    columns,
    onOpenCreate,
    onOpenDetails,
}: Readonly<DaySidebarProps>) {
    const date = new Date(dateStr);
    const isToday = dateStr === todayStr();

    const groupedColumns = columns
        ? columns
              .map((column) => ({
                  ...column,
                  tasks: tasks.filter((task) => task.column.id === column.id),
              }))
              .filter((g) => g.tasks.length > 0)
        : null;

    const groupedProjects = !columns
        ? tasks.reduce(
              (accumulator, task) => {
                  const projectId = task.project.id;

                  if (!accumulator[projectId]) {
                      accumulator[projectId] = {
                          project: task.project,
                          tasks: [],
                      };
                  }

                  accumulator[projectId].tasks.push(task);

                  return accumulator;
              },
              {} as Record<number, { project: Project; tasks: Task[] }>,
          )
        : null;

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
                        onClick={onOpenCreate}
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
                        ) : groupedColumns ? (
                            groupedColumns.map((column) => (
                                <div key={column.id}>
                                    <div className="mb-2 flex items-center gap-1.5 rounded-md px-1.5 py-0.5">
                                        <span className="text-xs font-bold uppercase tracking-wider">
                                            {column.name}
                                        </span>
                                        <span className="ml-1 text-[10px] opacity-60">
                                            ({column.tasks.length})
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {column.tasks.map((task) => (
                                            <SidebarEventCard
                                                key={task.id}
                                                task={task}
                                                onOpen={() =>
                                                    onOpenDetails(task)
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : groupedProjects ? (
                            Object.values(groupedProjects).map((group) => (
                                <div key={group.project.id}>
                                    <div className="mb-2 flex items-center gap-1.5 rounded-md px-1.5 py-0.5">
                                        <div
                                            className="grid size-6 place-content-center rounded-md"
                                            style={{
                                                backgroundColor:
                                                    group.project.color + "33",
                                            }}
                                        >
                                            <span className="text-xs">
                                                {group.project.icon}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider">
                                            {group.project.name}
                                        </span>
                                        <span className="ml-1 text-[10px] opacity-60">
                                            ({group.tasks.length})
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {group.tasks.map((task) => (
                                            <SidebarEventCard
                                                key={task.id}
                                                task={task}
                                                onOpen={() =>
                                                    onOpenDetails(task)
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            tasks.map((task) => (
                                <SidebarEventCard
                                    key={task.id}
                                    task={task}
                                    onOpen={() => onOpenDetails(task)}
                                />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>
        </>
    );
}
