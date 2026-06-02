"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
import { ScrollArea } from "@/components/ui/shadcn/scroll-area";
import { Separator } from "@/components/ui/shadcn/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/shadcn/tabs";
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
    Bell,
    CheckCheck,
    Trash2,
    Search,
    AtSign,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    Clock,
    UserPlus,
    Zap,
    TrendingUp,
    Archive,
    Settings,
    Star,
    Circle,
    ArrowUpRight,
    RefreshCw,
    X,
    SlidersHorizontal,
    Inbox,
    LucideProps,
} from "lucide-react";

type NotificationType =
    | "mention"
    | "comment"
    | "assignment"
    | "due"
    | "status"
    | "at_risk"
    | "completed"
    | "sprint";

type TeamMember = "AK" | "JS" | "MO" | "KL" | "NP";

type TabValue = "all" | "unread" | "pinned" | "archived";

interface Notification {
    id: number;
    type: NotificationType;
    read: boolean;
    pinned: boolean;
    archived: boolean;
    actor: TeamMember | null;
    time: number;
    project: string;
    projectColor: string;
    title: string;
    body: string;
    task: string | null;
    action: string | null;
}

interface NotificationGroup {
    label: string;
    items: Notification[];
}

interface TypeConfig {
    label: string;
    icon: React.FC<LucideProps>;
    color: string;
    bg: string;
    text: string;
}

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
    mention: {
        label: "Mention",
        icon: AtSign,
        color: "#6366f1",
        bg: "bg-blue-100",
        text: "text-bright-blue",
    },
    comment: {
        label: "Comment",
        icon: MessageSquare,
        color: "#0ea5e9",
        bg: "bg-sky-100",
        text: "text-sky-600",
    },
    assignment: {
        label: "Assigned",
        icon: UserPlus,
        color: "#10b981",
        bg: "bg-emerald-100",
        text: "text-emerald-600",
    },
    due: {
        label: "Due Soon",
        icon: Clock,
        color: "#f59e0b",
        bg: "bg-amber-100",
        text: "text-amber-600",
    },
    status: {
        label: "Status",
        icon: TrendingUp,
        color: "#8b5cf6",
        bg: "bg-violet-100",
        text: "text-violet-600",
    },
    at_risk: {
        label: "At Risk",
        icon: AlertTriangle,
        color: "#f43f5e",
        bg: "bg-rose-100",
        text: "text-rose-600",
    },
    completed: {
        label: "Completed",
        icon: CheckCircle2,
        color: "#10b981",
        bg: "bg-emerald-100",
        text: "text-emerald-600",
    },
    sprint: {
        label: "Sprint",
        icon: Zap,
        color: "#f59e0b",
        bg: "bg-amber-100",
        text: "text-amber-600",
    },
};

const TEAM_COLORS: Record<TeamMember, string> = {
    AK: "bg-bright-blue",
    JS: "bg-rose-500",
    MO: "bg-amber-500",
    KL: "bg-teal-500",
    NP: "bg-violet-500",
};

const TEAM_NAMES: Record<TeamMember, string> = {
    AK: "Alex Kovalenko",
    JS: "Jamie Solis",
    MO: "Morgan O.",
    KL: "Kim Lee",
    NP: "Nat Park",
};

const NOW = Date.now();
const m = (mins: number): number => NOW - mins * 60_000;
const h = (hrs: number): number => NOW - hrs * 3_600_000;
const d = (days: number): number => NOW - days * 86_400_000;

const initialNotifications: Notification[] = [
    {
        id: 1,
        type: "mention",
        read: false,
        pinned: true,
        archived: false,
        actor: "JS",
        time: m(5),
        project: "Design System",
        projectColor: "#6366f1",
        title: "Jamie mentioned you in a comment",
        body: "@AK can you take another look at the token naming convention? I think we need to align on the grey scale before merging.",
        task: "Color token audit",
        action: "View comment",
    },
    {
        id: 2,
        type: "at_risk",
        read: false,
        pinned: false,
        archived: false,
        actor: null,
        time: m(18),
        project: "Backend API",
        projectColor: "#10b981",
        title: "Project moved to At Risk",
        body: "Backend API v2 is now marked At Risk — the sprint is 34% behind schedule with 8 days remaining.",
        task: null,
        action: "View project",
    },
    {
        id: 3,
        type: "assignment",
        read: false,
        pinned: false,
        archived: false,
        actor: "MO",
        time: h(1),
        project: "Analytics Dash",
        projectColor: "#0ea5e9",
        title: "Morgan assigned you a task",
        body: 'You\'ve been assigned to "Performance profiling — Q1 report". Priority: High · Due Mar 5.',
        task: "Performance profiling — Q1 report",
        action: "Open task",
    },
    {
        id: 4,
        type: "due",
        read: false,
        pinned: false,
        archived: false,
        actor: null,
        time: h(2),
        project: "Analytics Dash",
        projectColor: "#0ea5e9",
        title: "Task due in 24 hours",
        body: '"Dashboard analytics widgets" is due tomorrow at 5 PM. You have 3 subtasks remaining.',
        task: "Dashboard analytics widgets",
        action: "Open task",
    },
    {
        id: 5,
        type: "comment",
        read: true,
        pinned: false,
        archived: false,
        actor: "KL",
        time: h(3),
        project: "Design System",
        projectColor: "#6366f1",
        title: "Kim commented on your task",
        body: "Looks great! I left a few suggestions on the spacing — specifically the 4px vs 8px gap between action buttons in the toolbar.",
        task: "Toolbar component redesign",
        action: "View comment",
    },
    {
        id: 6,
        type: "sprint",
        read: true,
        pinned: false,
        archived: false,
        actor: null,
        time: h(5),
        project: "Design System",
        projectColor: "#6366f1",
        title: "Sprint #14 starts tomorrow",
        body: "Sprint #14 kicks off at 9 AM. You have 8 tasks lined up. Join the kickoff meeting or review the board.",
        task: null,
        action: "View sprint",
    },
    {
        id: 7,
        type: "mention",
        read: true,
        pinned: false,
        archived: false,
        actor: "NP",
        time: h(8),
        project: "Marketing Q2",
        projectColor: "#f59e0b",
        title: "Nat mentioned you in Marketing Q2",
        body: "@AK we need sign-off on the landing page copy before we hand it off to dev. Can you review by EOD?",
        task: "Landing page copy review",
        action: "View comment",
    },
    {
        id: 8,
        type: "completed",
        read: true,
        pinned: false,
        archived: false,
        actor: "JS",
        time: h(12),
        project: "Backend API",
        projectColor: "#10b981",
        title: "Jamie completed a task you own",
        body: '"Deploy hotfix v2.3.1" has been marked as done by Jamie.',
        task: "Deploy hotfix v2.3.1",
        action: "View task",
    },
    {
        id: 9,
        type: "status",
        read: true,
        pinned: false,
        archived: false,
        actor: "MO",
        time: d(1),
        project: "Mobile App",
        projectColor: "#ec4899",
        title: "Mobile App moved to On Hold",
        body: "Morgan updated the project status to On Hold. Reason: awaiting design approval from stakeholders.",
        task: null,
        action: "View project",
    },
    {
        id: 10,
        type: "assignment",
        read: true,
        pinned: false,
        archived: false,
        actor: "KL",
        time: d(1),
        project: "Design System",
        projectColor: "#6366f1",
        title: "Kim assigned you to a project",
        body: "You've been added as a contributor to Design System 3.0. 84 tasks are currently tracked.",
        task: null,
        action: "View project",
    },
    {
        id: 11,
        type: "due",
        read: true,
        pinned: false,
        archived: false,
        actor: null,
        time: d(2),
        project: "Backend API",
        projectColor: "#10b981",
        title: "Task overdue",
        body: '"API rate limiting middleware" was due 2 days ago and is still in progress.',
        task: "API rate limiting middleware",
        action: "Open task",
    },
    {
        id: 12,
        type: "comment",
        read: true,
        pinned: false,
        archived: false,
        actor: "NP",
        time: d(2),
        project: "Marketing Q2",
        projectColor: "#f59e0b",
        title: "Nat commented on Marketing Q2 board",
        body: "Added a note to the Email sequence task — the A/B test results are ready for review. Results are promising with 23% higher CTR.",
        task: "Email sequence A/B test",
        action: "View comment",
    },
    {
        id: 13,
        type: "sprint",
        read: true,
        pinned: false,
        archived: false,
        actor: null,
        time: d(3),
        project: "Design System",
        projectColor: "#6366f1",
        title: "Sprint #13 ended",
        body: "Sprint #13 closed with 87% completion rate. 28/32 tasks done. 4 tasks carried over to Sprint #14.",
        task: null,
        action: "View report",
    },
    {
        id: 14,
        type: "mention",
        read: true,
        pinned: false,
        archived: false,
        actor: "JS",
        time: d(4),
        project: "Backend API",
        projectColor: "#10b981",
        title: "Jamie mentioned you in Backend API",
        body: "@AK the GraphQL migration plan doc needs your input on the authentication section before we share it with the team.",
        task: "GraphQL migration plan",
        action: "View comment",
    },
];

function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
}

function groupByDate(items: Notification[]): NotificationGroup[] {
    const groups: string[] = [];
    const buckets: Record<string, Notification[]> = {};

    items.forEach((n) => {
        const diff = Date.now() - n.time;
        const label: string =
            diff < 3_600_000 * 2
                ? "Last hour"
                : diff < 86_400_000
                  ? "Today"
                  : diff < 86_400_000 * 2
                    ? "Yesterday"
                    : "Earlier";
        if (!buckets[label]) {
            buckets[label] = [];
            groups.push(label);
        }
        buckets[label].push(n);
    });

    return groups.map((g) => ({ label: g, items: buckets[g] }));
}

interface NotifRowProps {
    notif: Notification;
    selected: boolean;
    onSelect: (id: number) => void;
    onRead: (id: number) => void;
    onArchive: (id: number) => void;
    onDelete: (id: number) => void;
    onPin: (id: number) => void;
}

function NotifRow({
    notif,
    selected,
    onSelect,
    onRead,
    onArchive,
    onDelete,
    onPin,
}: NotifRowProps) {
    const cfg: TypeConfig = TYPE_CONFIG[notif.type];
    const Icon = cfg.icon;

    return (
        <div
            onClick={() => onSelect(notif.id)}
            className={`
                group relative flex cursor-pointer gap-3 border-b px-8 py-3.5
                transition-all duration-150 last:border-0
                ${selected ? "border-l-2 border-l-bright-blue bg-blue-50/70" : "border-l-2 border-l-transparent hover:bg-gray-50"}
                ${!notif.read && !selected ? "bg-white" : ""}
            `}
        >
            {!notif.read && (
                <span className="absolute left-3 top-1/2 size-2 flex-shrink-0 -translate-y-1/2 rounded-full bg-bright-blue" />
            )}
            <div className="mt-0.5 flex-shrink-0">
                {notif.actor ? (
                    <div className="relative">
                        <Avatar className="size-8">
                            <AvatarFallback
                                className={`text-[10px] font-bold text-white ${TEAM_COLORS[notif.actor]}`}
                            >
                                {notif.actor}
                            </AvatarFallback>
                        </Avatar>
                        <span
                            className={`absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full ${cfg.bg}`}
                        >
                            <Icon className={`size-2.5 ${cfg.text}`} />
                        </span>
                    </div>
                ) : (
                    <div
                        className={`flex size-8 items-center justify-center rounded-full ${cfg.bg}`}
                    >
                        <Icon className={`size-4 ${cfg.text}`} />
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p
                        className={`text-xs leading-snug ${notif.read ? "font-medium text-gray-500" : "font-semibold text-gray-800"}`}
                    >
                        {notif.title}
                    </p>
                    <span className="mt-0.5 flex-shrink-0 text-[10px] text-gray-400">
                        {timeAgo(notif.time)}
                    </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-gray-400">
                    {notif.body}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                    <span
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                        style={{
                            background: `${notif.projectColor}18`,
                            color: notif.projectColor,
                        }}
                    >
                        {notif.project}
                    </span>
                    {notif.pinned && (
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                    )}
                </div>
            </div>
            <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-md bg-gray-100 opacity-0 transition-opacity group-hover:opacity-100">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={(
                                e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                                e.stopPropagation();
                                onRead(notif.id);
                            }}
                            className="rounded p-1 transition-colors hover:bg-gray-200"
                        >
                            {notif.read ? (
                                <Circle className="size-3 text-gray-400" />
                            ) : (
                                <CheckCheck className="size-3 text-bright-blue" />
                            )}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                        {notif.read ? "Mark unread" : "Mark read"}
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={(
                                e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                                e.stopPropagation();
                                onPin(notif.id);
                            }}
                            className="rounded p-1 transition-colors hover:bg-gray-200"
                        >
                            <Star
                                className={`size-3 ${notif.pinned ? "fill-amber-400 text-amber-400" : "text-gray-400"}`}
                            />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                        {notif.pinned ? "Unpin" : "Pin"}
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={(
                                e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                                e.stopPropagation();
                                onArchive(notif.id);
                            }}
                            className="rounded p-1 transition-colors hover:bg-gray-200"
                        >
                            <Archive className="size-3 text-gray-400" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                        Archive
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={(
                                e: React.MouseEvent<HTMLButtonElement>,
                            ) => {
                                e.stopPropagation();
                                onDelete(notif.id);
                            }}
                            className="rounded p-1 transition-colors hover:bg-rose-100"
                        >
                            <Trash2 className="size-3 text-gray-400 hover:text-rose-500" />
                        </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                        Delete
                    </TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
}

interface DetailPanelProps {
    notif: Notification | null;
    onRead: (id: number) => void;
    onArchive: (id: number) => void;
    onDelete: (id: number) => void;
    onPin: (id: number) => void;
}

function DetailPanel({
    notif,
    onRead,
    onArchive,
    onDelete,
    onPin,
}: DetailPanelProps) {
    if (!notif) {
        return (
            <div className="flex flex-1 select-none flex-col items-center justify-center text-gray-300">
                <Bell className="mb-3 size-12 opacity-25" />
                <p className="text-sm font-semibold text-gray-400">
                    No notification selected
                </p>
                <p className="mt-1 text-xs text-gray-300">
                    Click a notification to read it here
                </p>
            </div>
        );
    }

    const cfg: TypeConfig = TYPE_CONFIG[notif.type];
    const Icon = cfg.icon;

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b px-8 py-4">
                <div className="flex items-center gap-2">
                    <span
                        className={`rounded-md px-2.5 py-1 text-xs font-bold ${cfg.bg} ${cfg.text} flex items-center gap-1.5`}
                    >
                        <Icon className="size-3" />
                        {cfg.label}
                    </span>
                    <span className="text-xs text-gray-400">
                        {timeAgo(notif.time)}
                    </span>
                    {notif.pinned && (
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onPin(notif.id)}
                                className="rounded-md p-2 transition-colors hover:bg-gray-100"
                            >
                                <Star
                                    className={`size-4 ${notif.pinned ? "fill-amber-400 text-amber-400" : "text-gray-400"}`}
                                />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {notif.pinned ? "Unpin" : "Pin"}
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onRead(notif.id)}
                                className="rounded-md p-2 transition-colors hover:bg-gray-100"
                            >
                                {notif.read ? (
                                    <Circle className="size-4 text-gray-400" />
                                ) : (
                                    <CheckCheck className="size-4 text-bright-blue" />
                                )}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>
                            {notif.read ? "Mark unread" : "Mark read"}
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onArchive(notif.id)}
                                className="rounded-md p-2 transition-colors hover:bg-gray-100"
                            >
                                <Archive className="size-4 text-gray-400" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Archive</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => onDelete(notif.id)}
                                className="rounded-md p-2 transition-colors hover:bg-rose-50"
                            >
                                <Trash2 className="size-4 text-gray-400 hover:text-rose-500" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                    </Tooltip>
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="px-8 py-6">
                    {notif.actor && (
                        <div className="mb-5 flex items-center gap-3">
                            <Avatar className="size-10">
                                <AvatarFallback
                                    className={`text-xs font-bold text-white ${TEAM_COLORS[notif.actor]}`}
                                >
                                    {notif.actor}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-semibold text-gray-800">
                                    {TEAM_NAMES[notif.actor]}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {new Date(notif.time).toLocaleDateString(
                                        "en-US",
                                        {
                                            weekday: "long",
                                            month: "long",
                                            day: "numeric",
                                        },
                                    )}
                                    {" · "}
                                    {new Date(notif.time).toLocaleTimeString(
                                        "en-US",
                                        { hour: "2-digit", minute: "2-digit" },
                                    )}
                                </p>
                            </div>
                        </div>
                    )}
                    <h2 className="mb-3 text-base font-bold leading-snug text-gray-800">
                        {notif.title}
                    </h2>
                    <div className="mb-5 rounded-md border bg-gray-50 p-4">
                        <p className="text-sm leading-relaxed text-gray-600">
                            {notif.body}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="w-20 text-xs font-semibold text-gray-400">
                                Project
                            </span>
                            <span
                                className="rounded-md px-2.5 py-1 text-xs font-semibold"
                                style={{
                                    background: `${notif.projectColor}18`,
                                    color: notif.projectColor,
                                }}
                            >
                                {notif.project}
                            </span>
                        </div>
                        {notif.task && (
                            <div className="flex items-center gap-3">
                                <span className="w-20 text-xs font-semibold text-gray-400">
                                    Task
                                </span>
                                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                    {notif.task}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <span className="w-20 text-xs font-semibold text-gray-400">
                                Type
                            </span>
                            <span
                                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
                            >
                                {cfg.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="w-20 text-xs font-semibold text-gray-400">
                                Status
                            </span>
                            <span
                                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${notif.read ? "bg-gray-100 text-gray-500" : "bg-blue-100 text-bright-blue"}`}
                            >
                                {notif.read ? "Read" : "Unread"}
                            </span>
                        </div>
                    </div>
                    {notif.action && (
                        <div className="mt-6">
                            <Button className="w-full gap-2 bg-bright-blue text-sm hover:bg-blue-600">
                                {notif.action}
                                <ArrowUpRight className="size-3.5" />
                            </Button>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}

export default function Notifications() {
    const [items, setItems] = useState<Notification[]>(initialNotifications);
    const [selectedId, setSelectedId] = useState<number | null>(1);
    const [tab, setTab] = useState<TabValue>("all");
    const [search, setSearch] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<NotificationType[]>([]);

    const unreadCount: number = items.filter(
        (n) => !n.read && !n.archived,
    ).length;
    const pinnedCount: number = items.filter(
        (n) => n.pinned && !n.archived,
    ).length;

    const mutate = (id: number, patch: Partial<Notification>): void =>
        setItems((prev) =>
            prev.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        );

    const markRead = (id: number): void => mutate(id, { read: true });

    const toggleRead = (id: number): void => {
        const current = items.find((n) => n.id === id);
        if (current) mutate(id, { read: !current.read });
    };

    const togglePin = (id: number): void => {
        const current = items.find((n) => n.id === id);
        if (current) mutate(id, { pinned: !current.pinned });
    };

    const archiveOne = (id: number): void => mutate(id, { archived: true });

    const deleteOne = (id: number): void => {
        setItems((prev) => prev.filter((n) => n.id !== id));
        if (selectedId === id) setSelectedId(null);
    };

    const markAllRead = (): void =>
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));

    const clearAll = (): void => {
        setItems((prev) => prev.filter((n) => n.pinned));
        setSelectedId(null);
    };

    const handleSelect = (id: number): void => {
        setSelectedId(id);
        markRead(id);
    };

    const filtered: Notification[] = useMemo(() => {
        return items.filter((n) => {
            if (tab === "unread" && (n.read || n.archived)) return false;
            if (tab === "pinned" && (!n.pinned || n.archived)) return false;
            if (tab === "archived" && !n.archived) return false;
            if (tab === "all" && n.archived) return false;
            if (typeFilter.length && !typeFilter.includes(n.type)) return false;
            if (
                search &&
                !n.title.toLowerCase().includes(search.toLowerCase()) &&
                !n.body.toLowerCase().includes(search.toLowerCase())
            )
                return false;
            return true;
        });
    }, [items, tab, typeFilter, search]);

    const grouped: NotificationGroup[] = groupByDate(filtered);
    const selected: Notification | null =
        items.find((n) => n.id === selectedId) ?? null;

    const toggleTypeFilter = (type: NotificationType): void =>
        setTypeFilter((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type],
        );

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-20 flex items-center gap-4 border-b bg-white px-8 py-4">
                <h1 className="text-xl font-semibold leading-none">
                    Notifications
                </h1>
                {unreadCount > 0 && (
                    <Badge className="h-5 bg-bright-blue px-2 text-xs text-white">
                        {unreadCount} new
                    </Badge>
                )}
                <div className="ml-auto flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllRead}
                                className="gap-1.5 text-xs text-gray-500 hover:text-bright-blue"
                            >
                                <CheckCheck className="size-3.5" /> Mark all
                                read
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Mark all as read</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAll}
                                className="gap-1.5 text-xs text-gray-500 hover:text-rose-500"
                            >
                                <Trash2 className="size-3.5" /> Clear all
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Clear all notifications</TooltipContent>
                    </Tooltip>
                    <Separator orientation="vertical" className="h-5" />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-400"
                            >
                                <Settings className="size-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Notification settings</TooltipContent>
                    </Tooltip>
                </div>
            </header>
            <div className="flex max-h-[calc(100svh-69px)] min-h-0 flex-1">
                <div className="flex w-[380px] flex-shrink-0 flex-col border-r bg-white">
                    <div className="px-8 pt-4">
                        <Tabs
                            value={tab}
                            onValueChange={(v) => setTab(v as TabValue)}
                        >
                            <TabsList className="h-9 w-full bg-gray-100 p-1">
                                <TabsTrigger
                                    value="all"
                                    className="h-7 flex-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    All
                                </TabsTrigger>
                                <TabsTrigger
                                    value="unread"
                                    className="h-7 flex-1 gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Unread
                                    {unreadCount > 0 && (
                                        <span className="flex size-4 items-center justify-center rounded-full bg-bright-blue text-[9px] font-bold text-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="pinned"
                                    className="h-7 flex-1 gap-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Pinned
                                    {pinnedCount > 0 && (
                                        <span className="text-[10px] font-bold text-amber-500">
                                            {pinnedCount}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger
                                    value="archived"
                                    className="h-7 flex-1 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm"
                                >
                                    Archive
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className="flex gap-2 px-8 pb-4 pt-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-gray-400" />
                            <Input
                                value={search}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) => setSearch(e.target.value)}
                                placeholder="Search notifications…"
                                className="h-8 pl-7 text-xs placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-bright-blue"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-2 top-1/2 -translate-y-1/2"
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
                                    className={`h-8 gap-1.5 px-2.5 text-xs ${typeFilter.length ? "border-blue-300 bg-blue-50 text-bright-blue" : "text-gray-500"}`}
                                >
                                    <SlidersHorizontal className="size-3" />
                                    {typeFilter.length
                                        ? `${typeFilter.length} types`
                                        : "Filter"}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel className="text-xs text-gray-500">
                                    Filter by type
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {(
                                    Object.entries(TYPE_CONFIG) as [
                                        NotificationType,
                                        TypeConfig,
                                    ][]
                                ).map(([key, cfg]) => {
                                    const Icon = cfg.icon;
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={key}
                                            checked={typeFilter.includes(key)}
                                            onCheckedChange={() =>
                                                toggleTypeFilter(key)
                                            }
                                            className="gap-2 text-xs"
                                        >
                                            <Icon
                                                className={`size-3.5 ${cfg.text}`}
                                            />
                                            {cfg.label}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                                {typeFilter.length > 0 && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => setTypeFilter([])}
                                            className="text-xs text-gray-400"
                                        >
                                            Clear filters
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <ScrollArea className="flex-1">
                        {grouped.length === 0 ? (
                            <div className="flex h-48 flex-col items-center justify-center border-t text-gray-300">
                                <Inbox className="mb-2 size-10 opacity-40" />
                                <p className="text-sm font-semibold text-gray-400">
                                    Nothing here
                                </p>
                                <p className="mt-0.5 text-xs">
                                    No notifications match your filters
                                </p>
                            </div>
                        ) : (
                            grouped.map(({ label, items: groupItems }) => (
                                <div key={label}>
                                    <div className="sticky top-0 z-10 border-y bg-gray-50/80 px-8 py-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            {label}
                                        </span>
                                    </div>
                                    {groupItems.map((n) => (
                                        <NotifRow
                                            key={n.id}
                                            notif={n}
                                            selected={selectedId === n.id}
                                            onSelect={handleSelect}
                                            onRead={toggleRead}
                                            onArchive={archiveOne}
                                            onDelete={deleteOne}
                                            onPin={togglePin}
                                        />
                                    ))}
                                </div>
                            ))
                        )}
                    </ScrollArea>
                    <div className="flex items-center justify-between border-t px-8 py-2.5">
                        <span className="text-xs text-gray-400">
                            {filtered.length} notification
                            {filtered.length !== 1 ? "s" : ""}
                        </span>
                        <button className="flex items-center gap-1 text-xs font-semibold text-bright-blue hover:text-blue-600">
                            <RefreshCw className="size-3" /> Refresh
                        </button>
                    </div>
                </div>
                <div className="flex min-h-0 flex-1 flex-col bg-white">
                    <DetailPanel
                        notif={selected}
                        onRead={toggleRead}
                        onArchive={archiveOne}
                        onDelete={deleteOne}
                        onPin={togglePin}
                    />
                </div>
            </div>
        </div>
    );
}
