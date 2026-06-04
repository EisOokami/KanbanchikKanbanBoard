"use client";

import { useState, useCallback, useRef } from "react";
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
    UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
    Settings,
    Link,
    SquareKanban,
    List,
    Calendar,
    ListFilter,
    UserPlus,
} from "lucide-react";
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

export default function KanbanBoard() {
    const [columns, setColumns] = useState<(ColumnConfig & Column)[]>(
        Object.values(COLUMNS_CONFIG),
    );
    const [activeCard, setActiveCard] = useState<Task | null>(null);
    const [isOpenInvite, setIsOpenInvite] = useState(false);
    const [isOpenFilters, setIsOpenFilters] = useState(false);
    const [isOpenSettings, setIsOpenSettings] = useState(false);
    const [isOpenTaskDetails, setIsOpenTaskDetails] = useState(false);
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER);
    const [selectedMode, setSelectedMode] = useState("kanban");

    // Auto-incrementing id for new tasks (number, matching Task.id: number)
    const nextId = useRef(1000);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    );

    // UniqueIdentifier is string | number — Task.id is number, DndKit handles both
    const findColByCardId = useCallback(
        (cardId: UniqueIdentifier) =>
            columns.find((col) =>
                col.tasks.some((t) => t.id === (cardId as number)),
            ),
        [columns],
    );

    const handleDragStart = (event: DragStartEvent) => {
        const col = findColByCardId(event.active.id);
        if (col) {
            setActiveCard(
                col.tasks.find((t) => t.id === event.active.id) ?? null,
            );
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const fromCol = findColByCardId(active.id);
        const toCol =
            columns.find((c) => c.id === over.id) ?? findColByCardId(over.id);

        if (!fromCol || !toCol || fromCol.id === toCol.id) return;

        setColumns((prev) => {
            const card = fromCol.tasks.find((t) => t.id === active.id);
            if (!card) return prev;

            const overCard = toCol.tasks.find((t) => t.id === over.id);
            const insertIdx =
                overCard !== undefined
                    ? toCol.tasks.indexOf(overCard)
                    : toCol.tasks.length;

            return prev.map((col) => {
                if (col.id === fromCol.id)
                    return {
                        ...col,
                        tasks: col.tasks.filter((t) => t.id !== active.id),
                    };
                if (col.id === toCol.id) {
                    const next = [...col.tasks];
                    next.splice(insertIdx, 0, card);
                    return { ...col, tasks: next };
                }
                return col;
            });
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);
        if (!over) return;

        const fromCol = findColByCardId(active.id);
        const toCol =
            columns.find((c) => c.id === over.id) ?? findColByCardId(over.id);

        if (!fromCol || !toCol || fromCol.id !== toCol.id) return;

        setColumns((prev) =>
            prev.map((col) => {
                if (col.id !== fromCol.id) return col;
                const oldIdx = col.tasks.findIndex((t) => t.id === active.id);
                const newIdx = col.tasks.findIndex((t) => t.id === over.id);
                if (oldIdx === newIdx) return col;
                return { ...col, tasks: arrayMove(col.tasks, oldIdx, newIdx) };
            }),
        );
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleAddCard = (_colId: number, _title: string) => {
        nextId.current += 1;
    };

    const handleDeleteCard = () => {};

    const handleChangeMode = (mode: string) => setSelectedMode(mode);

    const viewModes = [
        { id: "kanban", label: "Kanban", icon: SquareKanban },
        { id: "list", label: "List", icon: List },
        { id: "calendar", label: "Calendar", icon: Calendar },
    ] as const;

    return (
        <div className="h-full w-full">
            <header className="z-20 grid gap-5 border border-b px-8 py-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                        <div className="grid size-10 place-content-center rounded-md bg-blue-100">
                            <span className="text-lg">⚙️</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-semibold">
                                    Kabanchik: Web Application
                                </h1>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="size-8 rounded-full [&_svg]:size-3.5"
                                >
                                    <Link />
                                </Button>
                            </div>
                            <p className="w-3/4 text-sm text-muted-foreground">
                                Lorem ipsum dolor sit amet consectetur
                                adipisicing elit. Numquam provident magni
                                deleniti suscipit ab.
                            </p>
                        </div>
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
                            onClick={() => setIsOpenInvite(true)}
                            className="bg-bright-blue hover:bg-blue-600"
                        >
                            <UserPlus />
                            Invite
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="[&_svg]:size-5"
                            onClick={() => setIsOpenSettings(true)}
                        >
                            <Settings />
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
                                    <Icon />
                                    {label}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </nav>
                    <Button
                        onClick={() => setIsOpenFilters(true)}
                        className="bg-bright-blue hover:bg-blue-600"
                    >
                        <ListFilter />
                        Filter
                    </Button>
                </div>
            </header>
            <main className="h-[calc(100svh-170px)]">
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
                                        onAddCard={handleAddCard}
                                        onDeleteCard={handleDeleteCard}
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
        </div>
    );
}
