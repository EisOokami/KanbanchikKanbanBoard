"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Textarea } from "@/components/ui/shadcn/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/shadcn/dialog";
import ColorDotPicker from "./colorDotPicker/ColorDotPicker";
import Chip from "./chip/Chip";
import { Category, Column, Label, Status } from "@/types/types";
import {
    COLUMN_COLORS,
    COLUMNS_CONFIG,
    PROJECT_COLORS,
    PROJECT_ICONS,
    STATUS_CONFIG,
} from "@/constants/constants";
import { cn } from "@/libs/utils";
import {
    CheckIcon,
    EnvelopeIcon,
    PencilSimpleIcon,
    PlusIcon,
    XIcon,
} from "@phosphor-icons/react";
import { BaseAction } from "@/types/actions";
import { createProjectAction } from "@/data/actions";
import { ZodErrors } from "../zodErrors/ZodErrors";
import { Info, Loader2 } from "lucide-react";
import { DetailsErrors } from "../detailsErrors/DetailsErrors";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableColumnRow from "./sortableColumnRow/SortableColumnRow";

interface NewProjectModalProps {
    open: boolean;
    onClose: () => void;
}

const INITIAL_STATE: BaseAction = {
    zodErrors: null,
    error: null,
    status: null,
    details: null,
    message: null,
    formData: null,
};

export default function NewProjectModal({
    open,
    onClose,
}: Readonly<NewProjectModalProps>) {
    const [icon, setIcon] = useState("🚀");
    const [status, setStatus] = useState<Status>("active");
    const [projectColor, setProjectColor] = useState(PROJECT_COLORS[0]);
    const [members, setMembers] = useState<string[]>([]);
    const [emailInput, setEmailInput] = useState<string>("");
    const [emailError, setEmailError] = useState<string>("");
    const [columns, setColumns] = useState<Omit<Column, "tasks">[]>(
        Object.values(COLUMNS_CONFIG),
    );
    const [newColumnName, setNewColumnName] = useState<string>("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCatName, setNewCatName] = useState("");
    const [newCatColor, setNewCatColor] = useState(COLUMN_COLORS[4]);
    const [labels, setLabels] = useState<Label[]>([]);
    const [newLabelName, setNewLabelName] = useState<string>("");
    const [newLabelColor, setNewLabelColor] = useState(COLUMN_COLORS[5]);
    const [iconPickerOpen, setIconPickerOpen] = useState<boolean>(false);
    const [colorPickerOpen, setColorPickerOpen] = useState<boolean>(false);
    const updatedCreateProjectAction = createProjectAction.bind(null, {
        members: members,
        categories: categories,
        columns: columns,
        labels: labels,
    });
    const [formState, formAction, isPending] = useActionState(
        updatedCreateProjectAction,
        INITIAL_STATE,
    );
    const sensors = useSensors(useSensor(PointerSensor));

    const inviteMember = () => {
        const email = emailInput.trim();
        if (!email) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("Enter a valid email address");
            return;
        }
        if (members.find((m) => m === email)) {
            setEmailError("Already added");
            return;
        }
        setMembers((prev) => [...prev, email]);
        setEmailInput("");
        setEmailError("");
    };

    const addColumn = () => {
        if (!newColumnName.trim()) {
            return;
        }

        setColumns((prevState) => [
            ...prevState,
            {
                id: Object.keys(columns).length + 1,
                name: newColumnName.trim(),
                position: Object.keys(columns).length,
                created_at: new Date(),
                updated_at: null,
                wip_limit: 100,
            },
        ]);
        setNewColumnName("");
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        setColumns((prev) => {
            const oldIndex = prev.findIndex(
                (column) => column.id === active.id,
            );
            const newIndex = prev.findIndex((column) => column.id === over.id);

            return arrayMove(prev, oldIndex, newIndex).map((column, i) => ({
                ...column,
                position: i + 1,
            }));
        });
    };

    const addCategory = () => {
        if (!newCatName.trim()) return;
        setCategories((prev) => [
            ...prev,
            {
                id: categories.length + 1,
                name: newCatName.trim(),
                color: newCatColor,
                created_at: new Date(),
                description: "",
                updated_at: null,
            },
        ]);
        setNewCatName("");
    };

    const addLabel = () => {
        if (!newLabelName.trim()) return;
        setLabels((prev) => [
            ...prev,
            {
                id: new Date().getTime(),
                name: newLabelName.trim(),
                color: newLabelColor,
                created_at: new Date(),
                updated_at: null,
            },
        ]);
        setNewLabelName("");
    };

    const handleSubmit = () => {
        // handleClose();
    };

    const handleClose = () => {
        setIcon("🚀");
        setProjectColor("#6366f1");
        setStatus("active");
        setMembers([]);
        setEmailInput("");
        setEmailError("");
        setColumns(Object.values(COLUMNS_CONFIG));
        setNewColumnName("");
        setCategories([]);
        setNewCatName("");
        setLabels([]);
        setNewLabelName("");
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="flex max-h-[92svh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-md border border-border/70 p-0 shadow-2xl">
                <form
                    action={formAction}
                    noValidate
                    className="flex min-h-0 flex-1 flex-col"
                >
                    <DialogHeader className="flex-shrink-0 border-b border-border/60 px-6 pb-4 pt-6">
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="mb-0.5 font-semibold">
                                New Project
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground">
                                Configure your project settings
                            </p>
                        </div>
                    </DialogHeader>
                    <div className="flex-1 space-y-8 overflow-y-auto px-6 py-5">
                        <div className="relative space-y-1">
                            <h3 className="font-semibold">Project icon</h3>
                            <div className="flex items-start gap-6">
                                <div className="flex items-start gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIconPickerOpen(!iconPickerOpen);
                                            setColorPickerOpen(false);
                                        }}
                                        className="relative flex size-14 items-center justify-center rounded-md border text-2xl transition-all hover:brightness-95"
                                        style={{
                                            background: `${projectColor}15`,
                                            borderColor: `${projectColor}30`,
                                        }}
                                        disabled={isPending}
                                    >
                                        {icon}
                                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-bright-blue">
                                            <PencilSimpleIcon
                                                weight="duotone"
                                                size={9}
                                                className="text-white"
                                            />
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setColorPickerOpen(
                                                !colorPickerOpen,
                                            );
                                            setIconPickerOpen(false);
                                        }}
                                        className="relative flex size-14 items-center justify-center rounded-md border transition-all hover:brightness-95"
                                        style={{
                                            background: `${projectColor}20`,
                                            borderColor: `${projectColor}40`,
                                        }}
                                        disabled={isPending}
                                    >
                                        <div
                                            className="size-6 rounded-full shadow-sm"
                                            style={{
                                                background: projectColor,
                                            }}
                                        />
                                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-bright-blue">
                                            <PencilSimpleIcon
                                                weight="duotone"
                                                size={9}
                                                className="text-white"
                                            />
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <ZodErrors error={formState?.zodErrors?.icon} />
                            <ZodErrors error={formState?.zodErrors?.color} />
                            {iconPickerOpen && (
                                <div className="flex flex-wrap gap-1.5 rounded-md border bg-gray-50 p-3">
                                    {PROJECT_ICONS.map((ic) => (
                                        <button
                                            type="button"
                                            key={ic}
                                            onClick={() => {
                                                setIcon(ic);
                                                setIconPickerOpen(false);
                                            }}
                                            className={cn(
                                                "flex size-9 items-center justify-center rounded-md text-xl transition-all hover:bg-white",
                                                icon === ic
                                                    ? "bg-white ring-2 ring-bright-blue"
                                                    : "",
                                            )}
                                            disabled={isPending}
                                        >
                                            {ic}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {colorPickerOpen && (
                                <div className="rounded-md border bg-gray-50 p-3">
                                    <p className="mb-2.5 text-xs font-medium text-gray-500">
                                        Select color
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {PROJECT_COLORS.map((color) => (
                                            <button
                                                type="button"
                                                key={color}
                                                onClick={() => {
                                                    setProjectColor(color);
                                                    setColorPickerOpen(false);
                                                }}
                                                className={cn(
                                                    "flex size-8 items-center justify-center rounded-full transition-all hover:brightness-90",
                                                    projectColor === color
                                                        ? "ring-2 ring-offset-2"
                                                        : "",
                                                )}
                                                style={{
                                                    background: color,
                                                    ...(projectColor === color
                                                        ? {
                                                              ringColor: color,
                                                          }
                                                        : {}),
                                                    outline:
                                                        projectColor === color
                                                            ? `2px solid ${color}`
                                                            : "none",
                                                    outlineOffset:
                                                        projectColor === color
                                                            ? "2px"
                                                            : "0",
                                                }}
                                                disabled={isPending}
                                            >
                                                {projectColor === color && (
                                                    <CheckIcon
                                                        weight="duotone"
                                                        size={13}
                                                        className="text-white"
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="mb-2 block font-semibold">
                                Project name{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                name="name"
                                placeholder="e.g. Website Redesign"
                                defaultValue={
                                    formState?.formData
                                        ?.get("name")
                                        ?.toString() ?? undefined
                                }
                                className={cn(
                                    "h-9 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue",
                                    formState?.zodErrors?.name
                                        ? "border-red-500"
                                        : "",
                                )}
                                disabled={isPending}
                            />
                            <ZodErrors error={formState?.zodErrors?.name} />
                        </div>
                        <div>
                            <label className="mb-2 block font-semibold">
                                Description
                            </label>
                            <Textarea
                                placeholder="What is this project about?"
                                name="description"
                                defaultValue={
                                    formState?.formData
                                        ?.get("description")
                                        ?.toString() ?? undefined
                                }
                                className={cn(
                                    "min-h-[72px] resize-none bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue",
                                    formState?.zodErrors?.description
                                        ? "border-red-500"
                                        : "",
                                )}
                                disabled={isPending}
                            />
                            <ZodErrors
                                error={formState?.zodErrors?.description}
                            />
                        </div>
                        <div>
                            <label className="mb-2 block font-semibold">
                                Status
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {(Object.keys(STATUS_CONFIG) as Status[]).map(
                                    (statusConfig) => (
                                        <button
                                            key={statusConfig}
                                            type="button"
                                            onClick={() =>
                                                setStatus(statusConfig)
                                            }
                                            className={cn(
                                                "flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium transition-all hover:bg-muted",
                                                status === statusConfig
                                                    ? "bg-muted ring-1 ring-border"
                                                    : "opacity-60 hover:opacity-100",
                                            )}
                                            disabled={isPending}
                                        >
                                            <span
                                                className="size-1.5 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        STATUS_CONFIG[
                                                            statusConfig
                                                        ].dot,
                                                }}
                                            />
                                            {STATUS_CONFIG[statusConfig].label}
                                        </button>
                                    ),
                                )}
                            </div>
                            <ZodErrors error={formState?.zodErrors?.status} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold">Members</h3>
                            <div className="space-y-3">
                                {members.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {members.map((member) => (
                                            <div
                                                key={member}
                                                className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-2.5 py-1.5"
                                            >
                                                <div className="min-w-0">
                                                    <p className="mt-0.5 max-w-[140px] truncate text-[10px] text-muted-foreground">
                                                        {member}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setMembers((prev) =>
                                                            prev.filter(
                                                                (value) =>
                                                                    value !==
                                                                    member,
                                                            ),
                                                        )
                                                    }
                                                    className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
                                                    disabled={isPending}
                                                >
                                                    <XIcon
                                                        weight="duotone"
                                                        className="size-4"
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <EnvelopeIcon
                                            weight="duotone"
                                            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                                        />
                                        <Input
                                            placeholder="Invite by email…"
                                            name="email"
                                            value={emailInput}
                                            defaultValue={
                                                formState?.formData
                                                    ?.get("email")
                                                    ?.toString() ?? undefined
                                            }
                                            onChange={(e) => {
                                                setEmailInput(e.target.value);
                                                setEmailError("");
                                            }}
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                (e.preventDefault(),
                                                inviteMember())
                                            }
                                            className={cn(
                                                "h-9 bg-white pl-8 text-sm focus-visible:ring-1 focus-visible:ring-bright-blue",
                                                emailError
                                                    ? "border-red-400"
                                                    : "",
                                            )}
                                            disabled={isPending}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={inviteMember}
                                        className="h-9 gap-1.5 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                                        disabled={isPending}
                                    >
                                        <PlusIcon
                                            weight="duotone"
                                            className="size-4"
                                        />{" "}
                                        Invite
                                    </Button>
                                </div>
                                <ZodErrors
                                    error={formState?.zodErrors?.members}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold">Board Columns</h3>
                            <div className="space-y-5">
                                <div className="space-y-1.5">
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={columns.map(
                                                (column) => column.id,
                                            )}
                                            strategy={
                                                verticalListSortingStrategy
                                            }
                                        >
                                            {columns.map((column) => (
                                                <SortableColumnRow
                                                    key={column.id}
                                                    column={column}
                                                    isPending={isPending}
                                                    onRemove={(id) =>
                                                        setColumns(
                                                            (prevState) =>
                                                                prevState.filter(
                                                                    (
                                                                        columnsState,
                                                                    ) =>
                                                                        columnsState.id !==
                                                                        id,
                                                                ),
                                                        )
                                                    }
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                </div>
                                <div className=" space-y-1">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Column name…"
                                            name="column"
                                            value={newColumnName}
                                            onChange={(e) =>
                                                setNewColumnName(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                (e.preventDefault(),
                                                addColumn())
                                            }
                                            className={cn(
                                                "h-8 flex-1 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue",
                                                formState?.zodErrors?.columns
                                                    ? "border-red-500"
                                                    : "",
                                            )}
                                            disabled={isPending}
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={addColumn}
                                            className="h-8 gap-1 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                                            disabled={isPending}
                                        >
                                            <PlusIcon
                                                weight="duotone"
                                                className="size-4"
                                            />{" "}
                                            Add
                                        </Button>
                                    </div>
                                    <ZodErrors
                                        error={formState?.zodErrors?.columns}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold">Categories</h3>
                            <div className="space-y-3">
                                {categories.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {categories.map((category) => (
                                            <Chip
                                                key={category.id}
                                                label={category.name}
                                                color={category.color}
                                                onRemove={() =>
                                                    isPending
                                                        ? null
                                                        : setCategories(
                                                              (prevState) =>
                                                                  prevState.filter(
                                                                      (
                                                                          categoriesState,
                                                                      ) =>
                                                                          categoriesState.id !==
                                                                          category.id,
                                                                  ),
                                                          )
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <ColorDotPicker
                                        value={newCatColor}
                                        onChange={setNewCatColor}
                                        colors={COLUMN_COLORS}
                                        isPending={isPending}
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Category name…"
                                            value={newCatName}
                                            name="category"
                                            onChange={(e) =>
                                                setNewCatName(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                (e.preventDefault(),
                                                addCategory())
                                            }
                                            className={cn(
                                                "h-8 flex-1 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue",
                                                formState?.zodErrors?.categories
                                                    ? "border-red-500"
                                                    : "",
                                            )}
                                            disabled={isPending}
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={addCategory}
                                            className="h-8 gap-1 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                                            disabled={isPending}
                                        >
                                            <PlusIcon
                                                weight="duotone"
                                                className="size-4"
                                            />{" "}
                                            Add
                                        </Button>
                                    </div>
                                    <ZodErrors
                                        error={formState?.zodErrors?.categories}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold">Labels</h3>
                            <div className="space-y-3">
                                {labels.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {labels.map((lbl) => (
                                            <Chip
                                                key={lbl.id}
                                                label={lbl.name}
                                                color={lbl.color}
                                                onRemove={() =>
                                                    isPending
                                                        ? null
                                                        : setLabels((prev) =>
                                                              prev.filter(
                                                                  (l) =>
                                                                      l.id !==
                                                                      lbl.id,
                                                              ),
                                                          )
                                                }
                                            />
                                        ))}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <ColorDotPicker
                                        value={newLabelColor}
                                        onChange={setNewLabelColor}
                                        colors={COLUMN_COLORS}
                                        isPending={isPending}
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Label name…"
                                            name="label"
                                            value={newLabelName}
                                            onChange={(e) =>
                                                setNewLabelName(e.target.value)
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                (e.preventDefault(), addLabel())
                                            }
                                            className={cn(
                                                "h-8 flex-1 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue",
                                                formState?.zodErrors?.labels
                                                    ? "border-red-500"
                                                    : "",
                                            )}
                                            disabled={isPending}
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={addLabel}
                                            className="h-8 gap-1 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                                            disabled={isPending}
                                        >
                                            <PlusIcon
                                                weight="duotone"
                                                className="size-4"
                                            />{" "}
                                            Add
                                        </Button>
                                    </div>
                                    <ZodErrors
                                        error={formState?.zodErrors?.labels}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-border/60 px-6 py-4">
                        {formState?.message && (
                            <div
                                className={cn(
                                    "flex items-center gap-2 rounded-md text-sm",
                                    formState?.status === "error"
                                        ? "text-red-500"
                                        : formState?.status === "success"
                                          ? "text-green-500"
                                          : "text-yellow-300",
                                )}
                            >
                                <Info className="h-4 w-4" />
                                <p>{formState?.message}</p>
                            </div>
                        )}
                        {formState?.details &&
                            formState?.details?.length &&
                            formState.details.map((error) => (
                                <DetailsErrors
                                    key={error.message + error.field}
                                    error={error}
                                />
                            ))}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleClose}
                                className="h-9"
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                onClick={handleSubmit}
                                className="h-9 gap-1.5 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Save changes...
                                    </>
                                ) : (
                                    <>
                                        <PlusIcon
                                            weight="duotone"
                                            className="size-4"
                                        />{" "}
                                        Create Project
                                    </>
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                    <input type="hidden" name="icon" value={icon} />
                    <input type="hidden" name="color" value={projectColor} />
                    <input type="hidden" name="status" value={status} />
                </form>
            </DialogContent>
        </Dialog>
    );
}
