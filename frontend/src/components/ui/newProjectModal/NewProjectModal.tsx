"use client";

import { useState, useRef } from "react";
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
import {
    Category,
    ColumnConfig,
    Label,
    Member,
    Priority,
    Project,
    Status,
} from "@/types/types";
import {
    COLUMN_COLORS,
    COLUMNS_CONFIG,
    PRIORITY_CONFIG,
    PROJECT_COLORS,
    PROJECT_ICONS,
    STATUS_CONFIG,
} from "@/constants/constants";
import { cn, getInitials } from "@/libs/utils";
import {
    CheckIcon,
    DotsSixVerticalIcon,
    EnvelopeIcon,
    PencilSimpleIcon,
    PlusIcon,
    XIcon,
} from "@phosphor-icons/react";

interface NewProjectModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Project) => void;
}

export default function NewProjectModal({
    open,
    onClose,
    onSubmit,
}: NewProjectModalProps) {
    const [icon, setIcon] = useState("🚀");
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [priority, setPriority] = useState<Priority>("medium");
    const [status, setStatus] = useState<Status>("active");
    const [projectColor, setProjectColor] = useState(PROJECT_COLORS[0]);
    const [members, setMembers] = useState<Member[]>([]);
    const [emailInput, setEmailInput] = useState<string>("");
    const [emailError, setEmailError] = useState<string>("");
    const [columns, setColumns] = useState<ColumnConfig[]>(
        Object.values(COLUMNS_CONFIG),
    );
    const [newColName, setNewColName] = useState<string>("");
    const [newColColor, setNewColColor] = useState(COLUMN_COLORS[3]);
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const dragOver = useRef<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCatName, setNewCatName] = useState("");
    const [newCatColor, setNewCatColor] = useState(COLUMN_COLORS[4]);
    const [errors, setErrors] = useState<{ name?: string }>({});
    const [labels, setLabels] = useState<Label[]>([]);
    const [newLabelName, setNewLabelName] = useState<string>("");
    const [newLabelColor, setNewLabelColor] = useState(COLUMN_COLORS[5]);
    const [iconPickerOpen, setIconPickerOpen] = useState<boolean>(false);
    const [colorPickerOpen, setColorPickerOpen] = useState<boolean>(false);

    const inviteMember = () => {
        const email = emailInput.trim();
        if (!email) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("Enter a valid email address");
            return;
        }
        if (members.find((m) => m.email === email)) {
            setEmailError("Already added");
            return;
        }
        setMembers((prev) => [
            ...prev,
            {
                id: new Date().getTime(),
                name: email.split("@")[0],
                surname: "",
                email,
                joined_at: new Date(),
                avatar_url: "",
                color: "",
                initials: "",
                role: "member",
            },
        ]);
        setEmailInput("");
        setEmailError("");
    };

    const addColumn = () => {
        if (!newColName.trim()) return;
        setColumns((prevState) => ({
            ...prevState,
            [newColName.trim()]: {
                id: Object.keys(columns).length,
                label: newColName.trim(),
                pill: `bg-[${newColColor}]/10 text-[${newColColor}]/70 border-[${newColColor}]/20`,
                order: Object.keys(columns).length,
            },
        }));
        setNewColName("");
    };

    const handleDragStart = (i: number) => setDragIdx(i);

    const handleDragEnter = (i: number) => {
        dragOver.current = i;
    };

    const handleDragEnd = () => {
        if (dragIdx === null || dragOver.current === null) {
            setDragIdx(null);
            return;
        }
        const arr = [...columns];
        const [moved] = arr.splice(dragIdx, 1);
        arr.splice(dragOver.current, 0, moved);
        setColumns(arr);
        setDragIdx(null);
        dragOver.current = null;
    };

    const addCategory = () => {
        if (!newCatName.trim()) return;
        setCategories((prev) => [
            ...prev,
            {
                id: categories.length + 1,
                name: newCatName.trim(),
                color: newCatColor,
                pill: "",
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
                id: labels.length + 1,
                name: newLabelName.trim(),
                color: newLabelColor,
            },
        ]);
        setNewLabelName("");
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            setErrors({ name: "Project name is required" });
            return;
        }

        onSubmit({
            id: new Date().getTime(),
            name: name.trim(),
            icon,
            description,
            status,
            color: projectColor,
            members,
            owner: { name: "", avatar_url: "" },
            columns: [],
            created_at: new Date(),
            updated_at: null,
            // priority,
            // columns,
            // categories,
            // labels,
        });
        handleClose();
    };

    const handleClose = () => {
        setName("");
        setDescription("");
        setIcon("🚀");
        setProjectColor("#6366f1");
        setPriority("medium");
        setStatus("active");
        setMembers([]);
        setEmailInput("");
        setEmailError("");
        setColumns(Object.values(COLUMNS_CONFIG));
        setNewColName("");
        setCategories([]);
        setNewCatName("");
        setLabels([]);
        setNewLabelName("");
        setErrors({});
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="flex max-h-[92svh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-md border border-border/70 p-0 shadow-2xl">
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
                                    onClick={() => {
                                        setIconPickerOpen(!iconPickerOpen);
                                        setColorPickerOpen(false);
                                    }}
                                    className="relative flex size-14 items-center justify-center rounded-md border text-2xl transition-all hover:brightness-95"
                                    style={{
                                        background: `${projectColor}15`,
                                        borderColor: `${projectColor}30`,
                                    }}
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
                                    onClick={() => {
                                        setColorPickerOpen(!colorPickerOpen);
                                        setIconPickerOpen(false);
                                    }}
                                    className="relative flex size-14 items-center justify-center rounded-md border transition-all hover:brightness-95"
                                    style={{
                                        background: `${projectColor}20`,
                                        borderColor: `${projectColor}40`,
                                    }}
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
                        {iconPickerOpen && (
                            <div className="flex flex-wrap gap-1.5 rounded-md border bg-gray-50 p-3">
                                {PROJECT_ICONS.map((ic) => (
                                    <button
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
                                    {PROJECT_COLORS.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => {
                                                setProjectColor(c);
                                                setColorPickerOpen(false);
                                            }}
                                            className={cn(
                                                "flex size-8 items-center justify-center rounded-full transition-all hover:brightness-90",
                                                projectColor === c
                                                    ? "ring-2 ring-offset-2"
                                                    : "",
                                            )}
                                            style={{
                                                background: c,
                                                ...(projectColor === c
                                                    ? {
                                                          ringColor: c,
                                                      }
                                                    : {}),
                                                outline:
                                                    projectColor === c
                                                        ? `2px solid ${c}`
                                                        : "none",
                                                outlineOffset:
                                                    projectColor === c
                                                        ? "2px"
                                                        : "0",
                                            }}
                                        >
                                            {projectColor === c && (
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
                            Project name <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="e.g. Website Redesign"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setErrors({});
                            }}
                            className={`h-9 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue ${errors.name ? "border-red-400" : ""}`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.name}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-2 block font-semibold">
                            Description
                        </label>
                        <Textarea
                            placeholder="What is this project about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[72px] resize-none bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-2 block font-semibold">
                                Priority
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {(
                                    Object.keys(PRIORITY_CONFIG) as Priority[]
                                ).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={cn(
                                            "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                                            priority === p
                                                ? "ring-1 ring-current"
                                                : "opacity-60 hover:opacity-100",
                                        )}
                                        style={{
                                            backgroundColor:
                                                PRIORITY_CONFIG[p].color,
                                            color: "#fff",
                                        }}
                                    >
                                        {PRIORITY_CONFIG[p].label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block font-semibold">
                                Status
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {(Object.keys(STATUS_CONFIG) as Status[]).map(
                                    (s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setStatus(s)}
                                            className={`flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium transition-all hover:bg-muted ${status === s ? "bg-muted ring-1 ring-border" : "opacity-60 hover:opacity-100"}`}
                                        >
                                            <span
                                                className="size-1.5 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        STATUS_CONFIG[s].dot,
                                                }}
                                            />
                                            {STATUS_CONFIG[s].label}
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Assignments</h3>
                        <div className="space-y-3">
                            {members.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {members.map((m) => (
                                        <div
                                            key={m.id}
                                            className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-2.5 py-1.5"
                                        >
                                            <div
                                                className="flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                                style={{
                                                    backgroundColor:
                                                        projectColor,
                                                }}
                                            >
                                                {getInitials(m.name, m.surname)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium leading-none">
                                                    {m.name}
                                                </p>
                                                <p className="mt-0.5 max-w-[140px] truncate text-[10px] text-muted-foreground">
                                                    {m.email}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setMembers((prev) =>
                                                        prev.filter(
                                                            (x) =>
                                                                x.id !== m.id,
                                                        ),
                                                    )
                                                }
                                                className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
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
                                        value={emailInput}
                                        onChange={(e) => {
                                            setEmailInput(e.target.value);
                                            setEmailError("");
                                        }}
                                        onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            (e.preventDefault(), inviteMember())
                                        }
                                        className={`h-9 bg-white pl-8 text-sm focus-visible:ring-1 focus-visible:ring-bright-blue ${emailError ? "border-red-400" : ""}`}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={inviteMember}
                                    className="h-9 gap-1.5 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                                >
                                    <PlusIcon
                                        weight="duotone"
                                        className="size-4"
                                    />{" "}
                                    Invite
                                </Button>
                            </div>
                            {emailError && (
                                <p className="text-xs text-red-500">
                                    {emailError}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Board Columns</h3>
                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                {columns.map((col, i) => (
                                    <div
                                        key={col.id}
                                        draggable
                                        onDragStart={() => handleDragStart(i)}
                                        onDragEnter={() => handleDragEnter(i)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => e.preventDefault()}
                                        className={`flex cursor-grab items-center gap-2.5 rounded-md border border-border/50 bg-muted/30 bg-white px-3 py-2 transition-all active:cursor-grabbing ${dragIdx === i ? "opacity-40" : ""}`}
                                    >
                                        <DotsSixVerticalIcon
                                            weight="duotone"
                                            className="size-3.5 flex-shrink-0 text-muted-foreground/50"
                                        />
                                        <span
                                            className={cn(
                                                "size-3 flex-shrink-0 rounded-full",
                                                col.pill,
                                            )}
                                        />
                                        <span className="flex-1 text-sm font-medium">
                                            {col.label}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setColumns((prev) =>
                                                    prev.filter(
                                                        (c) => c.id !== col.id,
                                                    ),
                                                )
                                            }
                                            className="text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                                        >
                                            <XIcon
                                                weight="duotone"
                                                className="size-4"
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className=" space-y-1">
                                <ColorDotPicker
                                    value={newColColor}
                                    onChange={setNewColColor}
                                    colors={COLUMN_COLORS}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Column name…"
                                        value={newColName}
                                        onChange={(e) =>
                                            setNewColName(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            (e.preventDefault(), addColumn())
                                        }
                                        className="h-8 flex-1 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={addColumn}
                                        className="h-8 gap-1 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                                    >
                                        <PlusIcon
                                            weight="duotone"
                                            className="size-4"
                                        />{" "}
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Categories</h3>
                        <div className="space-y-3">
                            {categories.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {categories.map((cat) => (
                                        <Chip
                                            key={cat.id}
                                            label={cat.name}
                                            color={cat.color}
                                            onRemove={() =>
                                                setCategories((prev) =>
                                                    prev.filter(
                                                        (c) => c.id !== cat.id,
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
                                />
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Category name…"
                                        value={newCatName}
                                        onChange={(e) =>
                                            setNewCatName(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            (e.preventDefault(), addCategory())
                                        }
                                        className="h-8 flex-1 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={addCategory}
                                        className="h-8 gap-1 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                                    >
                                        <PlusIcon
                                            weight="duotone"
                                            className="size-4"
                                        />{" "}
                                        Add
                                    </Button>
                                </div>
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
                                                setLabels((prev) =>
                                                    prev.filter(
                                                        (l) => l.id !== lbl.id,
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
                                />
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Label name…"
                                        value={newLabelName}
                                        onChange={(e) =>
                                            setNewLabelName(e.target.value)
                                        }
                                        onKeyDown={(e) =>
                                            e.key === "Enter" &&
                                            (e.preventDefault(), addLabel())
                                        }
                                        className="h-8 flex-1 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={addLabel}
                                        className="h-8 gap-1 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                                    >
                                        <PlusIcon
                                            weight="duotone"
                                            className="size-4"
                                        />{" "}
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter className="flex flex-shrink-0 items-center justify-between gap-3 border-t border-border/60 px-6 py-4">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClose}
                            className="h-9"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleSubmit}
                            className="h-9 gap-1.5 bg-bright-blue text-white hover:bg-blue-600 [&_svg]:size-4"
                        >
                            <PlusIcon weight="duotone" className="size-4" />{" "}
                            Create Project
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
