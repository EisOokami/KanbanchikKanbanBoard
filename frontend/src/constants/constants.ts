import { Column, Priority, PriorityConfig, Role, Status } from "@/types/types";

export const COLUMNS_CONFIG: Pick<
    Column,
    "id" | "name" | "position" | "wip_limit"
>[] = [
    {
        id: 1,
        name: "To Do",
        position: 0,
        wip_limit: null,
    },
    {
        id: 2,
        name: "In Progress",
        position: 1,
        wip_limit: null,
    },
    {
        id: 3,
        name: "In Review",
        position: 2,
        wip_limit: null,
    },
    {
        id: 4,
        name: "Done",
        position: 3,
        wip_limit: null,
    },
];

export const PRIORITY_CONFIG: Record<Priority, PriorityConfig> = {
    critical: {
        id: 1,
        label: "Critical",
        order: 0,
        color: "#fb7185",
        emoji: "🔥",
    },
    high: {
        id: 2,
        label: "High",
        order: 1,
        color: "#fb923c",
        emoji: "⚡",
    },
    medium: {
        id: 3,
        label: "Medium",
        order: 2,
        color: "#60a5fa",
        emoji: "📌",
    },
    low: {
        id: 4,
        label: "Low",
        order: 3,
        color: "#22c55e",
        emoji: "💤",
    },
};

export const STATUS_CONFIG: Record<Status, { label: string; dot: string }> = {
    active: { label: "Active", dot: "#10b981" },
    paused: { label: "Paused", dot: "#fbbf24" },
    completed: { label: "Completed", dot: "#60a5fa" },
    archived: { label: "Archived", dot: "#94a3b8" },
};

export const ROLES: Role[] = ["admin", "member", "owner", "viewer"];

export const ROLE_META: Record<
    Role,
    {
        label: string;
        activeClass: string;
    }
> = {
    owner: {
        label: "Owner",
        activeClass:
            "border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    },
    admin: {
        label: "Admin",
        activeClass:
            "border-lime-300 bg-lime-100 text-lime-700 dark:border-lime-700 dark:bg-lime-950/50 dark:text-lime-300",
    },
    member: {
        label: "Member",
        activeClass:
            "border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    },
    viewer: {
        label: "Viewer",
        activeClass:
            "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    },
};

export const WEEKDAYS = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
] as const;

export const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;

export const PRIORITY_ORDER: Record<Priority, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
};
