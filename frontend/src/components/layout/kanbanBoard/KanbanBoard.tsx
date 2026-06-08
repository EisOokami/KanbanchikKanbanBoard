"use client";

import { useState } from "react";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
} from "@dnd-kit/core";
import OverlayCard from "@/components/ui/overlayCard/OverlayCard";
import KanbanColumn from "@/components/ui/kanbanColumn/KanbanColumn";
import { Column, ColumnConfig, FilterState, Task } from "@/types/types";
import { Button } from "@/components/ui/shadcn/button";
import {
    Avatar,
    AvatarFallback,
    AvatarGroup,
    AvatarGroupCount,
    AvatarImage,
} from "@/components/ui/shadcn/avatar";
import { ButtonGroup } from "@/components/ui/shadcn/button-group";
import { InviteAssignmentModal } from "@/components/ui/inviteAssigmentModal/InviteAssigmentModal";
import { TaskFilterSheet } from "@/components/ui/taskFilterSheet/TaskFilterSheet";
import { ProjectSettingsDialog } from "@/components/ui/projectSettingsDialog/ProjectSettingsDialog";
import { ProjectListView } from "../projectListView/ProjectListView";
import ProjectCalendarView from "../projectCalendarView/ProjectCalendarView";
import { TaskDetailsSheet } from "@/components/ui/taskDetailsSheet/TaskDetailsSheet";
import { COLUMNS_CONFIG, DEFAULT_FILTER } from "@/constants/constants";
import {
    CalendarDotsIcon,
    FunnelIcon,
    GearSixIcon,
    KanbanIcon,
    ListIcon,
    PlusIcon,
    ShareNetworkIcon,
    UserPlusIcon,
} from "@phosphor-icons/react";
import { CreateTaskModal } from "@/components/ui/createTaskModal/CreateTaskModal";
import { arrayMove } from "@dnd-kit/sortable";

export default function KanbanBoard() {
    const [columns, setColumns] = useState<(ColumnConfig & Column)[]>(
        Object.values(COLUMNS_CONFIG),
    );
    const [activeCard, setActiveCard] = useState<Task | null>(null);
    const [isOpenInvite, setIsOpenInvite] = useState<boolean>(false);
    const [isOpenFilters, setIsOpenFilters] = useState<boolean>(false);
    const [isOpenSettings, setIsOpenSettings] = useState<boolean>(false);
    const [isOpenTaskDetails, setIsOpenTaskDetails] = useState<boolean>(false);
    const [isOpenCreateTask, setIsOpenCreateTask] = useState<boolean>(false);
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER);
    const [selectedMode, setSelectedMode] = useState<
        "kanban" | "list" | "calendar"
    >("kanban");

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    );

    const findColumnByTaskId = (taskId: number) =>
        columns.find((col) => col.tasks.some((t) => t.id === taskId));

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const col = findColumnByTaskId(active.id as number);
        const task = col?.tasks.find((t) => t.id === active.id);
        setActiveCard(task ?? null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeColIdx = columns.findIndex((col) =>
            col.tasks.some((t) => t.id === active.id),
        );
        if (activeColIdx === -1) return;

        const overColIdx = columns.findIndex(
            (col) =>
                col.id === over.id || col.tasks.some((t) => t.id === over.id),
        );
        if (overColIdx === -1 || activeColIdx === overColIdx) return;

        setColumns((prev) => {
            const next = prev.map((col) => ({ ...col, tasks: [...col.tasks] }));
            const task = next[activeColIdx].tasks.find(
                (t) => t.id === active.id,
            )!;
            next[activeColIdx].tasks = next[activeColIdx].tasks.filter(
                (t) => t.id !== active.id,
            );

            const overTaskIdx = next[overColIdx].tasks.findIndex(
                (t) => t.id === over.id,
            );
            if (overTaskIdx === -1) {
                next[overColIdx].tasks.push(task);
            } else {
                next[overColIdx].tasks.splice(overTaskIdx, 0, task);
            }
            return next;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);
        if (!over || active.id === over.id) return;

        const activeColIdx = columns.findIndex((col) =>
            col.tasks.some((t) => t.id === active.id),
        );
        if (activeColIdx === -1) return;

        const overColIdx = columns.findIndex(
            (col) =>
                col.id === over.id || col.tasks.some((t) => t.id === over.id),
        );
        if (overColIdx === -1) return;

        if (activeColIdx === overColIdx) {
            setColumns((prev) => {
                const next = prev.map((col) => ({
                    ...col,
                    tasks: [...col.tasks],
                }));
                const col = next[activeColIdx];
                const oldIdx = col.tasks.findIndex((t) => t.id === active.id);
                const newIdx = col.tasks.findIndex((t) => t.id === over.id);
                if (oldIdx !== -1 && newIdx !== -1) {
                    col.tasks = arrayMove(col.tasks, oldIdx, newIdx);
                }
                return next;
            });
        }
    };

    const handleDeleteCard = () => {};

    const handleChangeMode = (mode: "kanban" | "list" | "calendar") =>
        setSelectedMode(mode);

    const handleIsOpenCreateTask = () => {
        setIsOpenCreateTask(!isOpenCreateTask);
    };

    const viewModes = [
        { id: "kanban", label: "Kanban", icon: KanbanIcon },
        { id: "list", label: "List", icon: ListIcon },
        { id: "calendar", label: "Calendar", icon: CalendarDotsIcon },
    ] as const;

    // const tasks = columns.map((column) => column.tasks).flat(1);

    // const stats = useMemo(
    //     () => ({
    //         total: tasks.length,
    //         inProgress: tasks.filter((t) => t.column === "in_progress").length,
    //         done: tasks.filter((t) => t.column === "done").length,
    //         overdue: tasks.filter((t) => isOverdue(t.due_date, t.column))
    //             .length,
    //     }),
    //     [tasks],
    // );

    return (
        <div className="h-full w-full overflow-y-auto rounded-xl bg-white">
            <header className="sticky top-0 z-10 grid gap-5 border-b bg-white px-8 py-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="grid size-10 place-content-center rounded-md bg-blue-100">
                            <span className="text-lg">⚙️</span>
                        </div>
                        <h1 className="text-2xl font-semibold">
                            Kabanchik: Web Application
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <AvatarGroup>
                            <Avatar className="size-8">
                                <AvatarImage
                                    src="https://github.com/shadcn.png"
                                    alt="@shadcn"
                                />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <Avatar className="size-8">
                                <AvatarImage
                                    src="https://github.com/maxleiter.png"
                                    alt="@maxleiter"
                                />
                                <AvatarFallback>LR</AvatarFallback>
                            </Avatar>
                            <Avatar className="size-8">
                                <AvatarImage
                                    src="https://github.com/evilrabbit.png"
                                    alt="@evilrabbit"
                                />
                                <AvatarFallback>ER</AvatarFallback>
                            </Avatar>
                            <AvatarGroupCount>+3</AvatarGroupCount>
                        </AvatarGroup>
                        <Button
                            variant="outline"
                            onClick={() => setIsOpenInvite(true)}
                        >
                            <UserPlusIcon weight="duotone" />
                            Invite
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="[&_svg]:size-5"
                            onClick={() => setIsOpenSettings(true)}
                        >
                            <ShareNetworkIcon weight="duotone" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="[&_svg]:size-5"
                            onClick={() => setIsOpenSettings(true)}
                        >
                            <GearSixIcon weight="duotone" />
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between">
                    <nav>
                        <ButtonGroup>
                            {viewModes.map(({ id, label, icon: Icon }) => (
                                <Button
                                    key={id}
                                    variant={
                                        selectedMode === id
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => handleChangeMode(id)}
                                    className={
                                        selectedMode === id
                                            ? "pointer-events-none bg-bright-blue text-white"
                                            : ""
                                    }
                                >
                                    <Icon weight="duotone" />
                                    {label}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </nav>
                    <div className="flex gap-3">
                        {/* {selectedMode === "list" && (
                            <div className="hidden items-center gap-1 md:flex">
                                {[
                                    {
                                        label: "Total",
                                        val: stats.total,
                                        col: "text-gray-600",
                                    },
                                    {
                                        label: "In Progress",
                                        val: stats.inProgress,
                                        col: "text-blue-600",
                                    },
                                    {
                                        label: "Done",
                                        val: stats.done,
                                        col: "text-emerald-600",
                                    },
                                    {
                                        label: "Overdue",
                                        val: stats.overdue,
                                        col: "text-rose-600",
                                    },
                                ].map((s, i) => (
                                    <div
                                        key={s.label}
                                        className="flex items-center gap-2"
                                    >
                                        {i > 0 && (
                                            <div className="h-3 w-px bg-gray-200" />
                                        )}
                                        <span className="text-xs text-gray-400">
                                            {s.label}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-xs font-bold",
                                                s.col,
                                            )}
                                        >
                                            {s.val}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )} */}
                        <Button
                            variant="outline"
                            onClick={() => setIsOpenFilters(true)}
                        >
                            <FunnelIcon weight="duotone" />
                            Filter
                        </Button>
                        <Button
                            className="gap-1.5 bg-bright-blue px-3 text-xs hover:bg-blue-600"
                            onClick={handleIsOpenCreateTask}
                        >
                            <PlusIcon weight="duotone" className="size-3.5" />{" "}
                            New Task
                        </Button>
                    </div>
                </div>
            </header>
            <main
                className={
                    selectedMode === "kanban" ? "h-[calc(100svh-187px)]" : ""
                }
            >
                {selectedMode === "kanban" && (
                    <div className="w-full overflow-x-auto p-8">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex w-max items-start gap-4 pb-8">
                                {columns.map((col) => (
                                    <KanbanColumn
                                        key={col.id}
                                        column={col}
                                        onDeleteCard={handleDeleteCard}
                                        isOpenCreateTask={isOpenCreateTask}
                                        onOpenCreateTask={
                                            handleIsOpenCreateTask
                                        }
                                        onOpenDetails={() =>
                                            setIsOpenTaskDetails(
                                                !isOpenTaskDetails,
                                            )
                                        }
                                    />
                                ))}
                            </div>
                            <DragOverlay
                                dropAnimation={{
                                    duration: 160,
                                    easing: "ease-out",
                                }}
                            >
                                {activeCard ? (
                                    <OverlayCard card={activeCard} />
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>
                )}
                {selectedMode === "list" && <ProjectListView />}
                {selectedMode === "calendar" && <ProjectCalendarView />}
            </main>
            <InviteAssignmentModal
                open={isOpenInvite}
                onOpenChange={() => setIsOpenInvite(!isOpenInvite)}
            />
            <TaskFilterSheet
                open={isOpenFilters}
                onOpenChange={() => setIsOpenFilters(!isOpenFilters)}
                filters={filters}
                onFiltersChange={setFilters}
            />
            <ProjectSettingsDialog
                open={isOpenSettings}
                onOpenChange={() => setIsOpenSettings(!isOpenSettings)}
                onSave={(data) => console.log(data)}
            />
            <TaskDetailsSheet
                open={isOpenTaskDetails}
                onOpenChange={() => setIsOpenTaskDetails(!isOpenTaskDetails)}
                onSave={(updated) => console.log(updated)}
            />
            <CreateTaskModal
                open={isOpenCreateTask}
                onOpenChange={handleIsOpenCreateTask}
                onSubmit={(data) => console.log(data)}
            />
        </div>
    );
}
