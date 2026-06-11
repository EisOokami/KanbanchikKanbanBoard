"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/shadcn/sheet";
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
    DropdownMenuTrigger,
} from "@/components/ui/shadcn/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/shadcn/tooltip";
import { format, formatDistanceToNow } from "date-fns";
import { cn, getInitials, toDate } from "@/libs/utils";
import { commentsToActivity, dateMeta } from "@/libs/taskDetailsSheet";
import FieldRow from "../fieldRow/FieldRow";
import {
    Category,
    Label,
    User,
    Priority,
    Subtask,
    Task,
    Project,
} from "@/types/types";
import { MOCK_MEMBERS, PRIORITY_CONFIG } from "@/constants/constants";
import {
    ActivityChange,
    ActivityComment,
    ActivityEntry,
} from "@/types/taskDetailsSheet";
import {
    ArticleIcon,
    BookmarkSimpleIcon,
    CalendarBlankIcon,
    CalendarIcon,
    CaretDownIcon,
    CheckIcon,
    CheckSquareIcon,
    ClockIcon,
    FileIcon,
    LightningIcon,
    LinkIcon,
    PaperclipIcon,
    PaperPlaneTiltIcon,
    PencilSimpleIcon,
    PlusIcon,
    TagIcon,
    TrashSimpleIcon,
    UploadSimpleIcon,
    UserPlusIcon,
    XIcon,
} from "@phosphor-icons/react";

interface TaskDetailsSheetProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    selectedTask: Task;
    projectData: Project;
    onSave?: (task: Task) => void;
    onDelete?: (id: number) => void;
}

export function TaskDetailsSheet({
    open,
    onOpenChange,
    selectedTask,
    projectData,
    onSave,
    onDelete,
}: TaskDetailsSheetProps) {
    const [task, setTask] = useState<Task>(selectedTask);
    const [editingTitle, setEditingTitle] = useState<boolean>(false);
    const [editingDesc, setEditingDesc] = useState<boolean>(false);
    const [calOpen, setCalOpen] = useState<boolean>(false);
    const [memberOpen, setmemberOpen] = useState<boolean>(false);
    const [catOpen, setCatOpen] = useState<boolean>(false);
    const [labelOpen, setLabelOpen] = useState<boolean>(false);
    const [newSubtaskText, setNewSubtaskText] = useState<string>("");
    const [newComment, setNewComment] = useState<string>("");
    const [linkCopied, setLinkCopied] = useState<boolean>(false);
    const [activity, setActivity] = useState<ActivityEntry[]>(() =>
        commentsToActivity(selectedTask.comments),
    );
    const fileInputRef = useRef<HTMLInputElement>(null);
    const titleRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setTask(selectedTask);
    }, [selectedTask]);

    const update = useCallback(
        <K extends keyof Task>(key: K, value: Task[K]) =>
            setTask((t) => ({ ...t, [key]: value })),
        [],
    );

    const pushChange = useCallback(
        (field: string, from: string, to: string) => {
            const entry: ActivityChange = {
                id: Date.now(),
                type: "change",
                author: Object.values(MOCK_MEMBERS)[0],
                field,
                from,
                to,
                timestamp: new Date(),
            };
            setActivity((prev) => [...prev, entry]);
        },
        [],
    );

    const addSubtask = () => {
        if (!newSubtaskText.trim()) return;
        const next: Subtask = {
            id: Date.now(),
            title: newSubtaskText.trim(),
            is_done: false,
            created_at: new Date(),
            position: task.subtasks.length,
        };
        update("subtasks", [...task.subtasks, next]);
        setNewSubtaskText("");
    };

    const toggleSubtask = (id: number) =>
        update(
            "subtasks",
            task.subtasks.map((s) =>
                s.id === id ? { ...s, is_done: !s.is_done } : s,
            ),
        );

    const removeSubtask = (id: number) =>
        update(
            "subtasks",
            task.subtasks.filter((s) => s.id !== id),
        );

    const updateSubtaskText = (id: number, text: string) =>
        update(
            "subtasks",
            task.subtasks.map((s) => (s.id === id ? { ...s, text } : s)),
        );

    const togglemember = (member: Omit<User, "email">) => {
        const exists = task.members.some((a) => a.id === member.id);
        update(
            "members",
            exists
                ? task.members.filter((a) => a.id !== member.id)
                : [...task.members, member],
        );
        pushChange(
            "member",
            exists ? `${member.name} ${member.surname}` : "—",
            exists ? "—" : `${member.name} ${member.surname}`,
        );
    };

    const toggleCategory = (cat: Category) => {
        const exists = task.categories.some((c) => c.id === cat.id);
        update(
            "categories",
            exists
                ? task.categories.filter((c) => c.id !== cat.id)
                : [...task.categories, cat],
        );
        pushChange(
            "category",
            exists ? cat.name : "—",
            exists ? "—" : cat.name,
        );
    };

    const toggleLabel = (labelValue: Label) => {
        const exists = task.labels.some((label) => label.id === labelValue.id);

        update(
            "labels",
            exists
                ? task.labels.filter((label) => label.id !== labelValue.id)
                : [...task.labels, labelValue],
        );

        pushChange(
            "label",
            exists ? labelValue.name : "—",
            exists ? "—" : labelValue.name,
        );
    };

    const currentUser: Omit<User, "email"> = Object.values(MOCK_MEMBERS)[0];

    const addComment = () => {
        if (!newComment.trim()) return;
        const entry: ActivityComment = {
            id: Date.now(),
            type: "comment",
            author: currentUser,
            body: newComment.trim(),
            timestamp: new Date(),
        };
        update("comments", [
            ...task.comments,
            {
                id: entry.id,
                member: currentUser,
                body: entry.body,
                created_at: entry.timestamp,
                updated_at: null,
            },
        ]);
        setActivity((prev) => [...prev, entry]);
        setNewComment("");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const mapped = files.map((f) => ({
            id: Date.now() + Math.random(),
            uploader_id: currentUser.id,
            filename: f.name,
            file_url: URL.createObjectURL(f),
            mime_type: f.type,
            size_bytes: f.size,
            created_at: new Date(),
        }));
        update("attachments", [...task.attachments, ...mapped]);
        e.target.value = "";
    };

    const removeAttachment = (id: number) =>
        update(
            "attachments",
            task.attachments.filter((a) => a.id !== id),
        );

    const dueDate = toDate(task.due_date);
    const startDate = toDate(task.start_date);
    const dueDateMeta = dateMeta(dueDate);
    const startDateMeta = dateMeta(startDate);

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

    const pm = PRIORITY_CONFIG[task.priority];
    const doneSubtasks = task.subtasks.filter((s) => s.is_done).length;
    const totalSubtasks = task.subtasks.length;
    const subtasksPct = totalSubtasks
        ? Math.round((doneSubtasks / totalSubtasks) * 100)
        : 0;

    const createdAt = toDate(task.created_at) ?? new Date();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex min-w-[620px] max-w-[100vw] flex-col gap-0 bg-white p-0 outline-none [&>button:first-of-type]:hidden"
            >
                <SheetTitle className="hidden"></SheetTitle>
                <SheetHeader className="shrink-0 px-6 py-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:brightness-95">
                                        {task.column.name}
                                        <CaretDownIcon
                                            weight="duotone"
                                            size={12}
                                        />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {projectData.columns.map((column) => (
                                        <DropdownMenuItem
                                            key={column.id}
                                            className="cursor-pointer gap-2 text-sm"
                                            onClick={() => {
                                                pushChange(
                                                    "status",
                                                    task.column.name,
                                                    column.name,
                                                );
                                                update("column", column);
                                            }}
                                        >
                                            {column.name}
                                            {task.column.id === column.id && (
                                                <CheckIcon
                                                    weight="duotone"
                                                    size={12}
                                                    className="ml-auto text-bright-blue"
                                                />
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors hover:brightness-95">
                                        {pm.label}
                                        <CaretDownIcon
                                            weight="duotone"
                                            size={12}
                                        />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {(
                                        Object.keys(
                                            PRIORITY_CONFIG,
                                        ) as Priority[]
                                    ).map((p) => (
                                        <DropdownMenuItem
                                            key={p}
                                            className="cursor-pointer gap-2 text-sm"
                                            // style={{
                                            //     backgroundColor:
                                            //         PRIORITY_CONFIG[p].color,
                                            // }}
                                            onClick={() => {
                                                pushChange(
                                                    "priority",
                                                    PRIORITY_CONFIG[
                                                        task.priority
                                                    ].label,
                                                    PRIORITY_CONFIG[p].label,
                                                );
                                                update("priority", p);
                                            }}
                                        >
                                            {PRIORITY_CONFIG[p].label}
                                            {task.priority === p && (
                                                <CheckIcon
                                                    weight="duotone"
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
                                            <CheckIcon
                                                weight="duotone"
                                                size={18}
                                            />
                                        ) : (
                                            <LinkIcon
                                                weight="duotone"
                                                size={16}
                                            />
                                        )}
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {linkCopied ? "Copied!" : "Copy link"}
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        className="flex size-8 items-center justify-center rounded-md text-red-500 transition-colors hover:bg-red-50"
                                        onClick={() => {
                                            onDelete?.(task.id);
                                            onOpenChange(false);
                                        }}
                                    >
                                        <TrashSimpleIcon
                                            weight="duotone"
                                            size={16}
                                        />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Delete task</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        className="ml-1 flex size-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100"
                                        onClick={() => onOpenChange(false)}
                                    >
                                        <XIcon weight="duotone" size={18} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>Close task</TooltipContent>
                            </Tooltip>
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
                                        className="resize-none rounded-none border-0 border-b bg-transparent px-0 !text-xl font-bold leading-tight transition-colors focus-visible:border-bright-blue focus-visible:ring-0"
                                    />
                                ) : (
                                    <h1
                                        onClick={() => setEditingTitle(true)}
                                        className="group -mx-2 flex cursor-text items-center gap-2 rounded-md px-2 py-1 text-xl font-bold leading-tight transition-colors hover:bg-gray-50"
                                    >
                                        <span className="flex-1">
                                            {task.title || (
                                                <span className="text-gray-300">
                                                    Untitled task
                                                </span>
                                            )}
                                        </span>
                                        <PencilSimpleIcon
                                            weight="duotone"
                                            size={16}
                                            className="text-gray-500 opacity-0 transition-opacity group-hover:opacity-100"
                                        />
                                    </h1>
                                )}
                            </div>
                            <div className="mb-5">
                                <FieldRow
                                    icon={
                                        <CalendarBlankIcon
                                            weight="duotone"
                                            size={16}
                                        />
                                    }
                                    label="Start date"
                                >
                                    <Popover
                                        open={calOpen}
                                        onOpenChange={setCalOpen}
                                    >
                                        <PopoverTrigger asChild>
                                            <button className="-mx-2 flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-gray-50">
                                                {startDateMeta ? (
                                                    <span
                                                        className="flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium"
                                                        style={{
                                                            background:
                                                                startDateMeta.bg,
                                                            color: startDateMeta.color,
                                                            border: `1px solid ${startDateMeta.border}`,
                                                        }}
                                                    >
                                                        <CalendarIcon
                                                            weight="duotone"
                                                            size={14}
                                                        />
                                                        {startDateMeta.text !==
                                                            "Overdue" &&
                                                        startDateMeta.text !==
                                                            "Today" &&
                                                        startDateMeta.text !==
                                                            "Tomorrow"
                                                            ? startDateMeta.text
                                                            : `${startDateMeta.text} · ${format(startDate!, "MMM d")}`}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-300">
                                                        No start date
                                                    </span>
                                                )}
                                                {startDate && (
                                                    <XIcon
                                                        weight="duotone"
                                                        size={14}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            update(
                                                                "start_date",
                                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                                undefined as any,
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
                                                selected={
                                                    startDate ?? undefined
                                                }
                                                onSelect={(d) => {
                                                    update(
                                                        "start_date",
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        d ?? (undefined as any),
                                                    );
                                                    setCalOpen(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FieldRow>
                                <FieldRow
                                    icon={
                                        <CalendarBlankIcon
                                            weight="duotone"
                                            size={16}
                                        />
                                    }
                                    label="Due date"
                                >
                                    <Popover
                                        open={calOpen}
                                        onOpenChange={setCalOpen}
                                    >
                                        <PopoverTrigger asChild>
                                            <button className="-mx-2 flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-gray-50">
                                                {dueDateMeta ? (
                                                    <span
                                                        className="flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-sm font-medium"
                                                        style={{
                                                            background:
                                                                dueDateMeta.bg,
                                                            color: dueDateMeta.color,
                                                            border: `1px solid ${dueDateMeta.border}`,
                                                        }}
                                                    >
                                                        <CalendarIcon
                                                            weight="duotone"
                                                            size={14}
                                                        />
                                                        {dueDateMeta.text !==
                                                            "Overdue" &&
                                                        dueDateMeta.text !==
                                                            "Today" &&
                                                        dueDateMeta.text !==
                                                            "Tomorrow"
                                                            ? dueDateMeta.text
                                                            : `${dueDateMeta.text} · ${format(dueDate!, "MMM d")}`}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-300">
                                                        No due date
                                                    </span>
                                                )}
                                                {dueDate && (
                                                    <XIcon
                                                        weight="duotone"
                                                        size={14}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            update(
                                                                "due_date",
                                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                                undefined as any,
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
                                                selected={dueDate ?? undefined}
                                                onSelect={(d) => {
                                                    update(
                                                        "due_date",
                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        d ?? (undefined as any),
                                                    );
                                                    setCalOpen(false);
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FieldRow>
                                <FieldRow
                                    icon={
                                        <UserPlusIcon
                                            weight="duotone"
                                            size={16}
                                        />
                                    }
                                    label="members"
                                >
                                    <div className="flex flex-wrap items-center gap-2">
                                        {task.members.map((m) => (
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
                                                                {getInitials(
                                                                    m.name,
                                                                    m.surname,
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <button
                                                            onClick={() =>
                                                                togglemember(m)
                                                            }
                                                            className="absolute -right-0.5 -top-0.5 hidden size-3.5 items-center justify-center rounded-full bg-red-500 group-hover/av:flex"
                                                        >
                                                            <XIcon
                                                                weight="duotone"
                                                                size={10}
                                                                className="text-white"
                                                            />
                                                        </button>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {m.name} {m.surname}
                                                </TooltipContent>
                                            </Tooltip>
                                        ))}
                                        <Popover
                                            open={memberOpen}
                                            onOpenChange={setmemberOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <button className="flex size-7 items-center justify-center rounded-full border border-dashed transition-colors hover:border-bright-blue hover:bg-bright-blue/5">
                                                    <PlusIcon
                                                        weight="duotone"
                                                        size={16}
                                                        className="text-gray-500"
                                                    />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-52 p-1.5">
                                                {Object.values(
                                                    MOCK_MEMBERS,
                                                ).map((m) => {
                                                    const sel =
                                                        task.members.some(
                                                            (a) =>
                                                                a.id === m.id,
                                                        );
                                                    return (
                                                        <button
                                                            key={m.id}
                                                            onClick={() =>
                                                                togglemember(m)
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
                                                                    {getInitials(
                                                                        m.name,
                                                                        m.surname,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span>
                                                                {m.name}{" "}
                                                                {m.surname}
                                                            </span>
                                                            {sel && (
                                                                <CheckIcon
                                                                    weight="duotone"
                                                                    size={16}
                                                                    className="ml-auto text-bright-blue"
                                                                />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </PopoverContent>
                                        </Popover>
                                        {task.members.length === 0 && (
                                            <span className="text-sm text-gray-300">
                                                No members
                                            </span>
                                        )}
                                    </div>
                                </FieldRow>
                                <FieldRow
                                    icon={
                                        <TagIcon weight="duotone" size={16} />
                                    }
                                    label="Categories"
                                >
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {task.categories.map((category) => (
                                            <span
                                                key={category.id}
                                                className="flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium capitalize"
                                                style={{
                                                    backgroundColor:
                                                        category.color,
                                                    color: "#fff",
                                                }}
                                                onClick={() =>
                                                    toggleCategory(category)
                                                }
                                            >
                                                {category.name}
                                                <XIcon
                                                    weight="duotone"
                                                    size={14}
                                                />
                                            </span>
                                        ))}
                                        <Popover
                                            open={catOpen}
                                            onOpenChange={setCatOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <button className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-600">
                                                    <PlusIcon
                                                        weight="duotone"
                                                        size={14}
                                                    />
                                                    Add
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-52 p-2">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {projectData.categories.map(
                                                        (category) => {
                                                            const selectedCategory =
                                                                task.categories.some(
                                                                    (
                                                                        taskCategory,
                                                                    ) =>
                                                                        taskCategory.id ===
                                                                        category.id,
                                                                );

                                                            return (
                                                                <button
                                                                    key={
                                                                        category.id
                                                                    }
                                                                    onClick={() =>
                                                                        toggleCategory(
                                                                            category,
                                                                        )
                                                                    }
                                                                    className={cn(
                                                                        "rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                                                                        selectedCategory
                                                                            ? ""
                                                                            : "border-gray-200 text-gray-600 hover:bg-gray-50",
                                                                    )}
                                                                    style={{
                                                                        backgroundColor:
                                                                            selectedCategory
                                                                                ? category.color
                                                                                : undefined,
                                                                        color: selectedCategory
                                                                            ? "#fff"
                                                                            : undefined,
                                                                    }}
                                                                >
                                                                    {
                                                                        category.name
                                                                    }
                                                                </button>
                                                            );
                                                        },
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
                                    icon={
                                        <ClockIcon weight="duotone" size={16} />
                                    }
                                    label="Created"
                                >
                                    <span className="text-sm text-gray-500">
                                        {formatDistanceToNow(createdAt, {
                                            addSuffix: true,
                                        })}
                                    </span>
                                </FieldRow>
                                <FieldRow
                                    icon={
                                        <BookmarkSimpleIcon
                                            weight="duotone"
                                            size={16}
                                        />
                                    }
                                    label="Labels"
                                >
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {task.labels.map((label) => {
                                            const selectedLabel =
                                                projectData.labels.find(
                                                    (projectLabel) =>
                                                        projectLabel.id ===
                                                        label.id,
                                                );

                                            return (
                                                <span
                                                    key={label.id}
                                                    className="flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium capitalize transition-colors hover:opacity-80"
                                                    style={{
                                                        borderColor:
                                                            selectedLabel?.color ??
                                                            "#d1d5db",
                                                        color:
                                                            selectedLabel?.color ??
                                                            "#6b7280",
                                                        background:
                                                            selectedLabel
                                                                ? `${selectedLabel.color}18`
                                                                : "#f9fafb",
                                                    }}
                                                    onClick={() =>
                                                        selectedLabel &&
                                                        toggleLabel(
                                                            selectedLabel,
                                                        )
                                                    }
                                                >
                                                    {label.name}
                                                    <XIcon
                                                        weight="duotone"
                                                        size={14}
                                                    />
                                                </span>
                                            );
                                        })}
                                        <Popover
                                            open={labelOpen}
                                            onOpenChange={setLabelOpen}
                                        >
                                            <PopoverTrigger asChild>
                                                <button className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-600">
                                                    <PlusIcon
                                                        weight="duotone"
                                                        size={14}
                                                    />
                                                    Add
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-48 p-2">
                                                <div className="flex flex-col gap-0.5">
                                                    {projectData.labels.map(
                                                        (label) => {
                                                            const selectedLabel =
                                                                task.labels.some(
                                                                    (
                                                                        taskLabel,
                                                                    ) =>
                                                                        taskLabel.id ===
                                                                        label.id,
                                                                );

                                                            return (
                                                                <button
                                                                    key={
                                                                        label.id
                                                                    }
                                                                    onClick={() =>
                                                                        toggleLabel(
                                                                            label,
                                                                        )
                                                                    }
                                                                    className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs transition-colors hover:bg-gray-50"
                                                                >
                                                                    <span
                                                                        className="size-2 shrink-0 rounded-full"
                                                                        style={{
                                                                            background:
                                                                                label.color,
                                                                        }}
                                                                    />
                                                                    <span className="flex-1 text-left font-medium text-gray-700">
                                                                        {
                                                                            label.name
                                                                        }
                                                                    </span>
                                                                    {selectedLabel && (
                                                                        <CheckIcon
                                                                            weight="duotone"
                                                                            size={
                                                                                16
                                                                            }
                                                                            className="text-bright-blue"
                                                                        />
                                                                    )}
                                                                </button>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                        {task.labels.length === 0 && (
                                            <span className="text-sm text-gray-300">
                                                No labels
                                            </span>
                                        )}
                                    </div>
                                </FieldRow>
                            </div>
                        </div>
                        <Separator />
                        <div className="mb-5">
                            <div className="mb-3 flex items-center gap-1.5">
                                <ArticleIcon
                                    weight="duotone"
                                    size={16}
                                    className="text-gray-500"
                                />
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
                                        <PencilSimpleIcon
                                            weight="duotone"
                                            size={16}
                                            className="ml-2 inline text-gray-500 opacity-0 transition-opacity group-hover/desc:opacity-100"
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                        <Separator />
                        <div className="mb-5">
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <CheckSquareIcon
                                        weight="duotone"
                                        size={16}
                                        className="text-gray-500"
                                    />
                                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Subtasks
                                    </span>
                                    {totalSubtasks > 0 && (
                                        <span className="ml-1 text-xs text-gray-500">
                                            {doneSubtasks}/{totalSubtasks}
                                        </span>
                                    )}
                                </div>
                                {totalSubtasks > 0 && (
                                    <span
                                        className="text-xs font-semibold"
                                        style={{
                                            color:
                                                subtasksPct === 100
                                                    ? "#1E7E3A"
                                                    : "#0096FF",
                                        }}
                                    >
                                        {subtasksPct}%
                                    </span>
                                )}
                            </div>
                            {totalSubtasks > 0 && (
                                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${subtasksPct}%`,
                                            background:
                                                subtasksPct === 100
                                                    ? "#1E7E3A"
                                                    : "#0096FF",
                                        }}
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                {task.subtasks.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group/ci flex items-center gap-2.5 rounded-md px-1 py-0.5 transition-colors hover:bg-gray-50"
                                    >
                                        <Checkbox
                                            checked={item.is_done}
                                            onCheckedChange={() =>
                                                toggleSubtask(item.id)
                                            }
                                            className="size-3.5 rounded border-gray-300 data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                                        />
                                        <Input
                                            value={item.title}
                                            onChange={(e) =>
                                                updateSubtaskText(
                                                    item.id,
                                                    e.target.value,
                                                )
                                            }
                                            className={cn(
                                                "h-auto flex-1 rounded-none border-0 bg-transparent px-0 py-0 text-sm focus-visible:ring-0",
                                                item.is_done
                                                    ? "line-through"
                                                    : "",
                                            )}
                                            style={{
                                                color: item.is_done
                                                    ? "#6b7280"
                                                    : "#374151",
                                            }}
                                        />
                                        <button
                                            onClick={() =>
                                                removeSubtask(item.id)
                                            }
                                            className="shrink-0 text-gray-300 opacity-0 transition-all hover:text-red-400 group-hover/ci:opacity-100"
                                        >
                                            <XIcon weight="duotone" size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex gap-2">
                                <Input
                                    placeholder="Add subtask…"
                                    value={newSubtaskText}
                                    onChange={(e) =>
                                        setNewSubtaskText(e.target.value)
                                    }
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && addSubtask()
                                    }
                                    className="h-8 flex-1 rounded-md text-sm placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
                                />
                                <Button
                                    size="sm"
                                    onClick={addSubtask}
                                    className="h-8 rounded-md border bg-bright-blue px-3 transition-colors hover:bg-blue-600 [&_svg]:size-4"
                                >
                                    <PlusIcon weight="duotone" size={16} />
                                </Button>
                            </div>
                        </div>
                        <Separator />
                        <div className="mb-5">
                            <div className="mb-3 flex items-center gap-1.5">
                                <PaperclipIcon
                                    weight="duotone"
                                    size={16}
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
                                                <FileIcon
                                                    weight="duotone"
                                                    size={16}
                                                    className="text-violet-600"
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-xs font-medium">
                                                    {a.filename}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(
                                                        a.size_bytes / 1024
                                                    ).toFixed(1)}{" "}
                                                    KB
                                                </p>
                                            </div>
                                            <button
                                                onClick={() =>
                                                    removeAttachment(a.id)
                                                }
                                                className="shrink-0 text-gray-300 opacity-0 transition-all hover:text-red-400 group-hover/att:opacity-100"
                                            >
                                                <TrashSimpleIcon
                                                    weight="duotone"
                                                    size={16}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50"
                            >
                                <UploadSimpleIcon weight="duotone" size={14} />
                                Upload file
                            </button>
                        </div>
                        <Separator />
                        <div className="mb-4 flex items-center gap-1.5">
                            <LightningIcon
                                weight="duotone"
                                size={16}
                                className="text-gray-500"
                            />
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Activity
                            </span>
                            {activity.length > 0 && (
                                <span className="text-xs text-gray-500">
                                    {activity.length}
                                </span>
                            )}
                        </div>
                        <div>
                            {activity.map((entry) => (
                                    <div key={entry.id} className="mb-3">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="mt-0.5 size-7 shrink-0">
                                                <AvatarFallback
                                                    className="text-[10px] font-bold text-white"
                                                    style={{
                                                        background:
                                                            entry.author.color,
                                                    }}
                                                >
                                                    {getInitials(
                                                        entry.author.name,
                                                        entry.author.surname,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="text-xs font-semibold">
                                                        {entry.author.name}{" "}
                                                        {entry.author.surname}
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
                                                {entry.type === "change" && (
                                                    <p className="mt-0.5 text-xs text-gray-500">
                                                        changed{" "}
                                                        <span className="font-medium text-gray-700">
                                                            {entry.field}
                                                        </span>{" "}
                                                        <span
                                                            className="mx-0.5 rounded px-1.5 py-0.5 line-through"
                                                            style={{
                                                                background:
                                                                    "#FEF0EF",
                                                                color: "#D93025",
                                                            }}
                                                        >
                                                            {entry.from}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            →
                                                        </span>
                                                        <span
                                                            className="mx-0.5 rounded px-1.5 py-0.5"
                                                            style={{
                                                                background:
                                                                    "#EEFAF2",
                                                                color: "#1E7E3A",
                                                            }}
                                                        >
                                                            {entry.to}
                                                        </span>
                                                    </p>
                                                )}
                                                {entry.type === "comment" && (
                                                    <div className="mt-1.5 rounded-md rounded-tl-sm border px-3 py-2.5 text-sm leading-relaxed text-gray-700">
                                                        {entry.body}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Separator className="mt-3" />
                                    </div>
                                );
                            )}
                            {activity.length === 0 && (
                                <p className="py-2 text-xs text-gray-300">
                                    No activity yet.
                                </p>
                            )}
                        </div>
                        <div className="mt-5 flex items-start gap-3">
                            <Avatar className="mt-1 size-7 shrink-0">
                                <AvatarFallback
                                    className="text-[10px] font-bold text-white"
                                    style={{ background: currentUser.color }}
                                >
                                    {getInitials(
                                        currentUser.name,
                                        currentUser.surname,
                                    )}
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
                                    className="resize-none rounded-md bg-gray-50 text-xs placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-bright-blue"
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
                                                <PaperPlaneTiltIcon
                                                    weight="duotone"
                                                    size={14}
                                                />
                                                Send
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <div className="flex shrink-0 items-center justify-end gap-2 border-t px-6 py-3.5">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-8 rounded-md px-4 text-sm hover:bg-gray-200"
                    >
                        Discard
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!task.title.trim()}
                        className="h-8 gap-1.5 rounded-md bg-bright-blue px-4 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-40 [&_svg]:size-4"
                    >
                        <CheckIcon weight="duotone" size={16} />
                        Save
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
