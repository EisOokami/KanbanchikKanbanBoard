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
import { format } from "date-fns";
import { cn, getInitials } from "@/libs/utils";
import Chip from "./chip/Chip";
import ColorDotPicker from "./colorDotPicker/ColorDotPicker";
import {
    MOCK_CATEGORIES,
    MOCK_MEMBERS,
    PRIORITY_CONFIG,
} from "@/constants/constants";
import { Priority } from "@/types/types";
import { TaskFormData } from "@/types/createTaskModal";
import {
    CalendarIcon,
    PaperclipIcon,
    PlusIcon,
    TrashSimpleIcon,
    UploadSimpleIcon,
    XIcon,
} from "@phosphor-icons/react";

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
    const [accentColor, setAccentColor] = useState<string>("#6366f1");
    const [form, setForm] = useState<TaskFormData>({
        title: "",
        description: "",
        dueDate: undefined,
        priority: null,
        categories: [],
        assignees: [],
        attachments: [],
        subtasks: [],
    });
    const [newCheckItem, setNewCheckItem] = useState<string>("");
    const [newCategory, setNewCategory] = useState<string>("");
    const [newCategoryColor, setNewCategoryColor] = useState<string>(
        Object.values(MOCK_CATEGORIES)[0].color,
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
        update("subtasks", [
            ...form.subtasks,
            {
                id: form.subtasks.length + 1,
                text: newCheckItem.trim(),
                position: form.subtasks.length,
                is_done: false,
                created_at: new Date(),
            },
        ]);
        setNewCheckItem("");
    };

    const toggleCheck = (id: number) =>
        update(
            "subtasks",
            form.subtasks.map((i) =>
                i.id === id ? { ...i, done: !i.is_done } : i,
            ),
        );

    const removeCheck = (id: number) =>
        update(
            "subtasks",
            form.subtasks.filter((i) => i.id !== id),
        );

    const toggleAssignee = (id: number) =>
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
                id: form.attachments.length + 1,
                uploader_id: form.attachments.length + 1,
                filename: f.name,
                file_url: "",
                mime_type: f.type,
                size_bytes: f.size,
                created_at: new Date(),
            })),
        ]);
        e.target.value = "";
    };

    const removeAttachment = (id: number) =>
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
            subtasks: [],
        });
        setAccentColor("#6366f1");
        setNewCheckItem("");
        setNewCategory("");
        setErrors({});
        onOpenChange(false);
    };

    const completedChecks = form.subtasks.filter((i) => i.is_done).length;
    const selectedMembers = Object.values(MOCK_MEMBERS).filter((m) =>
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
                <div className="flex-1 space-y-8 overflow-y-auto px-6 py-5">
                    <div className="space-y-1">
                        <label className="block font-semibold">
                            Task title <span className="text-red-500">*</span>
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
                    <div className="space-y-1">
                        <label className="block font-semibold">
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
                        <div className="space-y-1">
                            <label className="block font-semibold">
                                Due Date
                            </label>
                            <Popover open={calOpen} onOpenChange={setCalOpen}>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className={cn(
                                            "flex h-9 w-full items-center gap-1.5 rounded-md border border-input bg-white px-3 text-sm transition-colors hover:bg-muted/40",
                                            form.dueDate
                                                ? "text-foreground"
                                                : "text-muted-foreground",
                                        )}
                                    >
                                        <CalendarIcon
                                            weight="duotone"
                                            className="size-4 flex-shrink-0 text-muted-foreground"
                                        />
                                        {form.dueDate
                                            ? format(
                                                  form.dueDate,
                                                  "MMM d, yyyy",
                                              )
                                            : "Pick a date"}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0" align="start">
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
                        <div className="space-y-1">
                            <label className="block font-semibold">
                                Priority
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {(
                                    Object.keys(PRIORITY_CONFIG) as Priority[]
                                ).map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => update("priority", p)}
                                        className={cn(
                                            "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                                            form.priority === p
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
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Assignments</h3>
                        <div className="space-y-3">
                            {selectedMembers.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-2.5 py-1.5"
                                        >
                                            <div
                                                className="flex size-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                                style={{
                                                    backgroundColor:
                                                        member.color,
                                                }}
                                            >
                                                {getInitials(
                                                    member.name,
                                                    member.surname,
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium leading-none">
                                                    {member.name}{" "}
                                                    {member.surname}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleAssignee(member.id)
                                                }
                                                className="ml-1 text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                <XIcon
                                                    weight="duotone"
                                                    className="size-3.5"
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                                {Object.values(MOCK_MEMBERS)
                                    .filter(
                                        (member) =>
                                            !form.assignees.includes(member.id),
                                    )
                                    .map((member) => (
                                        <button
                                            key={member.id}
                                            type="button"
                                            onClick={() =>
                                                toggleAssignee(member.id)
                                            }
                                            className="flex items-center gap-1.5 rounded-md border border-border/60 bg-white px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                                        >
                                            <div
                                                className="flex size-5 items-center justify-center rounded-full text-[10px] font-medium text-white"
                                                style={{
                                                    backgroundColor:
                                                        member.color,
                                                }}
                                            >
                                                {getInitials(
                                                    member.name,
                                                    member.surname,
                                                )}
                                            </div>
                                            {member.name}
                                            <PlusIcon
                                                weight="duotone"
                                                className="size-4 opacity-50"
                                            />
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Categories</h3>
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
                                {Object.keys(MOCK_CATEGORIES)
                                    .filter((c) => !form.categories.includes(c))
                                    .map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() =>
                                                update("categories", [
                                                    ...form.categories,
                                                    c,
                                                ])
                                            }
                                            className="flex items-center gap-1 rounded-md border border-border/60 bg-white px-2.5 py-0.5 text-sm capitalize text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                                        >
                                            {c}
                                            <PlusIcon
                                                weight="duotone"
                                                className="size-4"
                                            />
                                        </button>
                                    ))}
                            </div>
                            <div className="space-y-4">
                                <ColorDotPicker
                                    value={newCategoryColor}
                                    onChange={setNewCategoryColor}
                                    colors={Object.values(MOCK_CATEGORIES).map(
                                        (category) => category.color,
                                    )}
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
                                        onClick={addCategory}
                                        className="h-8 gap-1 bg-bright-blue text-white hover:bg-blue-600"
                                    >
                                        <PlusIcon
                                            weight="duotone"
                                            className="size-3.5"
                                        />{" "}
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Checklist</h3>
                        <div className="space-y-3">
                            {form.subtasks.length > 0 && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-bright-blue transition-all duration-500"
                                                style={{
                                                    width: `${(completedChecks / form.subtasks.length) * 100}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            {completedChecks}/
                                            {form.subtasks.length}
                                        </span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {form.subtasks.map((item) => (
                                            <div
                                                key={item.id}
                                                className="group flex items-center gap-3 rounded-md border border-border/50 bg-white px-3 py-2"
                                            >
                                                <Checkbox
                                                    checked={item.is_done}
                                                    onCheckedChange={() =>
                                                        toggleCheck(item.id)
                                                    }
                                                    className="rounded-md border-border data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                                                />
                                                <span
                                                    className={cn(
                                                        "flex-1 text-sm",
                                                        item.is_done
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
                                                    <XIcon
                                                        weight="duotone"
                                                        className="size-3.5"
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add subtasks item…"
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
                                    onClick={addCheckItem}
                                    className="h-8 gap-1 bg-bright-blue text-white hover:bg-blue-600"
                                >
                                    <PlusIcon
                                        weight="duotone"
                                        className="size-3.5"
                                    />{" "}
                                    Add
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Attachments</h3>
                        <div className="space-y-1">
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
                                                <PaperclipIcon
                                                    weight="duotone"
                                                    className="size-4"
                                                    style={{
                                                        color: accentColor,
                                                    }}
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium">
                                                    {a.filename}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {a.size_bytes}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeAttachment(a.id)
                                                }
                                                className="text-muted-foreground/50 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                                            >
                                                <TrashSimpleIcon
                                                    weight="duotone"
                                                    className="size-4"
                                                />
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
                                <UploadSimpleIcon
                                    weight="duotone"
                                    className="size-3.5"
                                />
                                Upload files or drag &amp; drop
                            </button>
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
                            className="h-9 gap-1.5 bg-bright-blue text-white hover:bg-blue-600"
                        >
                            <PlusIcon weight="duotone" className="size-4" />{" "}
                            Create Task
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
