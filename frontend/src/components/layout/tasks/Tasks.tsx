"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
} from "@/components/ui/shadcn/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/shadcn/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/shadcn/alert-dialog";
import {
    Search,
    Plus,
    SlidersHorizontal,
    X,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
    MoreHorizontal,
    Trash2,
    Pencil,
    PinOff,
    LayoutList,
    Filter,
    CheckCheck,
    MessageSquare,
    Paperclip,
    Pin,
    Calendar,
    Flame,
    PanelsTopLeft,
} from "lucide-react";
import { TaskDetailsSheet } from "@/components/ui/taskDetailsSheet/TaskDetailsSheet";
import { CreateTaskModal } from "@/components/ui/createTaskModal/CreateTaskModal";

export type Priority = "critical" | "high" | "medium" | "low";
export type Status =
    | "todo"
    | "in_progress"
    | "in_review"
    | "done"
    | "cancelled";
export type Project =
    | "design"
    | "marketing"
    | "backend"
    | "mobile"
    | "analytics";

export interface Task {
    id: string;
    title: string;
    description: string;
    status: Status;
    priority: Priority;
    project: Project;
    assignee: string;
    dueDate: string;
    createdAt: string;
    tags: string[];
    subtasks: { id: string; title: string; done: boolean }[];
    comments: number;
    attachments: number;
    pinned: boolean;
}

export interface FilterState {
    search: string;
    status: Status[];
    priority: Priority[];
    project: Project[];
    assignee: string[];
    overdue: boolean;
}

export type SortField =
    | "title"
    | "status"
    | "priority"
    | "project"
    | "dueDate"
    | "assignee";
export type SortDir = "asc" | "desc";

export const PRIORITY_CONFIG: Record<
    Priority,
    {
        label: string;
        dot: string;
        pill: string;
        order: number;
    }
> = {
    critical: {
        label: "Critical",
        dot: "bg-rose-500",
        pill: "bg-rose-50 text-rose-600 border-rose-200",
        order: 0,
    },
    high: {
        label: "High",
        dot: "bg-orange-400",
        pill: "bg-orange-50 text-orange-600 border-orange-200",
        order: 1,
    },
    medium: {
        label: "Medium",
        dot: "bg-blue-400",
        pill: "bg-blue-50 text-blue-600 border-blue-200",
        order: 2,
    },
    low: {
        label: "Low",
        dot: "bg-gray-300",
        pill: "bg-gray-50 text-gray-500 border-gray-200",
        order: 3,
    },
};

export const STATUS_CONFIG: Record<
    Status,
    {
        label: string;
        icon: string;
        pill: string;
        ring: string;
        order: number;
    }
> = {
    todo: {
        label: "To Do",
        icon: "○",
        pill: "bg-gray-100 text-gray-600 border-gray-200",
        ring: "ring-gray-300",
        order: 0,
    },
    in_progress: {
        label: "In Progress",
        icon: "◑",
        pill: "bg-blue-100 text-blue-700 border-blue-200",
        ring: "ring-blue-400",
        order: 1,
    },
    in_review: {
        label: "In Review",
        icon: "◎",
        pill: "bg-amber-100 text-amber-700 border-amber-200",
        ring: "ring-amber-400",
        order: 2,
    },
    done: {
        label: "Done",
        icon: "●",
        pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
        ring: "ring-emerald-400",
        order: 3,
    },
    cancelled: {
        label: "Cancelled",
        icon: "✕",
        pill: "bg-gray-100 text-gray-400 border-gray-200",
        ring: "ring-gray-200",
        order: 4,
    },
};

export const PROJECT_CONFIG: Record<
    Project,
    {
        label: string;
        color: string;
        bg: string;
    }
> = {
    design: { label: "Design System", color: "#6366f1", bg: "bg-blue-500" },
    marketing: { label: "Marketing Q2", color: "#f59e0b", bg: "bg-amber-500" },
    backend: { label: "Backend API", color: "#10b981", bg: "bg-emerald-500" },
    mobile: { label: "Mobile App", color: "#ec4899", bg: "bg-pink-500" },
    analytics: { label: "Analytics Dash", color: "#0ea5e9", bg: "bg-sky-500" },
};

export const TEAM_CONFIG: Record<string, { name: string; bg: string }> = {
    AK: { name: "Alex Kovalenko", bg: "bg-blue-500" },
    JS: { name: "Jamie Solis", bg: "bg-rose-500" },
    MO: { name: "Morgan O.", bg: "bg-amber-500" },
    KL: { name: "Kim Lee", bg: "bg-teal-500" },
    NP: { name: "Nat Park", bg: "bg-violet-500" },
};

const today = new Date();
const dt = (offset: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
};

export const INITIAL_TASKS: Task[] = [
    {
        id: "TSK-001",
        title: "Redesign onboarding flow",
        description:
            "Full UX overhaul of the new-user onboarding experience — interactive tutorials, progress milestones, and personalised setup paths.",
        status: "in_progress",
        priority: "critical",
        project: "design",
        assignee: "AK",
        dueDate: dt(2),
        createdAt: dt(-10),
        tags: ["ux", "research"],
        subtasks: [
            { id: "s1", title: "Wireframes", done: true },
            { id: "s2", title: "Prototype", done: true },
            { id: "s3", title: "User testing", done: false },
            { id: "s4", title: "Handoff", done: false },
        ],
        comments: 7,
        attachments: 3,
        pinned: true,
    },
    {
        id: "TSK-002",
        title: "Fix S3 presigned URL expiry",
        description:
            "Production bug: presigned URLs expire after 15 minutes instead of 24 hours. Affects file attachment uploads in tasks.",
        status: "in_progress",
        priority: "critical",
        project: "backend",
        assignee: "JS",
        dueDate: dt(-1),
        createdAt: dt(-5),
        tags: ["bug", "urgent"],
        subtasks: [
            { id: "s5", title: "Reproduce locally", done: true },
            { id: "s6", title: "Root cause", done: true },
            { id: "s7", title: "Fix & deploy", done: false },
        ],
        comments: 12,
        attachments: 1,
        pinned: true,
    },
    {
        id: "TSK-003",
        title: "Write unit tests for auth module",
        description:
            "Cover all edge cases for token refresh, session expiry, and concurrent logins. Target 90% coverage.",
        status: "todo",
        priority: "high",
        project: "backend",
        assignee: "JS",
        dueDate: dt(5),
        createdAt: dt(-3),
        tags: ["testing"],
        subtasks: [
            { id: "s8", title: "Token refresh", done: false },
            { id: "s9", title: "Session expiry", done: false },
            { id: "s10", title: "Concurrent logins", done: false },
        ],
        comments: 2,
        attachments: 0,
        pinned: false,
    },
    {
        id: "TSK-004",
        title: "Implement dark mode toggle",
        description:
            "Add system preference detection with manual override. Persist preference in localStorage and sync across tabs.",
        status: "in_review",
        priority: "medium",
        project: "design",
        assignee: "AK",
        dueDate: dt(7),
        createdAt: dt(-8),
        tags: ["feature", "a11y"],
        subtasks: [
            { id: "s11", title: "CSS variables", done: true },
            { id: "s12", title: "Toggle UI", done: true },
            { id: "s13", title: "Persistence", done: true },
            { id: "s14", title: "Review", done: false },
        ],
        comments: 5,
        attachments: 2,
        pinned: false,
    },
    {
        id: "TSK-005",
        title: "API rate limiting middleware",
        description:
            "Protect all public endpoints with sliding window rate limiting. 100 req/min per IP, 1000 req/min per API key.",
        status: "in_progress",
        priority: "high",
        project: "backend",
        assignee: "KL",
        dueDate: dt(3),
        createdAt: dt(-6),
        tags: ["security"],
        subtasks: [
            { id: "s15", title: "Middleware setup", done: true },
            { id: "s16", title: "Redis integration", done: false },
            { id: "s17", title: "Tests", done: false },
        ],
        comments: 4,
        attachments: 0,
        pinned: false,
    },
    {
        id: "TSK-006",
        title: "Dashboard analytics widgets",
        description:
            "Build real-time metrics dashboard with KPI cards, trend charts, and customizable date ranges using Recharts.",
        status: "in_review",
        priority: "high",
        project: "analytics",
        assignee: "NP",
        dueDate: dt(1),
        createdAt: dt(-12),
        tags: ["feature"],
        subtasks: [
            { id: "s18", title: "KPI cards", done: true },
            { id: "s19", title: "Charts", done: true },
            { id: "s20", title: "Date picker", done: true },
            { id: "s21", title: "Export", done: false },
        ],
        comments: 9,
        attachments: 4,
        pinned: false,
    },
    {
        id: "TSK-007",
        title: "Landing page copy review",
        description:
            "Final review of Q2 product launch landing page copy. Align messaging with brand voice guidelines and check for legal compliance.",
        status: "todo",
        priority: "medium",
        project: "marketing",
        assignee: "MO",
        dueDate: dt(4),
        createdAt: dt(-2),
        tags: ["content", "review"],
        subtasks: [
            { id: "s22", title: "Headline review", done: false },
            { id: "s23", title: "Legal check", done: false },
        ],
        comments: 3,
        attachments: 2,
        pinned: false,
    },
    {
        id: "TSK-008",
        title: "GraphQL migration plan",
        description:
            "Document the migration strategy from REST to GraphQL. Define schema, resolvers, and deprecation timeline for existing endpoints.",
        status: "in_progress",
        priority: "high",
        project: "backend",
        assignee: "JS",
        dueDate: dt(10),
        createdAt: dt(-4),
        tags: ["architecture"],
        subtasks: [
            { id: "s24", title: "Schema design", done: true },
            { id: "s25", title: "Resolver plan", done: false },
            { id: "s26", title: "Migration timeline", done: false },
        ],
        comments: 6,
        attachments: 3,
        pinned: false,
    },
    {
        id: "TSK-009",
        title: "Mobile navigation redesign",
        description:
            "Redesign the bottom navigation for iOS and Android. Focus on thumb-friendly zones and improved gesture support.",
        status: "todo",
        priority: "medium",
        project: "mobile",
        assignee: "MO",
        dueDate: dt(14),
        createdAt: dt(-1),
        tags: ["ux", "mobile"],
        subtasks: [
            { id: "s27", title: "Research", done: false },
            { id: "s28", title: "Wireframes", done: false },
        ],
        comments: 1,
        attachments: 0,
        pinned: false,
    },
    {
        id: "TSK-010",
        title: "Color token audit",
        description:
            "Audit all 286 color tokens across the design system. Identify duplicates, missing dark mode variants, and accessibility failures.",
        status: "done",
        priority: "medium",
        project: "design",
        assignee: "AK",
        dueDate: dt(-3),
        createdAt: dt(-20),
        tags: ["tokens", "a11y"],
        subtasks: [
            { id: "s29", title: "Inventory", done: true },
            { id: "s30", title: "Audit", done: true },
            { id: "s31", title: "Recommendations", done: true },
        ],
        comments: 11,
        attachments: 6,
        pinned: false,
    },
    {
        id: "TSK-011",
        title: "Set up CI/CD pipeline",
        description:
            "GitHub Actions workflow with automated testing, staging deployments, and Slack notifications on build failures.",
        status: "done",
        priority: "low",
        project: "backend",
        assignee: "KL",
        dueDate: dt(-7),
        createdAt: dt(-25),
        tags: ["devops"],
        subtasks: [
            { id: "s32", title: "GitHub Actions", done: true },
            { id: "s33", title: "Staging deploy", done: true },
            { id: "s34", title: "Notifications", done: true },
        ],
        comments: 4,
        attachments: 1,
        pinned: false,
    },
    {
        id: "TSK-012",
        title: "Email sequence A/B test",
        description:
            "Run an A/B test on the welcome email sequence. Variant B uses personalised subject lines. Measure open rates over 14 days.",
        status: "done",
        priority: "low",
        project: "marketing",
        assignee: "NP",
        dueDate: dt(-5),
        createdAt: dt(-18),
        tags: ["email", "experiment"],
        subtasks: [
            { id: "s35", title: "Setup experiment", done: true },
            { id: "s36", title: "Results analysis", done: true },
        ],
        comments: 5,
        attachments: 2,
        pinned: false,
    },
    {
        id: "TSK-013",
        title: "Performance profiling — Q1 report",
        description:
            "Profile app performance across key user flows. Generate a Q1 report with Core Web Vitals, LCP, FID, and CLS metrics.",
        status: "todo",
        priority: "high",
        project: "analytics",
        assignee: "NP",
        dueDate: dt(6),
        createdAt: dt(-1),
        tags: ["performance"],
        subtasks: [
            { id: "s37", title: "Baseline metrics", done: false },
            { id: "s38", title: "Profiling", done: false },
            { id: "s39", title: "Report", done: false },
        ],
        comments: 0,
        attachments: 0,
        pinned: false,
    },
    {
        id: "TSK-014",
        title: "iOS gesture support audit",
        description:
            "Review all swipe and long-press interactions on iOS. Identify inconsistencies with platform HIG guidelines.",
        status: "cancelled",
        priority: "low",
        project: "mobile",
        assignee: "MO",
        dueDate: dt(-2),
        createdAt: dt(-15),
        tags: ["mobile", "audit"],
        subtasks: [{ id: "s40", title: "HIG review", done: false }],
        comments: 2,
        attachments: 0,
        pinned: false,
    },
    {
        id: "TSK-015",
        title: "Sprint planning — Sprint #15",
        description:
            "Facilitate Sprint #15 planning session. Groom backlog, estimate story points, and commit to sprint scope.",
        status: "todo",
        priority: "medium",
        project: "design",
        assignee: "KL",
        dueDate: dt(8),
        createdAt: dt(-1),
        tags: ["planning"],
        subtasks: [
            { id: "s41", title: "Backlog grooming", done: false },
            { id: "s42", title: "Estimation", done: false },
            { id: "s43", title: "Commitment", done: false },
        ],
        comments: 0,
        attachments: 0,
        pinned: false,
    },
];

function isOverdue(dueDate: string, status: Status): boolean {
    if (status === "done" || status === "cancelled") return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

function SortIcon({
    field,
    sortField,
    sortDir,
}: {
    field: SortField;
    sortField: SortField;
    sortDir: SortDir;
}) {
    if (field !== sortField)
        return <ChevronsUpDown className="size-3 text-gray-300" />;
    return sortDir === "asc" ? (
        <ChevronUp className="size-3 text-blue-500" />
    ) : (
        <ChevronDown className="size-3 text-blue-500" />
    );
}

const DEFAULT_FILTER: FilterState = {
    search: "",
    status: [],
    priority: [],
    project: [],
    assignee: [],
    overdue: false,
};

interface RowProps {
    task: Task;
    selected: boolean;
    checked: boolean;
    onCheck: (id: string, v: boolean) => void;
    onClick: (task: Task) => void;
    onUpdate: (id: string, patch: Partial<Task>) => void;
    onDelete: (id: string) => void;
}

function TaskRow({
    task,
    selected,
    checked,
    onCheck,
    onClick,
    onUpdate,
    onDelete,
}: RowProps) {
    const pri = PRIORITY_CONFIG[task.priority];
    const st = STATUS_CONFIG[task.status];
    const proj = PROJECT_CONFIG[task.project];
    const member = TEAM_CONFIG[task.assignee];
    const overdue = isOverdue(task.dueDate, task.status);
    const doneSubs = task.subtasks.filter((s) => s.done).length;
    const totalSubs = task.subtasks.length;

    return (
        <tr
            onClick={() => onClick(task)}
            className={`
                group cursor-pointer border-b transition-colors duration-100
                ${selected ? "bg-blue-50/70" : "hover:bg-gray-50/70"}
                ${task.status === "done" ? "opacity-60" : ""}
            `}
        >
            <td
                className="w-10 py-3 pl-8 pr-2"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-1">
                    <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => onCheck(task.id, !!v)}
                        className="data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                    />
                </div>
            </td>
            <td className="w-24 py-3 pr-4">
                <span className="font-mono text-xs font-medium text-gray-400">
                    {task.id}
                </span>
            </td>
            <td className="min-w-[240px] py-3 pr-4">
                <div className="flex items-center gap-2">
                    {task.pinned && (
                        <Pin className="size-3 flex-shrink-0 fill-amber-400 text-amber-400" />
                    )}
                    <span
                        className={`text-sm font-semibold leading-snug text-gray-800 ${task.status === "done" ? "text-gray-400 line-through" : ""}`}
                    >
                        {task.title}
                    </span>
                </div>
                {task.tags.length > 0 && (
                    <div className="mt-1 flex gap-1">
                        {task.tags.slice(0, 2).map((t) => (
                            <span
                                key={t}
                                className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500"
                            >
                                {t}
                            </span>
                        ))}
                        {task.tags.length > 2 && (
                            <span className="text-[10px] text-gray-400">
                                +{task.tags.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </td>
            <td className="w-36 py-3 pr-4">
                <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${st.pill}`}
                >
                    {st.label}
                </span>
            </td>
            <td className="w-28 py-3 pr-4">
                <span
                    className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${pri.pill}`}
                >
                    <span className={`size-1.5 rounded-full ${pri.dot}`} />
                    {pri.label}
                </span>
            </td>
            <td className="w-40 py-3 pr-4">
                <span
                    className="rounded-md px-2 py-1 text-xs font-semibold"
                    style={{ background: `${proj.color}15`, color: proj.color }}
                >
                    {proj.label}
                </span>
            </td>
            <td className="w-28 py-3 pr-4">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex items-center gap-2">
                            <Avatar className="size-6">
                                <AvatarFallback
                                    className={`text-[9px] font-bold text-white ${member.bg}`}
                                >
                                    {task.assignee}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-gray-600">
                                {task.assignee}
                            </span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>{member.name}</TooltipContent>
                </Tooltip>
            </td>
            <td className="w-28 py-3 pr-4">
                <div
                    className={`flex items-center gap-1 text-xs font-semibold ${overdue ? "text-rose-500" : "text-gray-500"}`}
                >
                    {overdue ? (
                        <Flame className="size-3" />
                    ) : (
                        <Calendar className="size-3" />
                    )}
                    {formatDate(task.dueDate)}
                </div>
            </td>
            <td className="w-24 py-3 pr-4">
                {totalSubs > 0 && (
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-12 overflow-hidden rounded-full bg-gray-200">
                            <div
                                className="h-full rounded-full bg-blue-400"
                                style={{
                                    width: `${(doneSubs / totalSubs) * 100}%`,
                                }}
                            />
                        </div>
                        <span className="text-[10px] text-gray-400">
                            {doneSubs}/{totalSubs}
                        </span>
                    </div>
                )}
            </td>
            <td className="w-24 py-3 pr-4">
                <div className="flex items-center gap-2.5 text-gray-400">
                    {task.comments > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px]">
                            <MessageSquare className="size-3" /> {task.comments}
                        </span>
                    )}
                    {task.attachments > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px]">
                            <Paperclip className="size-3" /> {task.attachments}
                        </span>
                    )}
                </div>
            </td>
            <td className="w-10 py-3 pr-3" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <MoreHorizontal className="size-3.5 text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem className="cursor-pointer gap-2 text-xs">
                            <Pencil className="size-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer gap-2 text-xs"
                            onClick={() =>
                                onUpdate(task.id, { pinned: !task.pinned })
                            }
                        >
                            {task.pinned ? (
                                <PinOff className="size-3.5" />
                            ) : (
                                <Pin className="size-3.5" />
                            )}
                            {task.pinned ? "Unpin" : "Pin task"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                    className="cursor-pointer gap-2 text-xs text-rose-500 focus:text-rose-500"
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    <Trash2 className="size-3.5" /> Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Delete task?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        &quot;{task.title}&quot; will be
                                        permanently deleted. This cannot be
                                        undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => onDelete(task.id)}
                                        className="bg-rose-600 hover:bg-rose-700"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </td>
        </tr>
    );
}

function FilterChip({
    label,
    onRemove,
}: {
    label: string;
    onRemove: () => void;
}) {
    return (
        <span className="inline-flex items-center gap-1 rounded-md border border-bright-blue px-2 py-1 text-xs font-semibold text-bright-blue hover:border-blue-600">
            {label}
            <button onClick={onRemove} className="ml-0.5">
                <X className="size-3" />
            </button>
        </span>
    );
}

function TH({
    label,
    field,
    className = "",
    sortField,
    sortDir,
    onSort,
}: {
    label: string;
    field: SortField;
    className?: string;
    sortField: SortField;
    sortDir: SortDir;
    onSort: (field: SortField) => void;
}) {
    return (
        <th
            className={`cursor-pointer select-none whitespace-nowrap py-2.5 pr-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400 ${className}`}
            onClick={() => onSort(field)}
        >
            <span className="flex items-center gap-1 transition-colors hover:text-gray-600">
                {label}
                <SortIcon
                    field={field}
                    sortField={sortField}
                    sortDir={sortDir}
                />
            </span>
        </th>
    );
}

export default function Tasks() {
    const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
    const [filter, setFilter] = useState<FilterState>(DEFAULT_FILTER);
    const [sortField, setSortField] = useState<SortField>("priority");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [checked, setChecked] = useState<Set<string>>(new Set());
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);

    const filtered = useMemo(() => {
        let list = [...tasks];

        if (filter.search) {
            const q = filter.search.toLowerCase();
            list = list.filter(
                (t) =>
                    t.title.toLowerCase().includes(q) ||
                    t.id.toLowerCase().includes(q) ||
                    t.tags.some((tag) => tag.toLowerCase().includes(q)),
            );
        }
        if (filter.status.length)
            list = list.filter((t) => filter.status.includes(t.status));
        if (filter.priority.length)
            list = list.filter((t) => filter.priority.includes(t.priority));
        if (filter.project.length)
            list = list.filter((t) => filter.project.includes(t.project));
        if (filter.assignee.length)
            list = list.filter((t) => filter.assignee.includes(t.assignee));
        if (filter.overdue)
            list = list.filter((t) => isOverdue(t.dueDate, t.status));

        list.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            let av: number | string, bv: number | string;
            switch (sortField) {
                case "priority":
                    av = PRIORITY_CONFIG[a.priority].order;
                    bv = PRIORITY_CONFIG[b.priority].order;
                    break;
                case "status":
                    av = STATUS_CONFIG[a.status].order;
                    bv = STATUS_CONFIG[b.status].order;
                    break;
                case "dueDate":
                    av = a.dueDate;
                    bv = b.dueDate;
                    break;
                case "project":
                    av = a.project;
                    bv = b.project;
                    break;
                case "assignee":
                    av = a.assignee;
                    bv = b.assignee;
                    break;
                default:
                    av = a.title;
                    bv = b.title;
            }
            if (av < bv) return sortDir === "asc" ? -1 : 1;
            if (av > bv) return sortDir === "asc" ? 1 : -1;
            return 0;
        });

        return list;
    }, [tasks, filter, sortField, sortDir]);

    const updateTask = useCallback((id: string, patch: Partial<Task>) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        );
        setSelectedTask((prev) =>
            prev?.id === id ? ({ ...prev, ...patch } as Task) : prev,
        );
    }, []);

    const deleteTask = useCallback(
        (id: string) => {
            setTasks((prev) => prev.filter((t) => t.id !== id));
            if (selectedTask?.id === id) setSelectedTask(null);
            setChecked((prev) => {
                const s = new Set(prev);
                s.delete(id);
                return s;
            });
        },
        [selectedTask],
    );

    const allChecked =
        filtered.length > 0 && filtered.every((t) => checked.has(t.id));
    const someChecked = !allChecked && filtered.some((t) => checked.has(t.id));

    const toggleAll = () => {
        if (allChecked) setChecked(new Set());
        else setChecked(new Set(filtered.map((t) => t.id)));
    };

    const toggleCheck = (id: string, v: boolean) => {
        setChecked((prev) => {
            const s = new Set(prev);

            if (v) {
                s.add(id);
            } else {
                s.delete(id);
            }

            return s;
        });
    };

    const bulkDelete = () => {
        setTasks((prev) => prev.filter((t) => !checked.has(t.id)));
        if (selectedTask && checked.has(selectedTask.id)) setSelectedTask(null);
        setChecked(new Set());
    };

    const bulkMarkDone = () => {
        setTasks((prev) =>
            prev.map((t) =>
                checked.has(t.id) ? { ...t, status: "done" as Status } : t,
            ),
        );
        setChecked(new Set());
    };

    const bulkMarkUndone = () => {
        setTasks((prev) =>
            prev.map((t) =>
                checked.has(t.id) ? { ...t, status: "todo" as Status } : t,
            ),
        );
        setChecked(new Set());
    };

    const toggleSort = (field: SortField) => {
        if (sortField === field)
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const handleShowNewTaskModal = () => {
        setShowNewTaskModal(!showNewTaskModal);
    };

    const setF = <K extends keyof FilterState>(key: K, val: FilterState[K]) =>
        setFilter((f) => ({ ...f, [key]: val }));

    const toggleArrFilter = <T extends string>(
        key: "status" | "priority" | "project" | "assignee",
        val: T,
    ) => {
        const arr = filter[key] as T[];
        setF(
            key,
            arr.includes(val)
                ? arr.filter((x) => x !== val)
                : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ([...arr, val] as any),
        );
    };

    const activeFilterCount =
        filter.status.length +
        filter.priority.length +
        filter.project.length +
        filter.assignee.length +
        (filter.overdue ? 1 : 0);

    const clearFilters = () => setFilter(DEFAULT_FILTER);

    const stats = useMemo(
        () => ({
            total: tasks.length,
            todo: tasks.filter((t) => t.status === "todo").length,
            inProgress: tasks.filter((t) => t.status === "in_progress").length,
            done: tasks.filter((t) => t.status === "done").length,
            overdue: tasks.filter((t) => isOverdue(t.dueDate, t.status)).length,
        }),
        [tasks],
    );

    return (
        <>
            <div
                className={`flex min-h-0 flex-1 transition-all ${selectedTask ? "gap-0" : ""}`}
            >
                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="flex flex-wrap items-center gap-3 border-b bg-white px-8 py-4">
                        <h1 className="mr-12 text-xl font-semibold">Tasks</h1>
                        <div className="relative flex items-center">
                            <Search className="absolute left-2.5 size-3.5 text-gray-400" />
                            <Input
                                value={filter.search}
                                onChange={(e) => setF("search", e.target.value)}
                                placeholder="Search tasks…"
                                className="pl-8 pr-6 text-xs placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                            />
                            {filter.search && (
                                <button
                                    onClick={() => setF("search", "")}
                                    className="absolute right-2"
                                >
                                    <X className="size-3 text-gray-400" />
                                </button>
                            )}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-9 gap-1.5 text-xs ${filter.status.length ? "border-bright-blue bg-blue-50 text-blue-600" : "text-gray-500"}`}
                                >
                                    <Filter className="size-3" />
                                    Status{" "}
                                    {filter.status.length > 0 &&
                                        `(${filter.status.length})`}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-44">
                                <DropdownMenuLabel className="text-xs">
                                    Filter by status
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {(Object.keys(STATUS_CONFIG) as Status[]).map(
                                    (s) => (
                                        <DropdownMenuCheckboxItem
                                            key={s}
                                            checked={filter.status.includes(s)}
                                            onCheckedChange={() =>
                                                toggleArrFilter("status", s)
                                            }
                                            className="text-xs"
                                        >
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs font-semibold ${STATUS_CONFIG[s].pill}`}
                                            >
                                                {STATUS_CONFIG[s].label}
                                            </span>
                                        </DropdownMenuCheckboxItem>
                                    ),
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-9 gap-1.5 text-xs ${filter.priority.length ? "border-bright-blue bg-blue-50 text-blue-600" : "text-gray-500"}`}
                                >
                                    <SlidersHorizontal className="size-3" />
                                    Priority{" "}
                                    {filter.priority.length > 0 &&
                                        `(${filter.priority.length})`}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40">
                                <DropdownMenuLabel className="text-xs">
                                    Filter by priority
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {(
                                    Object.keys(PRIORITY_CONFIG) as Priority[]
                                ).map((p) => (
                                    <DropdownMenuCheckboxItem
                                        key={p}
                                        checked={filter.priority.includes(p)}
                                        onCheckedChange={() =>
                                            toggleArrFilter("priority", p)
                                        }
                                        className="gap-2 text-xs"
                                    >
                                        <span className="flex items-center gap-2">
                                            <span
                                                className={`size-2 rounded-full ${PRIORITY_CONFIG[p].dot}`}
                                            />
                                            {PRIORITY_CONFIG[p].label}
                                        </span>
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-9 gap-1.5 text-xs ${filter.project.length ? "border-bright-blue bg-blue-50 text-blue-600" : "text-gray-500"}`}
                                >
                                    <PanelsTopLeft className="size-3" />
                                    Project{" "}
                                    {filter.project.length > 0 &&
                                        `(${filter.project.length})`}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48">
                                <DropdownMenuLabel className="text-xs">
                                    Filter by project
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {(Object.keys(PROJECT_CONFIG) as Project[]).map(
                                    (p) => (
                                        <DropdownMenuCheckboxItem
                                            key={p}
                                            checked={filter.project.includes(p)}
                                            onCheckedChange={() =>
                                                toggleArrFilter("project", p)
                                            }
                                            className="gap-2 text-xs"
                                        >
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="size-2 rounded-full"
                                                    style={{
                                                        background:
                                                            PROJECT_CONFIG[p]
                                                                .color,
                                                    }}
                                                />
                                                {PROJECT_CONFIG[p].label}
                                            </span>
                                        </DropdownMenuCheckboxItem>
                                    ),
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setF("overdue", !filter.overdue)}
                            className={`h-9 gap-1.5 text-xs ${filter.overdue ? "border-rose-300 bg-rose-50 text-rose-600" : "text-gray-500"}`}
                        >
                            <Flame className="size-3" /> Overdue
                        </Button>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 text-xs font-medium text-bright-blue hover:text-blue-600"
                            >
                                <X className="size-3" /> Clear{" "}
                                {activeFilterCount} filter
                                {activeFilterCount > 1 ? "s" : ""}
                            </button>
                        )}
                        <div className="ml-auto flex items-center justify-end gap-3">
                            <div className="hidden items-center gap-1 md:flex">
                                {[
                                    {
                                        label: "Total",
                                        val: stats.total,
                                        col: "text-gray-600",
                                    },
                                    {
                                        label: "In Progress",
                                        val: stats.inProgress,
                                        col: "text-blue-600",
                                    },
                                    {
                                        label: "Done",
                                        val: stats.done,
                                        col: "text-emerald-600",
                                    },
                                    {
                                        label: "Overdue",
                                        val: stats.overdue,
                                        col: "text-rose-600",
                                    },
                                ].map((s, i) => (
                                    <div
                                        key={s.label}
                                        className="flex items-center gap-2"
                                    >
                                        {i > 0 && (
                                            <div className="h-3 w-px bg-gray-200" />
                                        )}
                                        <span className="text-xs text-gray-400">
                                            {s.label}
                                        </span>
                                        <span
                                            className={`text-xs font-bold ${s.col}`}
                                        >
                                            {s.val}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <Button
                                className="gap-1.5 bg-bright-blue px-3 text-xs hover:bg-blue-600"
                                onClick={handleShowNewTaskModal}
                            >
                                <Plus className="size-3.5" /> New Task
                            </Button>
                        </div>
                    </header>
                    {activeFilterCount > 0 && (
                        <div className="flex flex-wrap gap-1.5 border-b bg-white px-8 py-2">
                            {filter.status.map((s) => (
                                <FilterChip
                                    key={s}
                                    label={STATUS_CONFIG[s].label}
                                    onRemove={() =>
                                        toggleArrFilter("status", s)
                                    }
                                />
                            ))}
                            {filter.priority.map((p) => (
                                <FilterChip
                                    key={p}
                                    label={PRIORITY_CONFIG[p].label}
                                    onRemove={() =>
                                        toggleArrFilter("priority", p)
                                    }
                                />
                            ))}
                            {filter.project.map((p) => (
                                <FilterChip
                                    key={p}
                                    label={PROJECT_CONFIG[p].label}
                                    onRemove={() =>
                                        toggleArrFilter("project", p)
                                    }
                                />
                            ))}
                            {filter.overdue && (
                                <FilterChip
                                    label="Overdue"
                                    onRemove={() => setF("overdue", false)}
                                />
                            )}
                        </div>
                    )}
                    {checked.size > 0 && (
                        <div className="flex items-center gap-4 bg-bright-blue px-8 py-2 text-white">
                            <span className="text-sm font-semibold">
                                {checked.size} selected
                            </span>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={bulkMarkDone}
                                className="h-9 gap-1.5 text-xs text-white hover:bg-white/20 hover:text-white"
                            >
                                <CheckCheck className="size-3.5" /> Mark done
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={bulkMarkUndone}
                                className="h-9 gap-1.5 text-xs text-white hover:bg-white/20 hover:text-white"
                            >
                                <X className="size-3.5" /> Mark undone
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-9 gap-1.5 text-xs text-white hover:bg-white/20 hover:text-white"
                                    >
                                        <Trash2 className="size-3.5" /> Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Delete {checked.size} tasks?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will permanently delete{" "}
                                            {checked.size} selected tasks.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={bulkDelete}
                                            className="bg-rose-600 hover:bg-rose-700"
                                        >
                                            Delete all
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <button
                                onClick={() => setChecked(new Set())}
                                className="ml-auto transition-opacity hover:opacity-70"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    )}
                    <div className="flex-1 overflow-auto bg-white">
                        <table className="w-full min-w-[960px]">
                            <thead className="sticky top-0 z-10 border-b bg-gray-50">
                                <tr>
                                    <th className="w-10 py-2.5 pl-8 pr-2">
                                        <Checkbox
                                            checked={allChecked}
                                            ref={(el) => {
                                                if (el)
                                                    el.dataset.indeterminate =
                                                        someChecked
                                                            ? "true"
                                                            : "false";
                                            }}
                                            onCheckedChange={toggleAll}
                                            className="data-[state=checked]:border-bright-blue data-[state=checked]:bg-bright-blue"
                                        />
                                    </th>
                                    <th className="w-24 py-2.5 pr-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                                        ID
                                    </th>
                                    <TH
                                        label="Title"
                                        field="title"
                                        className="min-w-[240px]"
                                        sortField={sortField}
                                        sortDir={sortDir}
                                        onSort={toggleSort}
                                    />
                                    <TH
                                        label="Status"
                                        field="status"
                                        className="w-36"
                                        sortField={sortField}
                                        sortDir={sortDir}
                                        onSort={toggleSort}
                                    />
                                    <TH
                                        label="Priority"
                                        field="priority"
                                        className="w-28"
                                        sortField={sortField}
                                        sortDir={sortDir}
                                        onSort={toggleSort}
                                    />
                                    <TH
                                        label="Project"
                                        field="project"
                                        className="w-40"
                                        sortField={sortField}
                                        sortDir={sortDir}
                                        onSort={toggleSort}
                                    />
                                    <TH
                                        label="Assignee"
                                        field="assignee"
                                        className="w-28"
                                        sortField={sortField}
                                        sortDir={sortDir}
                                        onSort={toggleSort}
                                    />
                                    <TH
                                        label="Due"
                                        field="dueDate"
                                        className="w-28"
                                        sortField={sortField}
                                        sortDir={sortDir}
                                        onSort={toggleSort}
                                    />
                                    <th className="w-24 py-2.5 pr-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Progress
                                    </th>
                                    <th className="w-24 py-2.5 pr-4 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                                        Activity
                                    </th>
                                    <th className="w-10 py-2.5 pr-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={11}
                                            className="py-20 text-center text-gray-400"
                                        >
                                            <LayoutList className="mx-auto mb-3 size-10 opacity-30" />
                                            <p className="text-sm font-semibold">
                                                No tasks found
                                            </p>
                                            <p className="mt-1 text-xs">
                                                Try adjusting your filters
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((task) => (
                                        <TaskRow
                                            key={task.id}
                                            task={task}
                                            selected={
                                                selectedTask?.id === task.id
                                            }
                                            checked={checked.has(task.id)}
                                            onCheck={toggleCheck}
                                            onClick={(t) => setSelectedTask(t)}
                                            onUpdate={updateTask}
                                            onDelete={deleteTask}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <TaskDetailsSheet
                open={!!selectedTask}
                onOpenChange={() => setSelectedTask(null)}
                onSave={(updated) => console.log(updated)}
            />
            <CreateTaskModal
                open={showNewTaskModal}
                onOpenChange={handleShowNewTaskModal}
            />
        </>
    );
}
