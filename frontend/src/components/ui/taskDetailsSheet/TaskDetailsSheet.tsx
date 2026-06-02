"use client";

import { useState, useRef, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/shadcn/sheet";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/shadcn/popover";
import { Calendar } from "@/components/ui/shadcn/calendar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/shadcn/tooltip";
import {
    ArrowDown,
    ArrowUp,
    CalendarDays,
    Check,
    CheckSquare2,
    ChevronDown,
    Clock,
    Copy,
    Edit2,
    ExternalLink,
    FileText,
    Flame,
    Link2,
    Minus,
    MoreHorizontal,
    Paperclip,
    Plus,
    Send,
    Tag,
    Trash2,
    Upload,
    UserPlus,
    X,
    ZapIcon,
} from "lucide-react";
import {
    format,
    formatDistanceToNow,
    isPast,
    isToday,
    isTomorrow,
} from "date-fns";
import { cn } from "@/libs/utils";

type Priority = "critical" | "high" | "medium" | "low";
type Status = "todo" | "in_progress" | "in_review" | "done";

interface Member {
    id: string;
    name: string;
    initials: string;
    color: string;
}

interface ChecklistItem {
    id: string;
    text: string;
    done: boolean;
}

interface Attachment {
    id: string;
    name: string;
    size: string;
    type: "image" | "doc" | "pdf" | "other";
    uploadedAt: Date;
    uploadedBy: string;
}

interface ActivityEntry {
    id: string;
    type: "comment" | "change";
    authorId: string;
    content: string;
    timestamp: Date;
    field?: string;
    from?: string;
    to?: string;
}

export interface TaskData {
    id: string;
    title: string;
    description: string;
    status: Status;
    priority: Priority;
    assignees: string[];
    dueDate: Date | undefined;
    categories: string[];
    attachments: Attachment[];
    checklist: ChecklistItem[];
    activity: ActivityEntry[];
    createdAt: Date;
    createdBy: string;
}

const PRIORITY_META: Record<
    Priority,
    {
        label: string;
        icon: React.ReactNode;
        color: string;
        bg: string;
        border: string;
    }
> = {
    critical: {
        label: "Critical",
        icon: <Flame size={12} />,
        color: "#D93025",
        bg: "#FEF0EF",
        border: "#FACACB",
    },
    high: {
        label: "High",
        icon: <ArrowUp size={12} />,
        color: "#C9620A",
        bg: "#FEF4EC",
        border: "#FCD9B5",
    },
    medium: {
        label: "Medium",
        icon: <Minus size={12} />,
        color: "#1A6BBF",
        bg: "#EEF4FD",
        border: "#BDD5F5",
    },
    low: {
        label: "Low",
        icon: <ArrowDown size={12} />,
        color: "#1E7E3A",
        bg: "#EEFAF2",
        border: "#AEDFC0",
    },
};

const STATUS_META: Record<
    Status,
    {
        label: string;
        color: string;
        bg: string;
        border: string;
        dot: string;
    }
> = {
    todo: {
        label: "To Do",
        color: "#6B7280",
        bg: "#F9FAFB",
        border: "#E5E7EB",
        dot: "#D1D5DB",
    },
    in_progress: {
        label: "In Progress",
        color: "#1A6BBF",
        bg: "#EEF4FD",
        border: "#BDD5F5",
        dot: "#1A6BBF",
    },
    in_review: {
        label: "In Review",
        color: "#C9620A",
        bg: "#FEF4EC",
        border: "#FCD9B5",
        dot: "#C9620A",
    },
    done: {
        label: "Done",
        color: "#1E7E3A",
        bg: "#EEFAF2",
        border: "#AEDFC0",
        dot: "#1E7E3A",
    },
};

const MEMBERS: Member[] = [
    { id: "m1", name: "Sofia Marchetti", initials: "SM", color: "#7C5CBF" },
    { id: "m2", name: "Luca Ferrara", initials: "LF", color: "#2A9D8F" },
    { id: "m3", name: "Anna Kowalski", initials: "AK", color: "#E76F51" },
    { id: "m4", name: "James Okafor", initials: "JO", color: "#264653" },
    { id: "m5", name: "Mei Lin", initials: "ML", color: "#C09A3A" },
];

const CATEGORIES_OPTIONS = [
    "Design",
    "Engineering",
    "Research",
    "Marketing",
    "QA",
    "DevOps",
    "Product",
    "Data",
];

const ATTACHMENT_ICONS: Record<Attachment["type"], React.ReactNode> = {
    image: (
        <span className="text-[10px] font-bold" style={{ color: "#1A6BBF" }}>
            IMG
        </span>
    ),
    doc: <FileText size={12} style={{ color: "#7C5CBF" }} />,
    pdf: (
        <span className="text-[10px] font-bold" style={{ color: "#D93025" }}>
            PDF
        </span>
    ),
    other: <Paperclip size={12} style={{ color: "#6b7280" }} />,
};

export const DEMO_TASK: TaskData = {
    id: "t-001",
    title: "Redesign onboarding flow",
    description:
        "Overhaul the end-to-end onboarding experience based on user research findings from Q2. Covers welcome screen, profile setup, tutorial tooltips, and first-run empty states.",
    status: "in_progress",
    priority: "high",
    assignees: ["m1", "m2"],
    dueDate: new Date(Date.now() + 2 * 86400000),
    categories: ["Design", "Research"],
    attachments: [
        {
            id: "a1",
            name: "onboarding-wireframes.fig",
            size: "4.2 MB",
            type: "doc",
            uploadedAt: new Date(Date.now() - 3 * 86400000),
            uploadedBy: "m1",
        },
        {
            id: "a2",
            name: "user-journey-map.pdf",
            size: "1.8 MB",
            type: "pdf",
            uploadedAt: new Date(Date.now() - 1 * 86400000),
            uploadedBy: "m2",
        },
        {
            id: "a3",
            name: "screen-recording.mp4",
            size: "22.4 MB",
            type: "other",
            uploadedAt: new Date(Date.now() - 86400000),
            uploadedBy: "m1",
        },
    ],
    checklist: [
        {
            id: "c1",
            text: "Audit current onboarding drop-off points",
            done: true,
        },
        {
            id: "c2",
            text: "Create low-fi wireframes for all 5 screens",
            done: true,
        },
        { id: "c3", text: "Conduct 6 usability tests", done: true },
        {
            id: "c4",
            text: "Design high-fidelity mockups in Figma",
            done: false,
        },
        { id: "c5", text: "Hand off assets to engineering", done: false },
        { id: "c6", text: "QA review on staging", done: false },
    ],
    activity: [
        {
            id: "act1",
            type: "change",
            authorId: "m1",
            content: "created this task",
            timestamp: new Date(Date.now() - 5 * 86400000),
        },
        {
            id: "act2",
            type: "change",
            authorId: "m2",
            content: "changed status",
            timestamp: new Date(Date.now() - 4 * 86400000),
            field: "status",
            from: "To Do",
            to: "In Progress",
        },
        {
            id: "act3",
            type: "comment",
            authorId: "m3",
            content:
                "Checked the wireframes — they look solid. One concern: the progress indicator on step 3 might be confusing for mobile users. Let's discuss in standup.",
            timestamp: new Date(Date.now() - 2 * 86400000),
        },
        {
            id: "act4",
            type: "change",
            authorId: "m1",
            content: "added Anna Kowalski",
            timestamp: new Date(Date.now() - 1 * 86400000),
            field: "assignees",
        },
        {
            id: "act5",
            type: "comment",
            authorId: "m1",
            content:
                "Usability tests done! All 6 participants completed onboarding successfully. Handing off design files this afternoon.",
            timestamp: new Date(Date.now() - 3600000),
        },
    ],
    createdAt: new Date(Date.now() - 5 * 86400000),
    createdBy: "m1",
};

function dueDateMeta(
    date: Date | undefined,
): { text: string; color: string; bg: string; border: string } | null {
    if (!date) return null;
    if (!isToday(date) && isPast(date))
        return {
            text: "Overdue",
            color: "#D93025",
            bg: "#FEF0EF",
            border: "#FACACB",
        };
    if (isToday(date))
        return {
            text: "Today",
            color: "#C9620A",
            bg: "#FEF4EC",
            border: "#FCD9B5",
        };
    if (isTomorrow(date))
        return {
            text: "Tomorrow",
            color: "#1A6BBF",
            bg: "#EEF4FD",
            border: "#BDD5F5",
        };
    return {
        text: format(date, "MMM d, yyyy"),
        color: "#374151",
        bg: "#F9FAFB",
        border: "#E5E7EB",
    };
}

function FieldRow({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="group/row flex items-center gap-3 py-2.5">
            <div className="flex w-32 shrink-0 items-center gap-1.5 pt-0.5">
                <span className="mb-0.5 text-gray-500">{icon}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {label}
                </span>
            </div>
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}

interface TaskDetailsSheetProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    task?: TaskData;
    onSave?: (task: TaskData) => void;
    onDelete?: (id: string) => void;
}

export function TaskDetailsSheet({
    open,
    onOpenChange,
    task: initialTask = DEMO_TASK,
    onSave,
    onDelete,
}: TaskDetailsSheetProps) {
    const [task, setTask] = useState<TaskData>(initialTask);
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDesc, setEditingDesc] = useState(false);
    const [calOpen, setCalOpen] = useState(false);
    const [assigneeOpen, setAssigneeOpen] = useState(false);
    const [catOpen, setCatOpen] = useState(false);
    const [newCheckItem, setNewCheckItem] = useState("");
    const [newComment, setNewComment] = useState("");
    const [linkCopied, setLinkCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const titleRef = useRef<HTMLTextAreaElement>(null);

    const update = useCallback(
        <K extends keyof TaskData>(key: K, value: TaskData[K]) =>
            setTask((t) => ({ ...t, [key]: value })),
        [],
    );

    const addCheckItem = () => {
        if (!newCheckItem.trim()) return;
        update("checklist", [
            ...task.checklist,
            { id: crypto.randomUUID(), text: newCheckItem.trim(), done: false },
        ]);
        setNewCheckItem("");
    };

    const toggleCheckItem = (id: string) =>
        update(
            "checklist",
            task.checklist.map((i) =>
                i.id === id ? { ...i, done: !i.done } : i,
            ),
        );

    const removeCheckItem = (id: string) =>
        update(
            "checklist",
            task.checklist.filter((i) => i.id !== id),
        );

    const updateCheckText = (id: string, text: string) =>
        update(
            "checklist",
            task.checklist.map((i) => (i.id === id ? { ...i, text } : i)),
        );

    const toggleAssignee = (id: string) =>
        update(
            "assignees",
            task.assignees.includes(id)
                ? task.assignees.filter((a) => a !== id)
                : [...task.assignees, id],
        );

    const toggleCategory = (cat: string) =>
        update(
            "categories",
            task.categories.includes(cat)
                ? task.categories.filter((c) => c !== cat)
                : [...task.categories, cat],
        );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const mapped: Attachment[] = files.map((f) => ({
            id: crypto.randomUUID(),
            name: f.name,
            size: `${(f.size / 1024).toFixed(1)} KB`,
            type: f.type.startsWith("image/")
                ? "image"
                : f.type === "application/pdf"
                  ? "pdf"
                  : "other",
            uploadedAt: new Date(),
            uploadedBy: "m1",
        }));
        update("attachments", [...task.attachments, ...mapped]);
        e.target.value = "";
    };

    const removeAttachment = (id: string) =>
        update(
            "attachments",
            task.attachments.filter((a) => a.id !== id),
        );

    const addComment = () => {
        if (!newComment.trim()) return;
        const entry: ActivityEntry = {
            id: crypto.randomUUID(),
            type: "comment",
            authorId: "m1",
            content: newComment.trim(),
            timestamp: new Date(),
        };
        update("activity", [...task.activity, entry]);
        setNewComment("");
    };

    const handleCopyLink = () => {
        navigator.clipboard
            .writeText(`https://app.kanban.io/task/${task.id}`)
            .catch(() => {});
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    const handleSave = () => {
        onSave?.(task);
        onOpenChange(false);
    };

    const pm = PRIORITY_META[task.priority];
    const sm = STATUS_META[task.status];
    const ddMeta = dueDateMeta(task.dueDate);
    const doneChecks = task.checklist.filter((i) => i.done).length;
    const totalChecks = task.checklist.length;
    const checklistPct = totalChecks
        ? Math.round((doneChecks / totalChecks) * 100)
        : 0;
    const assignedMembers = MEMBERS.filter((m) =>
        task.assignees.includes(m.id),
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex min-w-[620px] max-w-[100vw] flex-col gap-0 bg-white p-0 outline-none [&>button:first-of-type]:hidden"
            >
                <SheetHeader className="shrink-0 px-6 py-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:brightness-95"
                                        style={{
                                            background: sm.bg,
                                            color: sm.color,
                                            border: `1px solid ${sm.border}`,
                                        }}
                                    >
                                        <span
                                            className="size-1.5 rounded-full"
                                            style={{ background: sm.dot }}
                                        />
                                        {sm.label}
                                        <ChevronDown size={11} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {(Object.keys(STATUS_META) as Status[]).map(
                                        (s) => (
                                            <DropdownMenuItem
                                                key={s}
                                                className="cursor-pointer gap-2 text-sm"
                                                onClick={() =>
                                                    update("status", s)
                                                }
                                            >
                                                <span
                                                    className="size-2 rounded-full"
                                                    style={{
                                                        background:
                                                            STATUS_META[s].dot,
                                                    }}
                                                />
                                                {STATUS_META[s].label}
                                                {task.status === s && (
                                                    <Check
                                                        size={12}
                                                        className="ml-auto text-bright-blue"
                                                    />
                                                )}
                                            </DropdownMenuItem>
                                        ),
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:brightness-95"
                                        style={{
                                            background: pm.bg,
                                            color: pm.color,
                                            border: `1px solid ${pm.border}`,
                                        }}
                                    >
                                        {pm.icon}
                                        {pm.label}
                                        <ChevronDown size={11} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {(
                                        Object.keys(PRIORITY_META) as Priority[]
                                    ).map((p) => (
                                        <DropdownMenuItem
                                            key={p}
                                            className="cursor-pointer gap-2 text-sm"
                                            style={{
                                                color: PRIORITY_META[p].color,
                                            }}
                                            onClick={() =>
                                                update("priority", p)
                                            }
                                        >
                                            {PRIORITY_META[p].icon}
                                            {PRIORITY_META[p].label}
                                            {task.priority === p && (
                                                <Check
                                                    size={12}
                                                    className="ml-auto text-bright-blue"
                                                />
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={handleCopyLink}
                                        className="flex size-8 items-center justify-center rounded-md transition-colors hover:bg-gray-100"
                                        style={{
                                            color: linkCopied
                                                ? "#1E7E3A"
                                                : "#6b7280",
                                        }}
                                    >
                                        {linkCopied ? (
                                            <Check size={14} />
                                        ) : (
                                            <Link2 size={14} />
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {linkCopied ? "Copied!" : "Copy link"}
                                </TooltipContent>
                            </Tooltip>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100">
                                        <MoreHorizontal size={15} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="cursor-pointer gap-2 text-sm">
                                        <ExternalLink
                                            size={13}
                                            className="text-gray-500"
                                        />{" "}
                                        Open full page
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer gap-2 text-sm">
                                        <Copy
                                            size={13}
                                            className="text-gray-500"
                                        />{" "}
                                        Duplicate task
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="cursor-pointer gap-2 text-sm text-red-500 focus:text-red-500"
                                        onClick={() => {
                                            onDelete?.(task.id);
                                            onOpenChange(false);
                                        }}
                                    >
                                        <Trash2 size={13} /> Delete task
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="ml-1 flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>
                </SheetHeader>
                <ScrollArea className="flex-1">
                    <div className="space-y-5 px-6 pb-6 pt-4">
                        <div className="space-y-2">
                            <div>
                                {editingTitle ? (
                                    <Textarea
                                        ref={titleRef}
                                        autoFocus
                                        value={task.title}
                                        onChange={(e) =>
                                            update("title", e.target.value)
                                        }
                                        onBlur={() => setEditingTitle(false)}
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" &&
                                                !e.shiftKey
                                            ) {
                                                e.preventDefault();
                                                setEditingTitle(false);
                                            }
                                        }}
                                        rows={2}
                                        className="resize-none rounded-none border-0 border-b bg-transparent px-0 text-xl font-bold leading-tight transition-colors focus-visible:border-bright-blue focus-visible:ring-0"
                                    />
                                ) : (
                                    <h1
                                        onClick={() => setEditingTitle(true)}
                                        className="group -mx-2 flex cursor-text items-start gap-2 rounded-md px-2 py-1 text-xl font-bold leading-tight transition-colors hover:bg-gray-50"
                                    >
                                        <span className="flex-1">
                                            {task.title || (
                                                <span className="text-gray-300">
                                                    Untitled task
                                                </span>
                                            )}
                                        </span>
                                        <Edit2
                                            size={13}
                                            className="mt-1.5 shrink-0 text-gray-500 opacity-0 transition-opacity group-hover:opacity-100"
                                        />
                                    </h1>
                                )}
                            </div>
                            <div className="mb-5">
                                <FieldRow
                                    icon={<CalendarDays size={13} />}
                                    label="Due date"
                                >
                                    <Popover
                                        open={calOpen}
                                        onOpenChange={setCalOpen}
                                    >
                                        <PopoverTrigger asChild>
                                            <button className="-mx-2 flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-gray-50">
                                                {ddMeta ? (
                                                    <span
                                                        className="flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium"
                                                        style={{
                                                            background:
                                                                ddMeta.bg,
                                                            color: ddMeta.color,
                                                            border: `1px solid ${ddMeta.border}`,
                                                        }}
                                                    >
                                                        <CalendarDays
                                                            size={11}
                                                        />
                                                        {ddMeta.text !==
                                                            "Overdue" &&
                                                        ddMeta.text !==
                                                            "Today" &&
                                                        ddMeta.text !==
                                                            "Tomorrow"
                                                            ? ddMeta.text
                                                            : `${ddMeta.text} · ${format(task.dueDate!, "MMM d")}`}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-300">
                                                        No due date
                                                    </span>
                                                )}
                                                {task.dueDate && (
                                                    <X
                                                        size={11}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            update(
                                                                "dueDate",
                                                                undefined,
                                                            );
                                                        }}
                                                        className="text-gray-500 transition-colors hover:text-red-400"
                                                    />
                                                )}
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-0">
                                            <Calendar
                                                mode="single"
                                                selected={task.dueDate}
                                                onSelect={(d) => {
                                                    update("dueDate", d);
                                                    setCalOpen(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FieldRow>
                                <FieldRow
                                    icon={<UserPlus size={13} />}
                                    label="Assignees"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        {assignedMembers.map((m) => (
                                            <Tooltip key={m.id}>
                                                <TooltipTrigger asChild>
                                                    <div className="group/av relative">
                                                        <Avatar className="size-7 cursor-pointer ring-2 ring-white">
                                                            <AvatarFallback
                                                                className="text-[10px] font-bold text-white"
                                                                style={{
                                                                    background:
                                                                        m.color,
                                                                }}
                                                            >
                                                                {m.initials}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <button
                                                            onClick={() =>
                                                                toggleAssignee(
                                                                    m.id,
                                                                )
                                                            }
                                                            className="absolute -right-0.5 -top-0.5 hidden size-3.5 items-center justify-center rounded-full bg-red-500 group-hover/av:flex"
                                                        >
                                                            <X
                                                                size={7}
                                                                className="text-white"
                                                            />
                                                        </button>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {m.name}
                                                </TooltipContent>
                                            </Tooltip>
                                        ))}
                                        <Popover
                                            open={assigneeOpen}
                                            onOpenChange={setAssigneeOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <button className="flex size-7 items-center justify-center rounded-full border border-dashed transition-colors hover:border-bright-blue hover:bg-bright-blue/5">
                                                    <Plus
                                                        size={12}
                                                        className="text-gray-500"
                                                    />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-52 p-1.5">
                                                {MEMBERS.map((m) => {
                                                    const sel =
                                                        task.assignees.includes(
                                                            m.id,
                                                        );
                                                    return (
                                                        <button
                                                            key={m.id}
                                                            onClick={() =>
                                                                toggleAssignee(
                                                                    m.id,
                                                                )
                                                            }
                                                            className={cn(
                                                                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                                                                sel
                                                                    ? "bg-gray-50"
                                                                    : "hover:bg-gray-50",
                                                            )}
                                                        >
                                                            <Avatar className="size-6">
                                                                <AvatarFallback
                                                                    className="text-[10px] font-bold text-white"
                                                                    style={{
                                                                        background:
                                                                            m.color,
                                                                    }}
                                                                >
                                                                    {m.initials}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span>
                                                                {m.name}
                                                            </span>
                                                            {sel && (
                                                                <Check
                                                                    size={12}
                                                                    className="ml-auto text-bright-blue"
                                                                />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </PopoverContent>
                                        </Popover>
                                        {assignedMembers.length === 0 && (
                                            <span className="text-sm text-gray-300">
                                                No assignees
                                            </span>
                                        )}
                                    </div>
                                </FieldRow>
                                <FieldRow
                                    icon={<Tag size={13} />}
                                    label="Categories"
                                >
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {task.categories.map((cat) => (
                                            <span
                                                key={cat}
                                                className="flex cursor-pointer items-center gap-1 rounded-md border border-bright-blue px-2 py-0.5 text-xs font-medium text-bright-blue"
                                                onClick={() =>
                                                    toggleCategory(cat)
                                                }
                                            >
                                                {cat}
                                                <X size={9} />
                                            </span>
                                        ))}
                                        <Popover
                                            open={catOpen}
                                            onOpenChange={setCatOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <button className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-600">
                                                    <Plus size={12} />
                                                    Add
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-52 p-2">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {CATEGORIES_OPTIONS.map(
                                                        (c) => (
                                                            <button
                                                                key={c}
                                                                onClick={() =>
                                                                    toggleCategory(
                                                                        c,
                                                                    )
                                                                }
                                                                className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                                                                    task.categories.includes(
                                                                        c,
                                                                    )
                                                                        ? "border-bright-blue text-bright-blue"
                                                                        : ""
                                                                }`}
                                                            >
                                                                {c}
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        {task.categories.length === 0 && (
                                            <span className="text-sm text-gray-300">
                                                No categories
                                            </span>
                                        )}
                                    </div>
                                </FieldRow>
                                <FieldRow
                                    icon={<Clock size={13} />}
                                    label="Created"
                                >
                                    <span className="text-sm text-gray-500">
                                        {formatDistanceToNow(task.createdAt, {
                                            addSuffix: true,
                                        })}{" "}
                                        by{" "}
                                        <span className="font-medium text-black">
                                            {MEMBERS.find(
                                                (m) => m.id === task.createdBy,
                                            )?.name ?? "Unknown"}
                                        </span>
                                    </span>
                                </FieldRow>
                            </div>
                        </div>
                        <Separator />
                        <div className="mb-5">
                            <div className="mb-3 flex items-center gap-2">
                                <FileText size={13} className="text-gray-500" />
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Description
                                </span>
                            </div>
                            {editingDesc ? (
                                <Textarea
                                    autoFocus
                                    value={task.description}
                                    onChange={(e) =>
                                        update("description", e.target.value)
                                    }
                                    onBlur={() => setEditingDesc(false)}
                                    rows={5}
                                    className="resize-none rounded-md text-sm leading-relaxed placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                    placeholder="Add a description…"
                                />
                            ) : (
                                <div
                                    onClick={() => setEditingDesc(true)}
                                    className="group/desc cursor-text rounded-md border px-3 py-2.5 text-sm leading-relaxed transition-all hover:bg-gray-50"
                                    style={{
                                        color: task.description
                                            ? "#374151"
                                            : "#D1D5DB",
                                    }}
                                >
                                    {task.description || "Add a description…"}
                                    {task.description && (
                                        <Edit2
                                            size={11}
                                            className="ml-2 inline text-gray-500 opacity-0 transition-opacity group-hover/desc:opacity-100"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                        <Separator />
                        <div className="mb-5">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckSquare2
                                        size={13}
                                        className="text-gray-500"
                                    />
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Checklist
                                    </span>
                                    {totalChecks > 0 && (
                                        <span className="text-xs text-gray-500">
                                            {doneChecks}/{totalChecks}
                                        </span>
                                    )}
                                </div>
                                {totalChecks > 0 && (
                                    <span
                                        className="text-xs font-semibold"
                                        style={{
                                            color:
                                                checklistPct === 100
                                                    ? "#1E7E3A"
                                                    : "#0096FF",
                                        }}
                                    >
                                        {checklistPct}%
                                    </span>
                                )}
                            </div>
                            {totalChecks > 0 && (
                                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${checklistPct}%`,
                                            background:
                                                checklistPct === 100
                                                    ? "#1E7E3A"
                                                    : "#0096FF",
                                        }}
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                {task.checklist.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group/ci flex items-center gap-2.5 rounded-md px-1 py-0.5 transition-colors hover:bg-gray-50"
                                    >
                                        <Checkbox
                                            checked={item.done}
                                            onCheckedChange={() =>
                                                toggleCheckItem(item.id)
                                            }
                                            className="size-3.5 rounded border-gray-300 data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                                        />
                                        <Input
                                            value={item.text}
                                            onChange={(e) =>
                                                updateCheckText(
                                                    item.id,
                                                    e.target.value,
                                                )
                                            }
                                            className={cn(
                                                "h-auto flex-1 rounded-none border-0 bg-transparent px-0 py-0 text-sm focus-visible:ring-0",
                                                item.done ? "line-through" : "",
                                            )}
                                            style={{
                                                color: item.done
                                                    ? "#6b7280"
                                                    : "#374151",
                                            }}
                                        />
                                        <button
                                            onClick={() =>
                                                removeCheckItem(item.id)
                                            }
                                            className="shrink-0 text-gray-300 opacity-0 transition-all hover:text-red-400 group-hover/ci:opacity-100"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex gap-2">
                                <Input
                                    placeholder="Add item…"
                                    value={newCheckItem}
                                    onChange={(e) =>
                                        setNewCheckItem(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && addCheckItem()
                                    }
                                    className="h-8 flex-1 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                />
                                <Button
                                    size="sm"
                                    onClick={addCheckItem}
                                    className="h-8 rounded-md border bg-bright-blue px-3 transition-colors hover:bg-blue-600"
                                >
                                    <Plus size={13} />
                                </Button>
                            </div>
                        </div>
                        <Separator />
                        <div className="mb-5">
                            <div className="mb-3 flex items-center gap-2">
                                <Paperclip
                                    size={13}
                                    className="text-gray-500"
                                />
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Attachments
                                </span>
                                {task.attachments.length > 0 && (
                                    <span className="text-xs text-gray-500">
                                        {task.attachments.length}
                                    </span>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            {task.attachments.length > 0 && (
                                <div className="mb-2 space-y-2">
                                    {task.attachments.map((a) => (
                                        <div
                                            key={a.id}
                                            className="group/att flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-gray-50"
                                        >
                                            <div
                                                className="flex size-8 shrink-0 items-center justify-center rounded-md"
                                                style={{
                                                    background: "#EDE9FD",
                                                }}
                                            >
                                                {ATTACHMENT_ICONS[a.type]}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium">
                                                    {a.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {a.size} ·{" "}
                                                    {formatDistanceToNow(
                                                        a.uploadedAt,
                                                        { addSuffix: true },
                                                    )}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    removeAttachment(a.id)
                                                }
                                                className="shrink-0 text-gray-300 opacity-0 transition-all hover:text-red-400 group-hover/att:opacity-100"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50"
                            >
                                <Upload size={12} />
                                Upload file
                            </button>
                        </div>
                        <Separator />
                        <div className="mb-4 flex items-center gap-2">
                            <ZapIcon size={13} className="text-gray-500" />
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Activity
                            </span>
                        </div>
                        <div className="">
                            {task.activity.map((entry) => {
                                const author = MEMBERS.find(
                                    (m) => m.id === entry.authorId,
                                );

                                return (
                                    <div key={entry.id} className="mb-3">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="mt-0.5 size-7 shrink-0">
                                                <AvatarFallback
                                                    className="text-[10px] font-bold text-white"
                                                    style={{
                                                        background:
                                                            author?.color ??
                                                            "#6b7280",
                                                    }}
                                                >
                                                    {author?.initials ?? "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="text-xs font-semibold">
                                                        {author?.name}
                                                    </span>
                                                    <span className="ml-auto text-xs text-gray-300">
                                                        {formatDistanceToNow(
                                                            entry.timestamp,
                                                            {
                                                                addSuffix: true,
                                                            },
                                                        )}
                                                    </span>
                                                </div>
                                                {entry.type === "change" ? (
                                                    <div className="text-gray-500">
                                                        <span className="text-xs capitalize">
                                                            {entry.content}
                                                        </span>
                                                        {entry.from &&
                                                            entry.to && (
                                                                <>
                                                                    {" "}
                                                                    <span
                                                                        className="mx-0.5 rounded px-1.5 py-0.5 text-xs line-through"
                                                                        style={{
                                                                            background:
                                                                                "#FEF0EF",
                                                                            color: "#D93025",
                                                                        }}
                                                                    >
                                                                        {
                                                                            entry.from
                                                                        }
                                                                    </span>
                                                                    <span className="text-xs text-gray-500">
                                                                        →
                                                                    </span>
                                                                    <span
                                                                        className="mx-0.5 rounded px-1.5 py-0.5 text-xs"
                                                                        style={{
                                                                            background:
                                                                                "#EEFAF2",
                                                                            color: "#1E7E3A",
                                                                        }}
                                                                    >
                                                                        {
                                                                            entry.to
                                                                        }
                                                                    </span>
                                                                </>
                                                            )}
                                                    </div>
                                                ) : null}
                                                {entry.type === "comment" && (
                                                    <div className="mt-1.5 rounded-md rounded-tl-sm border px-3 py-2.5 text-sm leading-relaxed text-gray-700">
                                                        {entry.content}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Separator className="mt-3" />
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-5 flex items-start gap-3">
                            <Avatar className="mt-1 size-7 shrink-0">
                                <AvatarFallback
                                    className="text-[10px] font-bold text-white"
                                    style={{ background: "#7C5CBF" }}
                                >
                                    SM
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Textarea
                                    placeholder="Write a comment…"
                                    value={newComment}
                                    onChange={(e) =>
                                        setNewComment(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === "Enter" &&
                                            (e.metaKey || e.ctrlKey)
                                        )
                                            addComment();
                                    }}
                                    rows={3}
                                    className="resize-none rounded-md bg-gray-50 text-xs placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-[#0096FF]"
                                />
                                {newComment.trim() && (
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs text-gray-300">
                                            ⌘ + Enter to send
                                        </span>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() =>
                                                    setNewComment("")
                                                }
                                                className="h-7 rounded-md px-3 text-xs text-gray-500 hover:bg-gray-100"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={addComment}
                                                className="h-7 gap-2 rounded-md bg-bright-blue px-3 text-xs text-white hover:bg-blue-600 [&_svg]:size-3.5"
                                            >
                                                <Send />
                                                Send
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <div className="flex shrink-0 items-center justify-between border-t bg-gray-50 px-6 py-3.5">
                    <div className="flex items-center gap-2.5 text-xs text-gray-300">
                        <span
                            className="flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium"
                            style={{
                                background: sm.bg,
                                color: sm.color,
                                border: `1px solid ${sm.border}`,
                            }}
                        >
                            <span
                                className="size-1.5 rounded-full"
                                style={{ background: sm.dot }}
                            />
                            {sm.label}
                        </span>
                        {ddMeta && (
                            <span
                                className="flex items-center gap-1"
                                style={{ color: ddMeta.color }}
                            >
                                <CalendarDays size={11} />
                                {ddMeta.text}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="h-8 rounded-md px-4 text-sm hover:bg-gray-200"
                        >
                            Discard
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!task.title.trim()}
                            className="h-8 gap-1.5 rounded-md bg-bright-blue px-4 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-40"
                        >
                            <Check />
                            Save
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
