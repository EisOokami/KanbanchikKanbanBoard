"use client";

import { useState, useCallback } from "react";
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
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
    CheckCircle2,
    Circle,
    Loader,
    Clock,
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
import { IColumn } from "@/interfaces/interfaces";
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
import {
    TaskFilters,
    TaskFilterSheet,
} from "@/components/ui/taskFilterSheet/TaskFilterSheet";
import { ProjectSettingsDialog } from "@/components/ui/projectSettingsDialog/ProjectSettingsDialog";
import { ProjectListView } from "../projectListView/ProjectListView";
import { ProjectCalendarView } from "../projectCalendarView/ProjectCalendarView";
import { TaskDetailsSheet } from "@/components/ui/taskDetailsSheet/TaskDetailsSheet";

const members = [
    { id: "u2", name: "Dmytro P.", avatar: "" },
    { id: "u5", name: "Maria T.", avatar: "" },
    { id: "u4", name: "Ivan S.", avatar: "" },
    { id: "u6", name: "Serhii L.", avatar: "" },
    { id: "u1", name: "Anna K.", avatar: "" },
    { id: "u7", name: "Yulia B.", avatar: "" },
    { id: "u8", name: "Kostya V.", avatar: "" },
    { id: "u9", name: "Natasha R.", avatar: "" },
];

const initialColumns = [
    {
        id: "backlog",
        title: "Backlog",
        color: "#64748b",
        icon: Circle,
        cards: [
            {
                id: "t1",
                title: "Research competitor pricing models",
                tag: "Research",
                priority: "low",
                date: "Feb 28",
            },
            {
                id: "t2",
                title: "Define API schema for notifications",
                tag: "Backend",
                priority: "medium",
                date: "Mar 2",
            },
            {
                id: "t3",
                title: "User interview synthesis",
                tag: "UX",
                priority: "low",
                date: "Mar 5",
            },
        ],
    },
    {
        id: "in-progress",
        title: "In Progress",
        color: "#6366f1",
        icon: Loader,
        cards: [
            {
                id: "t4",
                title: "Redesign onboarding flow",
                tag: "Design",
                priority: "high",
                date: "Feb 26",
            },
            {
                id: "t5",
                title: "Implement OAuth2 login",
                tag: "Backend",
                priority: "high",
                date: "Feb 27",
            },
            {
                id: "t6",
                title: "Write unit tests for auth module",
                tag: "QA",
                priority: "medium",
                date: "Mar 1",
            },
        ],
    },
    {
        id: "review",
        title: "In Review",
        color: "#f59e0b",
        icon: Clock,
        cards: [
            {
                id: "t7",
                title: "Landing page copywriting",
                tag: "Marketing",
                priority: "medium",
                date: "Feb 25",
            },
            {
                id: "t8",
                title: "Accessibility audit — dashboard",
                tag: "QA",
                priority: "high",
                date: "Feb 25",
            },
        ],
    },
    {
        id: "done",
        title: "Done",
        color: "#10b981",
        icon: CheckCircle2,
        cards: [
            {
                id: "t9",
                title: "Set up CI/CD pipeline",
                tag: "DevOps",
                priority: "high",
                date: "Feb 20",
            },
            {
                id: "t10",
                title: "Design token system v1",
                tag: "Design",
                priority: "medium",
                date: "Feb 22",
            },
        ],
    },
];

let nextId = 20;

const DEFAULT_FILTERS: TaskFilters = {
    search: "",
    priorities: [],
    statuses: [],
    assignees: [],
    categories: [],
    dateRange: undefined,
    dueSoon: false,
    overdue: false,
    hasAttachment: false,
    hasChecklist: false,
    progress: [0, 100],
};

export default function KanbanBoard() {
    const [columns, setColumns] = useState(initialColumns);
    const [activeCard, setActiveCard] = useState<IColumn | null>(null);
    const [isOpenInvite, setIsOpenInvite] = useState<boolean>(false);
    const [isOpenFilters, setIsOpenFilters] = useState<boolean>(false);
    const [isOpenSettings, setIsOpenSettings] = useState<boolean>(false);
    const [isOpenTaskDetails, setIsOpenTaskDetails] = useState<boolean>(false);
    const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS);
    const [selectedMode, setSelectedMode] = useState<string>("kanban");

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    );

    const findColByCard = useCallback(
        (cardId: string) =>
            columns.find((col) => col.cards.some((c) => c.id === cardId)),
        [columns],
    );

    const handleDragStart = (event: DragStartEvent) => {
        const col = findColByCard(event.active.id as string);
        if (col)
            setActiveCard(
                col.cards.find((c) => c.id === event.active.id) || null,
            );
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) {
            return;
        }

        const fromColId = findColByCard(active.id as string)?.id;
        const toColId =
            columns.find((c) => c.id === over.id)?.id ||
            findColByCard(over.id as string)?.id;

        if (!fromColId || !toColId || fromColId === toColId) {
            return;
        }

        setColumns((prev) => {
            const fromCol = prev.find((c) => c.id === fromColId);
            const toCol = prev.find((c) => c.id === toColId);
            const card = fromCol?.cards.find((c) => c.id === active.id);
            const overCard = toCol?.cards.find((c) => c.id === over.id);
            const insertIdx =
                (overCard
                    ? toCol?.cards.indexOf(overCard)
                    : toCol?.cards.length) ?? 0;

            return prev.map((col) => {
                if (col.id === fromColId)
                    return {
                        ...col,
                        cards: col.cards.filter((c) => c.id !== active.id),
                    };
                if (col.id === toColId) {
                    const next = [...col.cards];

                    if (card) {
                        next.splice(insertIdx, 0, card);
                    }

                    return { ...col, cards: next };
                }
                return col;
            });
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCard(null);
        if (!over) return;

        const fromColId = findColByCard(active.id as string)?.id;
        const toColId =
            columns.find((c) => c.id === over.id)?.id ||
            findColByCard(over.id as string)?.id;

        if (!fromColId || !toColId || fromColId !== toColId) return;

        setColumns((prev) =>
            prev.map((col) => {
                if (col.id !== fromColId) return col;
                const oldIdx = col.cards.findIndex((c) => c.id === active.id);
                const newIdx = col.cards.findIndex((c) => c.id === over.id);
                if (oldIdx === newIdx) return col;
                return { ...col, cards: arrayMove(col.cards, oldIdx, newIdx) };
            }),
        );
    };

    const handleAddCard = (colId: string, title: string) => {
        nextId += 1;
        setColumns((prev) =>
            prev.map((col) =>
                col.id === colId
                    ? {
                          ...col,
                          cards: [
                              ...col.cards,
                              {
                                  id: `t${nextId}`,
                                  title,
                                  tag: "Frontend",
                                  priority: "medium",
                                  date: new Date().toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                  }),
                              },
                          ],
                      }
                    : col,
            ),
        );
    };

    const handleDeleteCard = (cardId: string) => {
        setColumns((prev) =>
            prev.map((col) => ({
                ...col,
                cards: col.cards.filter((c) => c.id !== cardId),
            })),
        );
    };

    const handleChangeMode = (mode: string) => {
        setSelectedMode(mode);
    };

    return (
        <div className="w-full">
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
                                deleniti suscipit ab, quas, consectetur, autem
                                optio id ipsum cumque vel natus earum molestias.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-3">
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
                {/* <div className="rounded-lg bg-gray-100 px-8 py-4">
                    <p className="w-1/2">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Numquam provident magni deleniti suscipit ab, quas,
                        consectetur, autem optio id ipsum cumque vel natus earum
                        molestias.
                    </p>
                </div> */}
                <div className="flex justify-between">
                    <nav className="flex items-center gap-3">
                        <ButtonGroup>
                            <Button
                                variant={
                                    selectedMode === "kanban"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => handleChangeMode("kanban")}
                                className={
                                    selectedMode === "kanban"
                                        ? "pointer-events-none bg-bright-blue text-white"
                                        : ""
                                }
                            >
                                <SquareKanban />
                                Kanban
                            </Button>
                            <Button
                                variant={
                                    selectedMode === "list"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => handleChangeMode("list")}
                                className={
                                    selectedMode === "list"
                                        ? "pointer-events-none bg-bright-blue text-white"
                                        : ""
                                }
                            >
                                <List />
                                List
                            </Button>
                            <Button
                                variant={
                                    selectedMode === "calendar"
                                        ? "default"
                                        : "outline"
                                }
                                onClick={() => handleChangeMode("calendar")}
                                className={
                                    selectedMode === "calendar"
                                        ? "pointer-events-none bg-bright-blue text-white"
                                        : ""
                                }
                            >
                                <Calendar />
                                Calendar
                            </Button>
                        </ButtonGroup>
                    </nav>
                    <div>
                        <Button
                            onClick={() => setIsOpenFilters(true)}
                            className="bg-bright-blue hover:bg-blue-600"
                        >
                            <ListFilter />
                            Filter
                        </Button>
                    </div>
                </div>
            </header>
            <main>
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
                onChange={setFilters}
                totalTasks={42}
            />
            <ProjectSettingsDialog
                open={isOpenSettings}
                onOpenChange={() => setIsOpenSettings(!isOpenSettings)}
                onSave={(data) => console.log(data)}
                onDelete={() => {}}
            />
            <TaskDetailsSheet
                open={isOpenTaskDetails}
                onOpenChange={() => setIsOpenTaskDetails(!isOpenTaskDetails)}
                onSave={(updated) => console.log(updated)}
            />
        </div>
    );
}
