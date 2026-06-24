"use client";

import { useCallback, useMemo, useRef, useState } from "react";
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
import OverlayTask from "@/components/ui/overlayTask/OverlayTask";
import KanbanColumn from "@/components/ui/kanbanColumn/KanbanColumn";
import {
    Column,
    FilterState,
    Project as IProject,
    Task,
    User,
} from "@/types/types";
import { Button } from "@/components/ui/shadcn/button";
import {
    Avatar,
    AvatarFallback,
    AvatarGroup,
    AvatarGroupCount,
    AvatarImage,
} from "@/components/ui/shadcn/avatar";
import { ButtonGroup } from "@/components/ui/shadcn/button-group";
import { InviteMemberModal } from "@/components/ui/inviteMemberModal/InviteMemberModal";
import { TaskFilterSheet } from "@/components/ui/taskFilterSheet/TaskFilterSheet";
import { ProjectSettingsModal } from "@/components/ui/projectSettingsModal/ProjectSettingsModal";
import { ProjectListView } from "../projectListView/ProjectListView";
import ProjectCalendarView from "../projectCalendarView/ProjectCalendarView";
import { TaskDetailsSheet } from "@/components/ui/taskDetailsSheet/TaskDetailsSheet";
import {
    CalendarDotsIcon,
    ClipboardTextIcon,
    FunnelIcon,
    GearSixIcon,
    KanbanIcon,
    ListIcon,
    PlusIcon,
    UserPlusIcon,
} from "@phosphor-icons/react";
import { CreateTaskModal } from "@/components/ui/createTaskModal/CreateTaskModal";
import { getInitials } from "@/libs/utils";
import { deleteTaskAction, moveTaskAction } from "@/data/actions";
import {
    getSurroundingPositions,
    midpoint,
    needsRebalance,
    rebalanceTasks,
} from "@/libs/project";
import { DEFAULT_FILTER } from "@/constants/taskFilterSheet";
import { applyTaskFilters } from "@/libs/taskFilterSheet";
import ListDragOverlay from "@/components/ui/listDragOverlay/ListDragOverlay";

interface ProjectProps {
    userData: User;
    projectData: IProject;
}

export default function Project({
    userData,
    projectData,
}: Readonly<ProjectProps>) {
    const [columns, setColumns] = useState<Column[]>(
        Object.values(projectData.columns),
    );
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showInvite, setShowInvite] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showTaskDetails, setShowTaskDetails] = useState<boolean>(false);
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER);
    const [selectedMode, setSelectedMode] = useState<
        "kanban" | "list" | "calendar"
    >("kanban");
    const [createTaskState, setCreateTaskState] = useState<{
        isOpen: boolean;
        columnId: number | undefined;
    }>({ isOpen: false, columnId: undefined });
    const dragSnapshot = useRef<{ columnId: number; position: number } | null>(
        null,
    );
    const filteredColumns = useMemo(
        () => applyTaskFilters(columns, filters),
        [columns, filters],
    );

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    );

    const handleDragStart = (event: DragStartEvent) => {
        const activeId = event.active.id as number;
        const column = columns.find((column) =>
            column.tasks.some((task) => task.id === activeId),
        );

        if (!column) {
            return;
        }

        const task = column.tasks.find((task) => task.id === activeId) ?? null;

        setActiveTask(task);

        dragSnapshot.current = task
            ? { columnId: column.id, position: task.position }
            : null;
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const activeId = active.id as number;
        const overId = over.id as number;

        setColumns((prev) => {
            const activeColumn = prev.find((column) =>
                column.tasks.some((task) => task.id === activeId),
            );
            const overColumn = prev.find(
                (column) =>
                    column.id === overId ||
                    column.tasks.some((task) => task.id === overId),
            );

            if (!activeColumn || !overColumn) {
                return prev;
            }

            const activeTask = activeColumn.tasks.find(
                (task) => task.id === activeId,
            );

            if (!activeTask) {
                return prev;
            }

            if (activeColumn.id !== overColumn.id) {
                const wipExceeded =
                    overColumn.wip_limit &&
                    overColumn.wip_limit > 0 &&
                    overColumn.tasks.length >= overColumn.wip_limit;

                if (wipExceeded) {
                    return prev;
                }
            }

            if (activeColumn.id === overColumn.id) {
                const sorted = [...activeColumn.tasks].sort(
                    (a, b) => a.position - b.position,
                );
                const fromIndex = sorted.findIndex(
                    (task) => task.id === activeId,
                );
                const rawToIndex = sorted.findIndex(
                    (task) => task.id === overId,
                );

                if (fromIndex === rawToIndex || rawToIndex === -1) {
                    return prev;
                }

                const withoutActive = sorted.filter(
                    (task) => task.id !== activeId,
                );
                const insertIndex = rawToIndex;

                const { prev: p, next: n } = getSurroundingPositions(
                    withoutActive,
                    insertIndex,
                );
                const newPosition = midpoint(p, n);

                const result = [...withoutActive];
                result.splice(insertIndex, 0, {
                    ...activeTask,
                    position: newPosition,
                });

                const updatedTasks = needsRebalance(p, n)
                    ? rebalanceTasks(result)
                    : result;

                return prev.map((column) =>
                    column.id === activeColumn.id
                        ? { ...column, tasks: updatedTasks }
                        : column,
                );
            }

            const newActiveItems = activeColumn.tasks.filter(
                (task) => task.id !== activeId,
            );
            const overTasks = [...overColumn.tasks].sort(
                (a, b) => a.position - b.position,
            );

            const overTaskIndex = overTasks.findIndex(
                (task) => task.id === overId,
            );
            const insertIndex =
                overId === overColumn.id
                    ? overTasks.length
                    : overTaskIndex >= 0
                      ? overTaskIndex
                      : overTasks.length;

            const { prev: p, next: n } = getSurroundingPositions(
                overTasks,
                insertIndex,
            );
            const newPosition = midpoint(p, n);

            let newOverItems: Task[];

            if (needsRebalance(p, n)) {
                const draft = [...overTasks];

                draft.splice(insertIndex, 0, {
                    ...activeTask,
                    position: newPosition,
                    column: {
                        ...activeTask.column,
                        id: overColumn.id,
                        name: overColumn.name,
                    },
                });

                newOverItems = rebalanceTasks(draft);
            } else {
                newOverItems = [...overTasks];
                newOverItems.splice(insertIndex, 0, {
                    ...activeTask,
                    position: newPosition,
                    column: {
                        ...activeTask.column,
                        id: overColumn.id,
                        name: overColumn.name,
                    },
                });
            }

            return prev.map((column) => {
                if (column.id === activeColumn.id) {
                    return { ...column, tasks: newActiveItems };
                }

                if (column.id === overColumn.id) {
                    return { ...column, tasks: newOverItems };
                }

                return column;
            });
        });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active } = event;

        setActiveTask(null);

        const activeId = active.id as number;

        const finalCol = columns.find((column) =>
            column.tasks.some((task) => task.id === activeId),
        );

        if (!finalCol) {
            return;
        }

        const finalTask = finalCol.tasks.find((task) => task.id === activeId);
        const snapshot = dragSnapshot.current;
        dragSnapshot.current = null;

        if (!finalTask) {
            return;
        }

        if (
            snapshot &&
            snapshot.columnId === finalCol.id &&
            snapshot.position === finalTask.position
        ) {
            return;
        }

        await moveTaskAction({
            taskId: activeId,
            columnId: finalCol.id,
            position: finalTask.position,
            projectId: projectData.id,
        });
    };

    const handleDeleteTask = useCallback(
        async (id: number) => {
            setColumns((prevState) =>
                prevState.map((column) => ({
                    ...column,
                    tasks: column.tasks.filter((task) => task.id !== id),
                })),
            );

            const result = await deleteTaskAction(id, "/project/[slug]");

            if (!result || !result.ok) {
                setColumns(Object.values(projectData.columns));
            }
        },
        [projectData],
    );

    const handleChangeMode = (mode: "kanban" | "list" | "calendar") =>
        setSelectedMode(mode);

    const handleToggleCreateTask = (columnId?: number, data?: Task) => {
        setCreateTaskState((prevState) => ({
            isOpen: !prevState.isOpen,
            columnId,
        }));

        if (data) {
            setColumns((prevState) =>
                prevState.map((column) => ({
                    ...column,
                    tasks:
                        data.column.id === column.id
                            ? [...column.tasks, data]
                            : column.tasks,
                })),
            );
        }
    };

    const handleShowTaskDetails = useCallback(
        (open?: boolean, data?: Task) => {
            setShowTaskDetails(
                typeof open === "boolean" ? open : !showTaskDetails,
            );

            if (data) {
                setColumns((prevState) =>
                    prevState.map((column) => ({
                        ...column,
                        tasks:
                            data.column.id === column.id
                                ? column.tasks.map((task) =>
                                      task.id === data.id ? data : task,
                                  )
                                : column.tasks,
                    })),
                );
            }
        },
        [showTaskDetails],
    );

    const handleShowProjectSettings = useCallback(
        (open?: boolean, data?: IProject) => {
            setShowSettings(typeof open === "boolean" ? open : !showSettings);

            if (data) {
                setColumns(data.columns);
            }
        },
        [showSettings],
    );

    const viewModes = [
        { id: "kanban", label: "Kanban", icon: KanbanIcon },
        { id: "list", label: "List", icon: ListIcon },
        { id: "calendar", label: "Calendar", icon: CalendarDotsIcon },
    ] as const;

    const hasTasks = columns.some((column) => column.tasks.length > 0);

    return (
        <div className="flex h-full w-full flex-col rounded-xl bg-white">
            <header className="z-10 grid shrink-0 gap-5 border-b bg-white px-8 py-4">
                <div className="flex items-start justify-between">
                    <div className="w-full space-y-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="grid size-10 place-content-center rounded-md"
                                style={{
                                    backgroundColor: projectData.color + "33",
                                }}
                            >
                                <span className="text-lg">
                                    {projectData.icon}
                                </span>
                            </div>
                            <h1 className="text-2xl font-semibold">
                                {projectData.name}
                            </h1>
                        </div>
                        {projectData.description && (
                            <p className="min-h-14 w-3/4 rounded-md bg-gray-100 px-3 py-2 text-gray-600">
                                {projectData.description}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <AvatarGroup>
                            {projectData.members.slice(0, 3).map((member) => (
                                <Avatar key={member.id} className="size-8">
                                    <AvatarImage
                                        src={member.avatar_url}
                                        alt={member.name}
                                    />
                                    <AvatarFallback>
                                        {getInitials(
                                            member.name,
                                            member.surname,
                                        )}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {projectData.members.length > 3 && (
                                <AvatarGroupCount>+3</AvatarGroupCount>
                            )}
                        </AvatarGroup>
                        <Button
                            variant="outline"
                            onClick={() => setShowInvite(true)}
                        >
                            <UserPlusIcon weight="duotone" />
                            Invite
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="[&_svg]:size-5"
                            onClick={() => handleShowProjectSettings(true)}
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
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(true)}
                        >
                            <FunnelIcon weight="duotone" />
                            Filter
                        </Button>
                        <Button
                            className="gap-1.5 bg-bright-blue px-3 text-xs hover:bg-blue-600"
                            onClick={() => handleToggleCreateTask()}
                        >
                            <PlusIcon weight="duotone" className="size-3.5" />{" "}
                            New Task
                        </Button>
                    </div>
                </div>
            </header>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <main className="flex min-h-0 flex-1 flex-col">
                    {!hasTasks ? (
                        <div className="flex h-full flex-1 items-center justify-center px-6">
                            <div className="flex max-w-md flex-col items-center text-center">
                                <div className="mb-5 flex size-20 items-center justify-center rounded-2xl bg-gray-100">
                                    <ClipboardTextIcon
                                        weight="duotone"
                                        className="size-10 text-gray-400"
                                    />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900">
                                    No tasks yet
                                </h2>
                                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                    Start by creating your first task, inviting
                                    teammates, or importing existing work into
                                    this project.
                                </p>
                                <div className="mt-6 flex items-center gap-3">
                                    <Button
                                        className="gap-1.5 bg-bright-blue px-4 py-2 text-sm hover:bg-blue-600"
                                        onClick={() => handleToggleCreateTask()}
                                    >
                                        <PlusIcon
                                            weight="duotone"
                                            className="size-3.5"
                                        />{" "}
                                        Create task
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {selectedMode === "kanban" && (
                                <div className="overflow-x-auto p-8">
                                    <div className="flex items-start gap-4">
                                        {filteredColumns.map((column) => (
                                            <KanbanColumn
                                                key={column.id}
                                                column={column}
                                                onDeleteTask={handleDeleteTask}
                                                showCreateTask={
                                                    createTaskState.isOpen
                                                }
                                                onOpenCreateTask={
                                                    handleToggleCreateTask
                                                }
                                                onOpenDetails={(task: Task) => {
                                                    handleShowTaskDetails();
                                                    setSelectedTask(task);
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedMode === "list" && (
                                <ProjectListView
                                    columns={filteredColumns}
                                    setColumns={setColumns}
                                    activeTask={activeTask}
                                    onOpenDetails={(task: Task) => {
                                        handleShowTaskDetails();
                                        setSelectedTask(task);
                                    }}
                                />
                            )}
                            {selectedMode === "calendar" && (
                                <ProjectCalendarView
                                    columns={filteredColumns}
                                    onOpenDetails={(task: Task) => {
                                        handleShowTaskDetails();
                                        setSelectedTask(task);
                                    }}
                                />
                            )}
                        </>
                    )}
                </main>
                <DragOverlay
                    dropAnimation={{
                        duration: 160,
                        easing: "ease-out",
                    }}
                >
                    {activeTask ? (
                        selectedMode === "kanban" ? (
                            <OverlayTask task={activeTask} />
                        ) : (
                            <ListDragOverlay task={activeTask} />
                        )
                    ) : null}
                </DragOverlay>
            </DndContext>
            <InviteMemberModal
                open={showInvite}
                onOpenChange={() => setShowInvite(!showInvite)}
                projectData={projectData}
            />
            <TaskFilterSheet
                open={showFilters}
                onOpenChange={() => setShowFilters(!showFilters)}
                filters={filters}
                onFiltersChange={setFilters}
                projectData={projectData}
            />
            <ProjectSettingsModal
                open={showSettings}
                onOpenChange={handleShowProjectSettings}
                columnsData={columns}
                projectData={projectData}
            />
            {selectedTask && (
                <TaskDetailsSheet
                    key={selectedTask.id}
                    open={showTaskDetails}
                    onOpenChange={handleShowTaskDetails}
                    selectedTask={selectedTask}
                    projectData={projectData}
                    userData={userData}
                    currentPath="/project/[slug]"
                />
            )}
            <CreateTaskModal
                open={createTaskState.isOpen}
                onOpenChange={(open, data) =>
                    handleToggleCreateTask(undefined, data)
                }
                projectData={projectData}
                columnId={createTaskState.columnId}
                currentPath="/project/[slug]"
            />
        </div>
    );
}
