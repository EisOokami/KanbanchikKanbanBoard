"use client";

import { useState, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/shadcn/popover";
import { Calendar } from "@/components/ui/shadcn/calendar";
import {
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Paperclip,
    Plus,
    Trash2,
    Upload,
    UserPlus,
    X,
    CheckSquare,
    Flame,
    ArrowUp,
    ArrowDown,
    Minus,
    Smile,
    Check,
    Layers,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/libs/utils";

type Priority = "critical" | "high" | "medium" | "low";

interface ChecklistItem {
    id: string;
    text: string;
    done: boolean;
}

interface Attachment {
    id: string;
    name: string;
    size: string;
    type: string;
}

interface Member {
    id: string;
    name: string;
    initials: string;
    color: string;
}

interface TaskFormData {
    title: string;
    description: string;
    dueDate: Date | undefined;
    priority: Priority | null;
    categories: string[];
    assignees: string[];
    attachments: Attachment[];
    checklist: ChecklistItem[];
}

const MEMBERS: Member[] = [
    { id: "1", name: "Sofia Marchetti", initials: "SM", color: "#7C5CBF" },
    { id: "2", name: "Luca Ferrara", initials: "LF", color: "#2A9D8F" },
    { id: "3", name: "Anna Kowalski", initials: "AK", color: "#E76F51" },
    { id: "4", name: "James Okafor", initials: "JO", color: "#264653" },
    { id: "5", name: "Mei Lin", initials: "ML", color: "#C09A3A" },
];

const CATEGORIES = [
    "Design",
    "Engineering",
    "Research",
    "Marketing",
    "QA",
    "DevOps",
    "Product",
    "Data",
];

const PRIORITY_CONFIG: Record<
    Priority,
    { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
    critical: {
        label: "Critical",
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-900/30",
        icon: <Flame className="size-3" />,
    },
    high: {
        label: "High",
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-900/30",
        icon: <ArrowUp className="size-3" />,
    },
    medium: {
        label: "Medium",
        color: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-900/30",
        icon: <Minus className="size-3" />,
    },
    low: {
        label: "Low",
        color: "text-slate-500",
        bg: "bg-slate-100 dark:bg-slate-800",
        icon: <ArrowDown className="size-3" />,
    },
};

const CATEGORY_COLORS = [
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

interface CreateTaskModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit?: (data: TaskFormData) => void;
}

export function CreateTaskModal({
    open,
    onOpenChange,
    onSubmit,
}: CreateTaskModalProps) {
    const [accentColor, setAccentColor] = useState("#6366f1");
    const [form, setForm] = useState<TaskFormData>({
        title: "",
        description: "",
        dueDate: undefined,
        priority: null,
        categories: [],
        assignees: [],
        attachments: [],
        checklist: [],
    });
    const [newCheckItem, setNewCheckItem] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [newCategoryColor, setNewCategoryColor] = useState(
        CATEGORY_COLORS[1],
    );
    const [calOpen, setCalOpen] = useState(false);
    const [errors, setErrors] = useState<{ title?: string }>({});
    const fileInputRef = useRef<HTMLInputElement>(null);

    const update = <K extends keyof TaskFormData>(
        key: K,
        value: TaskFormData[K],
    ) => setForm((f) => ({ ...f, [key]: value }));

    const addCheckItem = () => {
        if (!newCheckItem.trim()) return;
        update("checklist", [
            ...form.checklist,
            { id: crypto.randomUUID(), text: newCheckItem.trim(), done: false },
        ]);
        setNewCheckItem("");
    };

    const toggleCheck = (id: string) =>
        update(
            "checklist",
            form.checklist.map((i) =>
                i.id === id ? { ...i, done: !i.done } : i,
            ),
        );

    const removeCheck = (id: string) =>
        update(
            "checklist",
            form.checklist.filter((i) => i.id !== id),
        );

    const toggleAssignee = (id: string) =>
        update(
            "assignees",
            form.assignees.includes(id)
                ? form.assignees.filter((a) => a !== id)
                : [...form.assignees, id],
        );

    const addCategory = () => {
        const t = newCategory.trim();
        if (!t || form.categories.includes(t)) return;
        update("categories", [...form.categories, t]);
        setNewCategory("");
    };

    const removeCategory = (cat: string) =>
        update(
            "categories",
            form.categories.filter((c) => c !== cat),
        );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        update("attachments", [
            ...form.attachments,
            ...files.map((f) => ({
                id: crypto.randomUUID(),
                name: f.name,
                size: `${(f.size / 1024).toFixed(1)} KB`,
                type: f.type,
            })),
        ]);
        e.target.value = "";
    };

    const removeAttachment = (id: string) =>
        update(
            "attachments",
            form.attachments.filter((a) => a.id !== id),
        );

    const handleSubmit = () => {
        if (!form.title.trim()) {
            setErrors({ title: "Task title is required" });
            return;
        }
        onSubmit?.(form);
        handleClose();
    };

    const handleClose = () => {
        setForm({
            title: "",
            description: "",
            dueDate: undefined,
            priority: null,
            categories: [],
            assignees: [],
            attachments: [],
            checklist: [],
        });
        setAccentColor("#6366f1");
        setNewCheckItem("");
        setNewCategory("");
        setErrors({});
        onOpenChange(false);
    };

    const completedChecks = form.checklist.filter((i) => i.done).length;
    const selectedMembers = MEMBERS.filter((m) =>
        form.assignees.includes(m.id),
    );

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="flex max-h-[92vh] w-full max-w-2xl flex-col gap-0 overflow-hidden rounded-md border border-border/70 p-0 shadow-2xl">
                <DialogHeader className="flex-shrink-0 border-b border-border/60 px-6 pb-4 pt-6">
                    <div className="min-w-0 flex-1">
                        <DialogTitle className="mb-0.5 text-base font-semibold">
                            New Task
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground">
                            Configure your task details
                        </p>
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
                                    Task title{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="e.g. Design login screen"
                                    value={form.title}
                                    onChange={(e) => {
                                        update("title", e.target.value);
                                        setErrors({});
                                    }}
                                    className={`h-9 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue ${errors.title ? "border-red-400" : ""}`}
                                />
                                {errors.title && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.title}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                    Description
                                </label>
                                <Textarea
                                    placeholder="Add context, goals, or acceptance criteria…"
                                    value={form.description}
                                    onChange={(e) =>
                                        update("description", e.target.value)
                                    }
                                    className="min-h-[72px] resize-none bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                                        Due Date
                                    </label>
                                    <Popover
                                        open={calOpen}
                                        onOpenChange={setCalOpen}
                                    >
                                        <PopoverTrigger asChild>
                                            <button
                                                type="button"
                                                className={cn(
                                                    "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-white px-3 text-sm transition-colors hover:bg-muted/40",
                                                    form.dueDate
                                                        ? "text-foreground"
                                                        : "text-muted-foreground",
                                                )}
                                            >
                                                <CalendarDays className="size-3.5 flex-shrink-0 text-muted-foreground" />
                                                {form.dueDate
                                                    ? format(
                                                          form.dueDate,
                                                          "MMM d, yyyy",
                                                      )
                                                    : "Pick a date"}
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className="p-0"
                                            align="start"
                                        >
                                            <Calendar
                                                mode="single"
                                                selected={form.dueDate}
                                                onSelect={(d) => {
                                                    update("dueDate", d);
                                                    setCalOpen(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
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
                                                onClick={() =>
                                                    update("priority", p)
                                                }
                                                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].color} ${form.priority === p ? "ring-1 ring-current" : "opacity-60 hover:opacity-100"}`}
                                            >
                                                {PRIORITY_CONFIG[p].icon}
                                                {PRIORITY_CONFIG[p].label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Section>
                    <Section
                        icon={<UserPlus className="size-4" />}
                        title="Assignments"
                        badge={form.assignees.length}
                    >
                        <div className="space-y-3">
                            {selectedMembers.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedMembers.map((m) => (
                                        <div
                                            key={m.id}
                                            className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-2.5 py-1.5"
                                        >
                                            <div
                                                className="flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                                style={{
                                                    backgroundColor: m.color,
                                                }}
                                            >
                                                {m.initials}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium leading-none">
                                                    {m.name}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleAssignee(m.id)
                                                }
                                                className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                                {MEMBERS.filter(
                                    (m) => !form.assignees.includes(m.id),
                                ).map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => toggleAssignee(m.id)}
                                        className="flex items-center gap-1.5 rounded-md border border-border/60 bg-white px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                                    >
                                        <div
                                            className="flex size-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                                            style={{ backgroundColor: m.color }}
                                        >
                                            {m.initials}
                                        </div>
                                        {m.name}
                                        <Plus className="size-3 opacity-50" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Section>
                    <Section
                        icon={<Layers className="size-4" />}
                        title="Categories"
                        badge={form.categories.length}
                        defaultOpen={false}
                    >
                        <div className="space-y-3">
                            {form.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {form.categories.map((cat) => (
                                        <Chip
                                            key={cat}
                                            label={cat}
                                            color={newCategoryColor}
                                            onRemove={() => removeCategory(cat)}
                                        />
                                    ))}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                                {CATEGORIES.filter(
                                    (c) => !form.categories.includes(c),
                                ).map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() =>
                                            update("categories", [
                                                ...form.categories,
                                                c,
                                            ])
                                        }
                                        className="rounded-full border border-border/60 bg-white px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                                    >
                                        + {c}
                                    </button>
                                ))}
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                    Custom Category
                                </p>
                                <ColorDotPicker
                                    value={newCategoryColor}
                                    onChange={setNewCategoryColor}
                                    colors={CATEGORY_COLORS}
                                />
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Category name…"
                                        value={newCategory}
                                        onChange={(e) =>
                                            setNewCategory(e.target.value)
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
                        icon={<CheckSquare className="size-4" />}
                        title="Checklist"
                        badge={
                            form.checklist.length > 0
                                ? form.checklist.length
                                : undefined
                        }
                        defaultOpen={false}
                    >
                        <div className="space-y-3">
                            {form.checklist.length > 0 && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-bright-blue transition-all duration-500"
                                                style={{
                                                    width: `${(completedChecks / form.checklist.length) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            {completedChecks}/
                                            {form.checklist.length}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {form.checklist.map((item) => (
                                            <div
                                                key={item.id}
                                                className="group flex items-center gap-3 rounded-md border border-border/50 bg-white px-3 py-2"
                                            >
                                                <Checkbox
                                                    checked={item.done}
                                                    onCheckedChange={() =>
                                                        toggleCheck(item.id)
                                                    }
                                                    className="rounded-md border-border data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                                                />
                                                <span
                                                    className={cn(
                                                        "flex-1 text-sm",
                                                        item.done
                                                            ? "text-muted-foreground line-through"
                                                            : "text-foreground",
                                                    )}
                                                >
                                                    {item.text}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeCheck(item.id)
                                                    }
                                                    className="text-muted-foreground/50 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                                                >
                                                    <X className="size-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add checklist item…"
                                    value={newCheckItem}
                                    onChange={(e) =>
                                        setNewCheckItem(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        (e.preventDefault(), addCheckItem())
                                    }
                                    className="h-8 flex-1 bg-white text-sm focus-visible:ring-1 focus-visible:ring-bright-blue"
                                />
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={addCheckItem}
                                    className="h-8 gap-1"
                                >
                                    <Plus className="size-3.5" /> Add
                                </Button>
                            </div>
                        </div>
                    </Section>
                    <Section
                        icon={<Paperclip className="size-4" />}
                        title="Attachments"
                        badge={
                            form.attachments.length > 0
                                ? form.attachments.length
                                : undefined
                        }
                        defaultOpen={false}
                    >
                        <div className="space-y-3">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            {form.attachments.length > 0 && (
                                <div className="space-y-1.5">
                                    {form.attachments.map((a) => (
                                        <div
                                            key={a.id}
                                            className="group flex items-center gap-2.5 rounded-md border border-border/50 bg-white px-3 py-2"
                                        >
                                            <div
                                                className="flex size-7 flex-shrink-0 items-center justify-center rounded-md"
                                                style={{
                                                    backgroundColor:
                                                        accentColor + "22",
                                                }}
                                            >
                                                <Paperclip
                                                    className="size-3.5"
                                                    style={{
                                                        color: accentColor,
                                                    }}
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium">
                                                    {a.name}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {a.size}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeAttachment(a.id)
                                                }
                                                className="text-muted-foreground/50 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex w-full items-center gap-2 rounded-md border border-dashed border-border/60 bg-white px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted/30 hover:text-foreground"
                            >
                                <Upload className="size-3.5" />
                                Upload files or drag &amp; drop
                            </button>
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
                            <Plus className="size-4" /> Create Task
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
