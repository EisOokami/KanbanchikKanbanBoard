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
import {
    X,
    Plus,
    Mail,
    ChevronDown,
    ChevronRight,
    Tag,
    Columns,
    Layers,
    Users,
    Smile,
    Check,
    GripVertical,
} from "lucide-react";

type Priority = "low" | "medium" | "high" | "critical";
type Status = "active" | "paused" | "completed" | "archived";

interface Member {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface Column {
    id: string;
    name: string;
    color: string;
}

interface Category {
    id: string;
    name: string;
    color: string;
}

interface Label {
    id: string;
    name: string;
    color: string;
}

interface NewProjectData {
    name: string;
    icon: string;
    description: string;
    priority: Priority;
    status: Status;
    color: string;
    members: Member[];
    columns: Column[];
    categories: Category[];
    labels: Label[];
}

interface NewProjectModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: NewProjectData) => void;
}

const EMOJI_OPTIONS = [
    "🔥",
    "⚡",
    "🚀",
    "💡",
    "🎯",
    "🛠️",
    "📊",
    "🎨",
    "🔐",
    "🌐",
    "📱",
    "⚙️",
    "🗓️",
    "🗿",
    "⚠️",
    "🌟",
    "💎",
    "🧩",
    "🔬",
    "📦",
];

const COLOR_OPTIONS = [
    "#6366f1",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ef4444",
    "#14b8a6",
    "#f97316",
    "#06b6d4",
];

const COLUMN_COLORS = [
    "#94a3b8",
    "#6366f1",
    "#ec4899",
    "#f59e0b",
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#ef4444",
    "#14b8a6",
    "#f97316",
];

const PRIORITY_CONFIG: Record<
    Priority,
    { label: string; color: string; bg: string }
> = {
    low: {
        label: "Low",
        color: "text-slate-500",
        bg: "bg-slate-100 dark:bg-slate-800",
    },
    medium: {
        label: "Medium",
        color: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-900/30",
    },
    high: {
        label: "High",
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-900/30",
    },
    critical: {
        label: "Critical",
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-900/30",
    },
};

const STATUS_CONFIG: Record<Status, { label: string; dot: string }> = {
    active: { label: "Active", dot: "bg-emerald-500" },
    paused: { label: "Paused", dot: "bg-amber-400" },
    completed: { label: "Completed", dot: "bg-blue-400" },
    archived: { label: "Archived", dot: "bg-slate-400" },
};

const DEFAULT_COLUMNS: Column[] = [
    { id: "col-1", name: "To Do", color: "#94a3b8" },
    { id: "col-2", name: "In Progress", color: "#6366f1" },
    { id: "col-3", name: "Done", color: "#10b981" },
];

function uid() {
    return Math.random().toString(36).slice(2, 9);
}

function getInitials(name: string) {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function Section({
    icon,
    title,
    children,
    defaultOpen = true,
    badge,
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    badge?: number;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="overflow-hidden rounded-md border border-border/60 bg-muted/20">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
                <span className="text-muted-foreground">{icon}</span>
                <span className="flex-1 text-sm font-semibold text-foreground">
                    {title}
                </span>
                {badge !== undefined && badge > 0 && (
                    <span className="rounded-full bg-bright-blue/15 px-2 py-0.5 text-[10px] font-semibold text-bright-blue">
                        {badge}
                    </span>
                )}
                {open ? (
                    <ChevronDown className="size-3.5 text-muted-foreground" />
                ) : (
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                )}
            </button>
            {open && (
                <div className="border-t border-border/50 px-4 pb-4 pt-3">
                    {children}
                </div>
            )}
        </div>
    );
}

function Chip({
    label,
    color,
    onRemove,
}: {
    label: string;
    color: string;
    onRemove?: () => void;
}) {
    return (
        <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: color + "22", color }}
        >
            {label}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="ml-0.5 opacity-60 transition-opacity hover:opacity-100"
                >
                    <X className="size-3" />
                </button>
            )}
        </span>
    );
}

function ColorDotPicker({
    value,
    onChange,
    colors,
}: {
    value: string;
    onChange: (c: string) => void;
    colors: string[];
}) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {colors.map((c) => (
                <button
                    key={c}
                    type="button"
                    onClick={() => onChange(c)}
                    className="size-5 rounded-full ring-offset-background transition-transform"
                    style={{
                        backgroundColor: c,
                        outline: value === c ? `2px solid ${c}` : "none",
                        outlineOffset: 2,
                    }}
                >
                    {value === c && (
                        <Check className="mx-auto size-3 text-white" />
                    )}
                </button>
            ))}
        </div>
    );
}

export default function NewProjectModal({
    open,
    onClose,
    onSubmit,
}: NewProjectModalProps) {
    const [icon, setIcon] = useState("🚀");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<Priority>("medium");
    const [status, setStatus] = useState<Status>("active");
    const [color, setColor] = useState("#6366f1");
    const [members, setMembers] = useState<Member[]>([]);
    const [emailInput, setEmailInput] = useState("");
    const [emailError, setEmailError] = useState("");
    const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);
    const [newColName, setNewColName] = useState("");
    const [newColColor, setNewColColor] = useState(COLUMN_COLORS[3]);
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const dragOver = useRef<number | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCatName, setNewCatName] = useState("");
    const [newCatColor, setNewCatColor] = useState(COLUMN_COLORS[4]);
    const [errors, setErrors] = useState<{ name?: string }>({});
    const [labels, setLabels] = useState<Label[]>([]);
    const [newLabelName, setNewLabelName] = useState("");
    const [newLabelColor, setNewLabelColor] = useState(COLUMN_COLORS[5]);

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
            { id: uid(), name: email.split("@")[0], email },
        ]);
        setEmailInput("");
        setEmailError("");
    };

    const addColumn = () => {
        if (!newColName.trim()) return;
        setColumns((prev) => [
            ...prev,
            { id: uid(), name: newColName.trim(), color: newColColor },
        ]);
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
            { id: uid(), name: newCatName.trim(), color: newCatColor },
        ]);
        setNewCatName("");
    };

    const addLabel = () => {
        if (!newLabelName.trim()) return;
        setLabels((prev) => [
            ...prev,
            { id: uid(), name: newLabelName.trim(), color: newLabelColor },
        ]);
        setNewLabelName("");
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            setErrors({ name: "Project name is required" });
            return;
        }
        onSubmit({
            name: name.trim(),
            icon,
            description,
            priority,
            status,
            color,
            members,
            columns,
            categories,
            labels,
        });
        handleClose();
    };

    const handleClose = () => {
        setName("");
        setDescription("");
        setIcon("🚀");
        setColor("#6366f1");
        setPriority("medium");
        setStatus("active");
        setMembers([]);
        setEmailInput("");
        setEmailError("");
        setColumns(DEFAULT_COLUMNS);
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
            <DialogContent className="flex max-h-[92vh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-md border border-border/70 p-0 shadow-2xl">
                <DialogHeader className="flex-shrink-0 border-b border-border/60 px-6 pb-4 pt-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowEmojiPicker((v) => !v)}
                                className="flex size-12 items-center justify-center rounded-md text-2xl ring-1 ring-border/60 transition-all hover:ring-bright-blue"
                                style={{ backgroundColor: color + "22" }}
                            >
                                {icon}
                            </button>
                            {showEmojiPicker && (
                                <div className="absolute left-0 top-14 z-50 w-56 rounded-md border border-border/60 bg-card p-3 shadow-xl">
                                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                        Icon
                                    </p>
                                    <div className="mb-3 flex flex-wrap gap-1">
                                        {EMOJI_OPTIONS.map((e) => (
                                            <button
                                                key={e}
                                                type="button"
                                                onClick={() => {
                                                    setIcon(e);
                                                    setShowEmojiPicker(false);
                                                }}
                                                className={`flex size-7 items-center justify-center rounded-md text-base transition-colors hover:bg-muted ${icon === e ? "bg-muted ring-1 ring-bright-blue" : ""}`}
                                            >
                                                {e}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                        Color
                                    </p>
                                    <ColorDotPicker
                                        value={color}
                                        onChange={setColor}
                                        colors={COLOR_OPTIONS}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <DialogTitle className="mb-0.5 text-base font-semibold">
                                New Project
                            </DialogTitle>
                            <p className="text-xs text-muted-foreground">
                                Configure your project settings
                            </p>
                        </div>
                    </div>
                </DialogHeader>
                <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                    <Section
                        icon={<Smile className="size-4" />}
                        title="Basic Information"
                        defaultOpen
                    >
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Project name{" "}
                                    <span className="text-red-500">*</span>
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
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Description
                                </label>
                                <Textarea
                                    placeholder="What is this project about?"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    className="min-h-[72px] resize-none bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                        Priority
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(
                                            Object.keys(
                                                PRIORITY_CONFIG,
                                            ) as Priority[]
                                        ).map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPriority(p)}
                                                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].color} ${priority === p ? "ring-1 ring-current" : "opacity-60 hover:opacity-100"}`}
                                            >
                                                {PRIORITY_CONFIG[p].label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                        Status
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(
                                            Object.keys(
                                                STATUS_CONFIG,
                                            ) as Status[]
                                        ).map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setStatus(s)}
                                                className={`flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium transition-all hover:bg-muted ${status === s ? "bg-muted ring-1 ring-border" : "opacity-60 hover:opacity-100"}`}
                                            >
                                                <span
                                                    className={`size-1.5 rounded-full ${STATUS_CONFIG[s].dot}`}
                                                />
                                                {STATUS_CONFIG[s].label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Section>
                    <Section
                        icon={<Users className="size-4" />}
                        title="Assignments"
                        badge={members.length}
                    >
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
                                                    backgroundColor: color,
                                                }}
                                            >
                                                {getInitials(m.name)}
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
                                                <X className="size-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
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
                                    className="h-9 gap-1.5 bg-bright-blue text-white hover:bg-blue-600"
                                >
                                    <Plus className="size-3.5" /> Invite
                                </Button>
                            </div>
                            {emailError && (
                                <p className="text-xs text-red-500">
                                    {emailError}
                                </p>
                            )}
                        </div>
                    </Section>
                    <Section
                        icon={<Columns className="size-4" />}
                        title="Board Columns"
                        badge={columns.length}
                    >
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
                                        <GripVertical className="size-3.5 flex-shrink-0 text-muted-foreground/50" />
                                        <span
                                            className="size-3 flex-shrink-0 rounded-full"
                                            style={{
                                                backgroundColor: col.color,
                                            }}
                                        />
                                        <span className="flex-1 text-sm font-medium">
                                            {col.name}
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
                                            <X className="size-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className=" space-y-2">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    Add Column
                                </p>
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
                                        variant="outline"
                                        onClick={addColumn}
                                        className="h-8 gap-1"
                                    >
                                        <Plus className="size-3.5" /> Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Section>
                    <Section
                        icon={<Layers className="size-4" />}
                        title="Categories"
                        badge={categories.length}
                        defaultOpen={false}
                    >
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
                            <div className="space-y-2">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    Add Category
                                </p>
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
                                        variant="outline"
                                        onClick={addCategory}
                                        className="h-8 gap-1"
                                    >
                                        <Plus className="size-3.5" /> Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Section>
                    <Section
                        icon={<Tag className="size-4" />}
                        title="Labels"
                        badge={labels.length}
                        defaultOpen={false}
                    >
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
                            <div className="space-y-2">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    Add Label
                                </p>
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
                                        variant="outline"
                                        onClick={addLabel}
                                        className="h-8 gap-1"
                                    >
                                        <Plus className="size-3.5" /> Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Section>
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
                            className="h-9 gap-1.5 bg-bright-blue text-white hover:bg-blue-600"
                        >
                            <Plus className="size-4" /> Create Project
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
