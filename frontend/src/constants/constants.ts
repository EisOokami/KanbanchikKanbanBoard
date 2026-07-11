import {
    Column,
    User,
    Priority,
    PriorityConfig,
    Role,
    Status,
} from "@/types/types";

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
    User["role"],
    { label: string; color: string; bg: string; border: string }
> = {
    owner: {
        label: "Owner",
        color: "#7C5CBF",
        bg: "#EDE9FD",
        border: "#D3CBF8",
    },
    admin: {
        label: "Admin",
        color: "#91A211",
        bg: "#EDE3FA",
        border: "#AEDF7F",
    },
    member: {
        label: "Editor",
        color: "#1A6BBF",
        bg: "#EEF4FD",
        border: "#BDD5F5",
    },
    viewer: {
        label: "Viewer",
        color: "#1E7E3A",
        bg: "#EEFAF2",
        border: "#AEDFC0",
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
