"use client";

import { useCallback, useState } from "react";
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
import { Column, FilterState, Project, Task } from "@/types/types";
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
import { ProjectSettingsDialog } from "@/components/ui/projectSettingsDialog/ProjectSettingsDialog";
import { ProjectListView } from "../projectListView/ProjectListView";
import ProjectCalendarView from "../projectCalendarView/ProjectCalendarView";
import { TaskDetailsSheet } from "@/components/ui/taskDetailsSheet/TaskDetailsSheet";
import { DEFAULT_FILTER } from "@/constants/constants";
import {
    CalendarDotsIcon,
    FunnelIcon,
    GearSixIcon,
    KanbanIcon,
    ListIcon,
    PlusIcon,
    UserPlusIcon,
} from "@phosphor-icons/react";
import { CreateTaskModal } from "@/components/ui/createTaskModal/CreateTaskModal";
import { arrayMove } from "@dnd-kit/sortable";
import { getInitials } from "@/libs/utils";

interface KanbanBoardProps {
    projectData: Project;
}

export default function KanbanBoard({
    projectData,
}: Readonly<KanbanBoardProps>) {
    const [columns, setColumns] = useState<Column[]>(
        Object.values(projectData.columns),
    );
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showInvite, setshowInvite] = useState<boolean>(false);
    const [showFilters, setshowFilters] = useState<boolean>(false);
    const [showSettings, setshowSettings] = useState<boolean>(false);
    const [showTaskDetails, setshowTaskDetails] = useState<boolean>(false);
    const [showCreateTask, setshowCreateTask] = useState<boolean>(false);
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER);
    const [selectedMode, setSelectedMode] = useState<
        "kanban" | "list" | "calendar"
    >("kanban");

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;

        const task = columns
            .flatMap((col) => col.tasks)
            .find((t) => t.id === active.id);

        setActiveTask(task || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeColumn = columns.find((col) =>
            col.tasks.some((t) => t.id === activeId),
        );
        const overColumn = columns.find(
            (col) =>
                col.id === overId || col.tasks.some((t) => t.id === overId),
        );

        if (!activeColumn || !overColumn) return;

        if (activeColumn.id !== overColumn.id) {
            setColumns((prev) => {
                const activeItems = activeColumn.tasks;
                const overItems = overColumn.tasks;

                const activeIndex = activeItems.findIndex(
                    (t) => t.id === activeId,
                );
                const overIndex = overItems.findIndex((t) => t.id === overId);

                const activeTask = activeItems[activeIndex];

                const newActiveItems = activeItems.filter(
                    (t) => t.id !== activeId,
                );

                const newOverItems = [...overItems];
                const insertIndex =
                    overId === overColumn.id
                        ? newOverItems.length
                        : overIndex >= 0
                          ? overIndex
                          : newOverItems.length;

                newOverItems.splice(insertIndex, 0, activeTask);

                return prev.map((col) => {
                    if (col.id === activeColumn.id) {
                        return { ...col, tasks: newActiveItems };
                    }
                    if (col.id === overColumn.id) {
                        return { ...col, tasks: newOverItems };
                    }
                    return col;
                });
            });
        } else {
            setColumns((prev) => {
                const column = prev.find((c) => c.id === activeColumn.id);
                if (!column) return prev;

                const oldIndex = column.tasks.findIndex(
                    (t) => t.id === activeId,
                );
                const newIndex = column.tasks.findIndex((t) => t.id === overId);

                return prev.map((col) => {
                    if (col.id === column.id) {
                        return {
                            ...col,
                            tasks: arrayMove(col.tasks, oldIndex, newIndex),
                        };
                    }
                    return col;
                });
            });
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleDragEnd = (event: DragEndEvent) => {
        setActiveTask(null);
    };

    const handleDeleteTask = () => {};

    const handleChangeMode = (mode: "kanban" | "list" | "calendar") =>
        setSelectedMode(mode);

    const handleshowCreateTask = () => {
        setshowCreateTask(!showCreateTask);
    };

    const handleshowTaskDetails = useCallback(() => {
        setshowTaskDetails(!showTaskDetails);
    }, [showTaskDetails]);

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
                            onClick={() => setshowInvite(true)}
                        >
                            <UserPlusIcon weight="duotone" />
                            Invite
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="[&_svg]:size-5"
                            onClick={() => setshowSettings(true)}
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
                            onClick={() => setshowFilters(true)}
                        >
                            <FunnelIcon weight="duotone" />
                            Filter
                        </Button>
                        <Button
                            className="gap-1.5 bg-bright-blue px-3 text-xs hover:bg-blue-600"
                            onClick={handleshowCreateTask}
                        >
                            <PlusIcon weight="duotone" className="size-3.5" />{" "}
                            New Task
                        </Button>
                    </div>
                </div>
            </header>
            <main
                className={
                    selectedMode === "kanban" ? "h-[calc(100svh-155px)]" : ""
                }
            >
                {selectedMode === "kanban" && (
                    <div className="h-full w-full overflow-x-auto p-8">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCorners}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="flex w-max items-start gap-4 pb-8">
                                {columns.map((column) => (
                                    <KanbanColumn
                                        key={column.id}
                                        column={column}
                                        onDeleteTask={handleDeleteTask}
                                        showCreateTask={showCreateTask}
                                        onOpenCreateTask={handleshowCreateTask}
                                        onOpenDetails={(task: Task) => {
                                            handleshowTaskDetails();
                                            setSelectedTask(task);
                                        }}
                                    />
                                ))}
                            </div>
                            <DragOverlay
                                dropAnimation={{
                                    duration: 160,
                                    easing: "ease-out",
                                }}
                            >
                                {activeTask ? (
                                    <OverlayTask task={activeTask} />
                                ) : null}
                            </DragOverlay>
                        </DndContext>
                    </div>
                )}
                {selectedMode === "list" && (
                    <ProjectListView
                        columns={columns}
                        setColumns={setColumns}
                        onOpenDetails={(task: Task) => {
                            handleshowTaskDetails();
                            setSelectedTask(task);
                        }}
                    />
                )}
                {selectedMode === "calendar" && (
                    <ProjectCalendarView
                        columns={columns}
                        onOpenDetails={(task: Task) => {
                            handleshowTaskDetails();
                            setSelectedTask(task);
                        }}
                    />
                )}
            </main>
            <InviteMemberModal
                open={showInvite}
                onOpenChange={() => setshowInvite(!showInvite)}
                membersData={projectData.members}
            />
            <TaskFilterSheet
                open={showFilters}
                onOpenChange={() => setshowFilters(!showFilters)}
                filters={filters}
                onFiltersChange={setFilters}
                projectData={projectData}
            />
            <ProjectSettingsDialog
                open={showSettings}
                onOpenChange={() => setshowSettings(!showSettings)}
                onSave={(data) => console.log(data)}
                columnsData={columns}
                projectData={projectData}
            />
            {selectedTask && (
                <TaskDetailsSheet
                    open={showTaskDetails}
                    onOpenChange={handleshowTaskDetails}
                    onSave={(updated) => console.log(updated)}
                    selectedTask={selectedTask}
                    projectData={projectData}
                />
            )}
            <CreateTaskModal
                open={showCreateTask}
                onOpenChange={handleshowCreateTask}
                onSubmit={(data) => console.log(data)}
                projectData={projectData}
            />
        </div>
    );
}
